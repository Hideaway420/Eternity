// ponytail: no next/headers or next/server imports here — this module must load in Edge middleware too.
export const ADMIN_COOKIE = "eternity_admin_session";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const encoder = new TextEncoder();

// ponytail: Web Crypto, not node:crypto, so the same verify runs in Edge middleware and Node handlers.
async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function toBase64Url(bytes: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(value: string): ArrayBuffer {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const buffer = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i += 1) view[i] = binary.charCodeAt(i);
  return buffer;
}

/** Signs a session token that expires SESSION_TTL_MS from now. Returns null if no secret is configured. */
export async function signSession(secret = process.env.ADMIN_SESSION_SECRET): Promise<string | null> {
  if (!secret) return null;
  const expiresAt = String(Date.now() + SESSION_TTL_MS);
  const signature = await crypto.subtle.sign("HMAC", await hmacKey(secret), encoder.encode(expiresAt));
  return `${expiresAt}.${toBase64Url(signature)}`;
}

/** Verifies signature and expiry. Fails closed when the secret is unset or the token is malformed. */
export async function verifySession(
  token: string | undefined,
  secret = process.env.ADMIN_SESSION_SECRET
): Promise<boolean> {
  if (!token || !secret) return false;

  const separator = token.lastIndexOf(".");
  if (separator < 1) return false;

  const expiresAt = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  if (!/^\d+$/.test(expiresAt) || Number(expiresAt) < Date.now()) return false;

  try {
    return await crypto.subtle.verify(
      "HMAC",
      await hmacKey(secret),
      fromBase64Url(signature),
      encoder.encode(expiresAt)
    );
  } catch {
    return false;
  }
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_TTL_MS / 1000,
};
