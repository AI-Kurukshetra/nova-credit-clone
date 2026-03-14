import { NextRequest } from "next/server";

import { fail, getRequestMeta, ok, optionsResponse } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { idParamSchema } from "@/lib/validations";

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST(request: NextRequest) {
  const meta = getRequestMeta();

  try {
    const body = await request.json();
    const validation = idParamSchema.safeParse({ id: body.user_id });
    if (!validation.success) {
      return fail("Invalid user ID", meta, 400);
    }

    const userId = validation.data.id;
    const supabase = createServiceRoleClient();

    // 1. Delete from public.users (cascades to credit_profiles, documents, etc.)
    const { error: publicDeleteError } = await supabase
      .from("users")
      .delete()
      .eq("id", userId);

    if (publicDeleteError) {
      console.error("[CreditBridge] public.users delete error:", publicDeleteError);
      // Continue anyway — the auth user should still be deleted
    }

    // 2. Delete from auth.users using admin API
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId);

    if (authDeleteError) {
      console.error("[CreditBridge] auth.users delete error:", authDeleteError);
      await createAuditLog({
        userId: null,
        action: "api.me.delete.auth_error",
        entityType: "user",
        entityId: userId,
        metadata: { request_id: meta.request_id, error: authDeleteError.message },
      });
      return fail("Failed to delete auth account: " + authDeleteError.message, meta, 500);
    }

    // 3. Audit log
    await createAuditLog({
      userId: null,
      action: "api.me.delete.hard_delete",
      entityType: "user",
      entityId: userId,
      metadata: { request_id: meta.request_id },
    });

    return ok({ deleted: true, user_id: userId }, meta);
  } catch (error) {
    console.error("[CreditBridge] Delete account error:", error);
    await createAuditLog({
      userId: null,
      action: "api.me.delete.error",
      entityType: "user",
      metadata: { request_id: meta.request_id },
    });
    return fail("Something went wrong. Please try again.", meta, 500);
  }
}
