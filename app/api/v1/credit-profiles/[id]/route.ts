import { NextRequest } from "next/server";

import { authenticateApiKey } from "@/lib/api-auth";
import { fail, getRequestMeta, ok, optionsResponse } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";
import { maskConsumerName } from "@/lib/format";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { idParamSchema } from "@/lib/validations";

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
          route: "/api/v1/credit-profiles/[id]",
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
        action: "api.credit_profiles.get.validation_failed",
        entityType: "credit_profile",
        metadata: {
          request_id: meta.request_id,
        },
      });
      return fail("Invalid profile ID", meta, 400);
    }

    const supabase = createServiceRoleClient();

    const { data: linkedApplication } = await supabase
      .from("credit_applications")
      .select("id")
      .eq("profile_id", validatedParams.data.id)
      .eq("lender_id", auth.lenderId)
      .maybeSingle();

    if (!linkedApplication) {
      await createAuditLog({
        userId: lenderUserId,
        action: "api.credit_profiles.get.not_found",
        entityType: "credit_profile",
        entityId: validatedParams.data.id,
        metadata: {
          request_id: meta.request_id,
        },
      });
      return fail("Profile not found", meta, 404);
    }

    const { data: profile, error } = await supabase
      .from("credit_profiles")
      .select(
        `
        id,
        user_id,
        foreign_score,
        foreign_score_max,
        translated_score,
        risk_tier,
        status,
        score_breakdown,
        created_at,
        updated_at,
        users!inner(full_name,email),
        countries!inner(name,code,bureau_name),
        risk_assessments(flags,recommendation)
      `,
      )
      .eq("id", validatedParams.data.id)
      .single();

    if (error || !profile) {
      await createAuditLog({
        userId: lenderUserId,
        action: "api.credit_profiles.get.not_found",
        entityType: "credit_profile",
        entityId: validatedParams.data.id,
        metadata: {
          request_id: meta.request_id,
        },
      });
      return fail("Profile not found", meta, 404);
    }

    const user = Array.isArray(profile.users) ? profile.users[0] : profile.users;
    const country = Array.isArray(profile.countries)
      ? profile.countries[0]
      : profile.countries;
    const riskAssessment = Array.isArray(profile.risk_assessments)
      ? profile.risk_assessments[0]
      : profile.risk_assessments;

    await createAuditLog({
      userId: lenderUserId,
      action: "api.credit_profiles.get",
      entityType: "credit_profile",
      entityId: validatedParams.data.id,
      metadata: {
        request_id: meta.request_id,
      },
    });

    return ok(
      {
        id: profile.id,
        consumer_name: maskConsumerName(user?.full_name),
        home_country: country,
        foreign_score: profile.foreign_score,
        foreign_score_max: profile.foreign_score_max,
        translated_score: profile.translated_score,
        risk_tier: profile.risk_tier,
        status: profile.status,
        score_breakdown: profile.score_breakdown,
        flags: riskAssessment?.flags ?? [],
        recommendation: riskAssessment?.recommendation ?? null,
        updated_at: profile.updated_at,
      },
      meta,
    );
  } catch {
    await createAuditLog({
      userId: lenderUserId,
      action: "api.credit_profiles.get.error",
      entityType: "credit_profile",
      metadata: {
        request_id: meta.request_id,
      },
    });
    return fail("Something went wrong. Please try again.", meta, 500);
  }
}
