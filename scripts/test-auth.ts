/**
 * Self-check for the admin session signing path.
 * Run: npx tsx scripts/test-auth.ts
 */
import assert from "node:assert/strict";
import { signSession, verifySession } from "../src/lib/session";

const SECRET = "test-secret-do-not-use";
const OTHER = "a-different-secret";

async function main() {
  const token = await signSession(SECRET);
  assert.ok(token, "signSession must return a token when a secret is set");

  assert.equal(await verifySession(token, SECRET), true, "a freshly signed token must verify");
  assert.equal(await verifySession(token, OTHER), false, "a token must not verify under a different secret");

  // No secret configured anywhere: fail closed, never open.
  assert.equal(await signSession(undefined), null, "signSession must refuse without a secret");
  assert.equal(await verifySession(token, undefined), false, "verifySession must fail closed without a secret");
  assert.equal(await verifySession(undefined, SECRET), false, "missing token must not verify");

  // The old static cookie values must be worthless now.
  assert.equal(await verifySession("authenticated_staff_owner", SECRET), false, "legacy static token must be rejected");
  assert.equal(await verifySession("admin_secret_token_eternity_2026", SECRET), false, "legacy static token must be rejected");

  // Tampering with either half must fail.
  const [expiresAt, signature] = token!.split(".");
  assert.equal(await verifySession(`${expiresAt}.${signature}x`, SECRET), false, "tampered signature must fail");
  assert.equal(
    await verifySession(`${Number(expiresAt) + 60_000}.${signature}`, SECRET),
    false,
    "extending the expiry without resigning must fail"
  );

  // Expired tokens are rejected even with a valid signature.
  const past = String(Date.now() - 1000);
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(past));
  const expiredToken = `${past}.${btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")}`;
  assert.equal(await verifySession(expiredToken, SECRET), false, "expired token must be rejected");

  // Malformed input must not throw.
  for (const bad of ["", ".", "abc", "...", "notanumber.sig"]) {
    assert.equal(await verifySession(bad, SECRET), false, `malformed token ${JSON.stringify(bad)} must be rejected`);
  }

  console.log("auth self-check: all assertions passed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
