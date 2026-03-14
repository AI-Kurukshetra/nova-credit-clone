import { verifyApiKey } from "@/lib/security";
import { createServiceRoleClient } from "@/lib/supabase/server";

export interface ApiAuthContext {
  lenderId: string;
  lenderUserId: string | null;
  apiKeyId: string;
}

function extractBearerToken(header: string | null): string | null {
  if (!header) {
    return null;
  }
  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) {
    return null;
  }
  return token.trim();
}

export async function authenticateApiKey(
  authHeader: string | null,
): Promise<ApiAuthContext | null> {
  const token = extractBearerToken(authHeader);
  if (!token) {
    return null;
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("api_keys")
    .select("id,lender_id,key_hash,active,lenders!inner(user_id)")
    .eq("active", true);

  if (error || !data) {
    return null;
  }

  const match = data.find((item) => verifyApiKey(token, item.key_hash));
  if (!match) {
    return null;
  }

  await supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", match.id);

  const lenderRelation = Array.isArray(match.lenders)
    ? match.lenders[0]
    : match.lenders;

  return {
    lenderId: match.lender_id,
    lenderUserId: lenderRelation?.user_id ?? null,
    apiKeyId: match.id,
  };
}
