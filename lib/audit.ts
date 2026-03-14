import { createServiceRoleClient } from "@/lib/supabase/server";

interface AuditLogPayload {
  userId: string | null;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}

const SENSITIVE_KEYS = new Set([
  "password",
  "credit_report",
  "passport_number",
  "file_url",
  "raw_data",
  "processed_data",
]);

function sanitizeMetadata(metadata?: Record<string, unknown>): Record<string, unknown> {
  if (!metadata) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(metadata).filter(([key]) => !SENSITIVE_KEYS.has(key)),
  );
}

export async function createAuditLog({
  userId,
  action,
  entityType = null,
  entityId = null,
  metadata,
}: AuditLogPayload): Promise<void> {
  const supabase = createServiceRoleClient();
  await supabase.from("audit_logs").insert({
    user_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata: sanitizeMetadata(metadata),
  });
}
