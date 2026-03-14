import { NextRequest } from "next/server";

import { authenticateApiKey } from "@/lib/api-auth";
import { fail, getRequestMeta, ok, optionsResponse } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { idParamSchema } from "@/lib/validations";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(request: NextRequest) {
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
          route: "/api/v1/me/export",
          request_id: meta.request_id,
        },
      });
      return fail("Invalid or missing API key", meta, 401);
    }
    lenderUserId = auth.lenderUserId;

    const userId = request.nextUrl.searchParams.get("user_id");
    const validation = idParamSchema.safeParse({ id: userId });
    if (!validation.success) {
      await createAuditLog({
        userId: lenderUserId,
        action: "api.me.export.validation_failed",
        entityType: "user",
        metadata: {
          request_id: meta.request_id,
        },
      });
      return fail("Invalid user ID", meta, 400);
    }

    const supabase = createServiceRoleClient();

    const { data: user } = await supabase
      .from("users")
      .select("id,email,role,full_name,metadata,deleted_at,created_at")
      .eq("id", validation.data.id)
      .maybeSingle();

    if (!user) {
      await createAuditLog({
        userId: lenderUserId,
        action: "api.me.export.not_found",
        entityType: "user",
        entityId: validation.data.id,
        metadata: {
          request_id: meta.request_id,
        },
      });
      return fail("User not found", meta, 404);
    }

    const { data: profiles } = await supabase
      .from("credit_profiles")
      .select("*")
      .eq("user_id", user.id);

    const profileIds = profiles?.map((profile) => profile.id) ?? [];

    const [{ data: documents }, { data: riskAssessments }, { data: reports }, { data: applications }] =
      await Promise.all([
        supabase.from("documents").select("*").eq("user_id", user.id),
        profileIds.length
          ? supabase.from("risk_assessments").select("*").in("profile_id", profileIds)
          : Promise.resolve({ data: [] as unknown[] }),
        profileIds.length
          ? supabase
              .from("international_credit_reports")
              .select("*")
              .in("profile_id", profileIds)
          : Promise.resolve({ data: [] as unknown[] }),
        profileIds.length
          ? supabase.from("credit_applications").select("*").in("profile_id", profileIds)
          : Promise.resolve({ data: [] as unknown[] }),
      ]);

    await createAuditLog({
      userId: lenderUserId,
      action: "api.me.export",
      entityType: "user",
      entityId: validation.data.id,
      metadata: {
        request_id: meta.request_id,
      },
    });

    return ok(
      {
        user,
        profiles: profiles ?? [],
        documents: documents ?? [],
        risk_assessments: riskAssessments ?? [],
        international_credit_reports: reports ?? [],
        credit_applications: applications ?? [],
      },
      meta,
    );
  } catch {
    await createAuditLog({
      userId: lenderUserId,
      action: "api.me.export.error",
      entityType: "user",
      metadata: {
        request_id: meta.request_id,
      },
    });
    return fail("Something went wrong. Please try again.", meta, 500);
  }
}
