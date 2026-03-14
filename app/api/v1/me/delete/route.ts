import { NextRequest } from "next/server";

import { authenticateApiKey } from "@/lib/api-auth";
import { fail, getRequestMeta, ok, optionsResponse } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { idParamSchema } from "@/lib/validations";

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
          route: "/api/v1/me/delete",
          request_id: meta.request_id,
        },
      });
      return fail("Invalid or missing API key", meta, 401);
    }
    lenderUserId = auth.lenderUserId;

    const body = await request.json();
    const validation = idParamSchema.safeParse({ id: body.user_id });
    if (!validation.success) {
      await createAuditLog({
        userId: lenderUserId,
        action: "api.me.delete.validation_failed",
        entityType: "user",
        metadata: {
          request_id: meta.request_id,
        },
      });
      return fail("Invalid user ID", meta, 400);
    }

    const deletedAt = new Date().toISOString();
    const supabase = createServiceRoleClient();

    const { data: updated } = await supabase
      .from("users")
      .update({ deleted_at: deletedAt })
      .eq("id", validation.data.id)
      .select("id,deleted_at")
      .maybeSingle();

    if (!updated) {
      await createAuditLog({
        userId: lenderUserId,
        action: "api.me.delete.not_found",
        entityType: "user",
        entityId: validation.data.id,
        metadata: {
          request_id: meta.request_id,
        },
      });
      return fail("User not found", meta, 404);
    }

    await createAuditLog({
      userId: lenderUserId,
      action: "api.me.delete",
      entityType: "user",
      entityId: validation.data.id,
      metadata: {
        request_id: meta.request_id,
      },
    });

    return ok(updated, meta);
  } catch {
    await createAuditLog({
      userId: lenderUserId,
      action: "api.me.delete.error",
      entityType: "user",
      metadata: {
        request_id: meta.request_id,
      },
    });
    return fail("Something went wrong. Please try again.", meta, 500);
  }
}
