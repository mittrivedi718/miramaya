// Site-wide "view password" gate.
//
// This is the FIRST of two locks on the site:
//   1. View gate (this file)  -> one shared password required just to SEE the site.
//   2. Owner login (/admin)   -> your personal email + password required to EDIT.
//
// The shared password lives only in the SITE_GATE_PASSWORD environment variable.
// We never put the password itself in the browser cookie. Instead we store a
// signed token derived from BETTER_AUTH_SECRET, so a visitor cannot forge access
// without knowing the server secret.
//
// This module is written to be Edge-safe (Web Crypto only) so it can run inside
// middleware.ts as well as in normal server code.

export const GATE_COOKIE = "mm_site_access"
const GATE_MESSAGE = "miramaya-site-access-v1"

/** True only when a view password has actually been configured. */
export function isGateEnabled(): boolean {
  return Boolean(process.env.SITE_GATE_PASSWORD && process.env.BETTER_AUTH_SECRET)
}

function toBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

/** The value we expect the access cookie to hold when the visitor is allowed in. */
export async function gateToken(): Promise<string> {
  const secret = process.env.BETTER_AUTH_SECRET ?? ""
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(GATE_MESSAGE))
  return toBase64Url(signature)
}

/** Length-safe string comparison so we don't leak timing information. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return mismatch === 0
}

/**
 * Only allow redirects back to same-site absolute paths (e.g. "/store/mira").
 * This blocks "open redirect" attacks where ?from=https://evil.com would send
 * a visitor off to another website after unlocking.
 */
export function sanitizeReturnPath(input: string | null | undefined): string {
  if (!input) return "/"
  if (!input.startsWith("/") || input.startsWith("//")) return "/"
  if (input.startsWith("/enter")) return "/"
  return input
}
