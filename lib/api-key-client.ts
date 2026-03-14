const API_KEY_PREFIX = "cb_live_";

export interface GeneratedApiKey {
  key: string;
  keyPrefix: string;
}

function randomHex(lengthInBytes: number): string {
  const bytes = new Uint8Array(lengthInBytes);

  if (typeof globalThis.crypto?.getRandomValues === "function") {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function generateClientApiKey(): GeneratedApiKey {
  const key = `${API_KEY_PREFIX}${randomHex(24)}`;
  return {
    key,
    keyPrefix: key.slice(0, 8),
  };
}
