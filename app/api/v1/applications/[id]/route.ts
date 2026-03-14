import { NextRequest } from "next/server";

import { authenticateApiKey } from "@/lib/api-auth";
import { fail, getRequestMeta, ok, optionsResponse } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { idParamSchema, updateApplicationSchema } from "@/lib/validations";
import { deliverWebhook } from "@/lib/webhooks";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const meta = getRequestMeta();
  let lenderUserId: string | null = null;

  try {
    const auth = await authenticateApiKey(request.headers.get("Authorization"));
    if (!auth) {
      await createAuditLog({
        userId: null,
        action: "api.auth.failed",
        entityType: "api_route",
        metadata: {
          route: "/api/v1/applications/[id]",
          request_id: meta.request_id,
        },
      });
      return fail("Invalid or missing API key", meta, 401);
    }
    lenderUserId = auth.lenderUserId;

    const params = await context.params;
    const validatedParams = idParamSchema.safeParse(params);
    if (!validatedParams.success) {
      await createAuditLog({
        userId: lenderUserId,
        action: "api.applications.get.validation_failed",
        entityType: "credit_application",
        metadata: {
          request_id: meta.request_id,
        },
      });
      return fail("Invalid application ID", meta, 400);
    }

    const supabase = createServiceRoleClient();

    const { data: application } = await supabase
      .from("credit_applications")
      .select(
        `
        id,
        status,
        lender_notes,
        recommendation,
        decision_at,
        created_at,
        credit_profiles!inner(
          id,
          translated_score,
          risk_tier,
          score_breakdown,
          countries!inner(code,name)
        )
      `,
      )
      .eq("id", validatedParams.data.id)
      .eq("lender_id", auth.lenderId)
      .maybeSingle();

    if (!application) {
      await createAuditLog({
        userId: lenderUserId,
        action: "api.applications.get.not_found",
        entityType: "credit_application",
        entityId: validatedParams.data.id,
        metadata: {
          request_id: meta.request_id,
        },
      });
      return fail("Application not found", meta, 404);
    }

    const profile = Array.isArray(application.credit_profiles)
      ? application.credit_profiles[0]
      : application.credit_profiles;
    const country = profile
      ? Array.isArray(profile.countries)
        ? profile.countries[0]
        : profile.countries
      : null;

    await createAuditLog({
      userId: lenderUserId,
      action: "api.applications.get",
      entityType: "credit_application",
      entityId: application.id,
      metadata: {
        request_id: meta.request_id,
      },
    });

    return ok(
      {
        id: application.id,
        status: application.status,
        lender_notes: application.lender_notes,
        recommendation: application.recommendation,
        decision_at: application.decision_at,
        created_at: application.created_at,
        consumer_score_summary: {
          profile_id: profile?.id ?? null,
          translated_score: profile?.translated_score ?? null,
          risk_tier: profile?.risk_tier ?? null,
          score_breakdown: profile?.score_breakdown ?? null,
          country,
        },
      },
      meta,
    );
  } catch {
    await createAuditLog({
      userId: lenderUserId,
      action: "api.applications.get.error",
      entityType: "credit_application",
      metadata: {
        request_id: meta.request_id,
      },
    });
    return fail("Something went wrong. Please try again.", meta, 500);
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const meta = getRequestMeta();
  let lenderUserId: string | null = null;

  try {
    const auth = await authenticateApiKey(request.headers.get("Authorization"));
    if (!auth) {
      await createAuditLog({
        userId: null,
        action: "api.auth.failed",
        entityType: "api_route",
        metadata: {
          route: "/api/v1/applications/[id]",
          request_id: meta.request_id,
        },
      });
      return fail("Invalid or missing API key", meta, 401);
    }
    lenderUserId = auth.lenderUserId;

    const params = await context.params;
    const validatedParams = idParamSchema.safeParse(params);
    if (!validatedParams.success) {
      await createAuditLog({
        userId: lenderUserId,
        action: "api.applications.update.validation_failed",
        entityType: "credit_application",
        metadata: {
          request_id: meta.request_id,
        },
      });
      return fail("Invalid application ID", meta, 400);
    }

    const body = await request.json();
    const parsedBody = updateApplicationSchema.safeParse(body);
    if (!parsedBody.success) {
      await createAuditLog({
        userId: lenderUserId,
        action: "api.applications.update.validation_failed",
        entityType: "credit_application",
        entityId: validatedParams.data.id,
        metadata: {
          request_id: meta.request_id,
        },
      });
      return fail("Invalid request payload", meta, 400);
    }

    const supabase = createServiceRoleClient();

    const decisionMade = ["approved", "denied", "more_info_requested"].includes(
      parsedBody.data.status,
    );

    const { data: updatedApplication } = await supabase
      .from("credit_applications")
      .update({
        status: parsedBody.data.status,
        lender_notes: parsedBody.data.lender_notes ?? null,
        decision_at: decisionMade ? new Date().toISOString() : null,
      })
      .eq("id", validatedParams.data.id)
      .eq("lender_id", auth.lenderId)
      .select("*")
      .maybeSingle();

    if (!updatedApplication) {
      await createAuditLog({
        userId: lenderUserId,
        action: "api.applications.update.not_found",
        entityType: "credit_application",
        entityId: validatedParams.data.id,
        metadata: {
          request_id: meta.request_id,
        },
      });
      return fail("Application not found", meta, 404);
    }

    await createAuditLog({
      userId: lenderUserId,
      action: "api.applications.update",
      entityType: "credit_application",
      entityId: updatedApplication.id,
      metadata: {
        request_id: meta.request_id,
        status: parsedBody.data.status,
      },
    });

    await deliverWebhook(auth.lenderId, "application.decision_made", {
      application_id: updatedApplication.id,
      status: parsedBody.data.status,
      timestamp: new Date().toISOString(),
    });

    return ok(updatedApplication, meta);
  } catch {
    await createAuditLog({
      userId: lenderUserId,
      action: "api.applications.update.error",
      entityType: "credit_application",
      metadata: {
        request_id: meta.request_id,
      },
    });
    return fail("Something went wrong. Please try again.", meta, 500);
  }
}
