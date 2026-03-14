import { NextRequest } from "next/server";

import { authenticateApiKey } from "@/lib/api-auth";
import { fail, getRequestMeta, ok, optionsResponse } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { createApplicationSchema } from "@/lib/validations";
import { deliverWebhook } from "@/lib/webhooks";

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST(request: NextRequest) {
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
          route: "/api/v1/applications",
          request_id: meta.request_id,
        },
      });
      return fail("Invalid or missing API key", meta, 401);
    }
    lenderUserId = auth.lenderUserId;

    const body = await request.json();
    const parsedBody = createApplicationSchema.safeParse(body);

    if (!parsedBody.success) {
      await createAuditLog({
        userId: lenderUserId,
        action: "api.applications.create.validation_failed",
        entityType: "credit_application",
        metadata: {
          request_id: meta.request_id,
        },
      });
      return fail("Invalid request payload", meta, 400);
    }

    const supabase = createServiceRoleClient();

    const { data: profile } = await supabase
      .from("credit_profiles")
      .select("id")
      .eq("id", parsedBody.data.profile_id)
      .maybeSingle();

    if (!profile) {
      await createAuditLog({
        userId: lenderUserId,
        action: "api.applications.create.profile_not_found",
        entityType: "credit_profile",
        entityId: parsedBody.data.profile_id,
        metadata: {
          request_id: meta.request_id,
        },
      });
      return fail("Profile not found", meta, 404);
    }

    const { data: createdApplication, error } = await supabase
      .from("credit_applications")
      .insert({
        profile_id: parsedBody.data.profile_id,
        lender_id: auth.lenderId,
        status: "submitted",
        lender_notes: parsedBody.data.lender_notes ?? null,
      })
      .select("*")
      .single();

    if (error || !createdApplication) {
      await createAuditLog({
        userId: lenderUserId,
        action: "api.applications.create.failed",
        entityType: "credit_application",
        metadata: {
          request_id: meta.request_id,
        },
      });
      return fail("Unable to create application", meta, 400);
    }

    await createAuditLog({
      userId: auth.lenderUserId,
      action: "api.applications.create",
      entityType: "credit_application",
      entityId: createdApplication.id,
      metadata: {
        request_id: meta.request_id,
      },
    });

    await deliverWebhook(auth.lenderId, "application.submitted", {
      application_id: createdApplication.id,
      profile_id: createdApplication.profile_id,
      status: createdApplication.status,
      timestamp: new Date().toISOString(),
    });

    return ok(createdApplication, meta, 201);
  } catch {
    await createAuditLog({
      userId: lenderUserId,
      action: "api.applications.create.error",
      entityType: "credit_application",
      metadata: {
        request_id: meta.request_id,
      },
    });
    return fail("Something went wrong. Please try again.", meta, 500);
  }
}
