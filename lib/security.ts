import crypto from "crypto";

const API_KEY_PREFIX = "cb_live_";

export function hashApiKey(apiKey: string, salt?: string): string {
  const resolvedSalt = salt ?? crypto.randomBytes(16).toString("hex");
  const digest = crypto
    .createHash("sha256")
    .update(`${resolvedSalt}:${apiKey}`)
    .digest("hex");
  return `${resolvedSalt}:${digest}`;
}

export function verifyApiKey(apiKey: string, keyHash: string): boolean {
  const [salt, storedHash] = keyHash.split(":");
  if (!salt || !storedHash) {
    return false;
  }
  const digest = crypto
    .createHash("sha256")
    .update(`${salt}:${apiKey}`)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(storedHash), Buffer.from(digest));
}

export function generateApiKey(): { key: string; keyPrefix: string } {
  const random = crypto.randomBytes(24).toString("hex");
  const key = `${API_KEY_PREFIX}${random}`;
  const keyPrefix = key.slice(0, 8);
  return { key, keyPrefix };
}

export function signWebhookPayload(
  payload: Record<string, unknown>,
  secret: string,
): string {
  return crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(payload))
    .digest("hex");
}
