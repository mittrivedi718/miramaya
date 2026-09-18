// Edge-safe viewer cookie signing. NO next/headers import here, so the Edge proxy
// can import this module. Cookie WRITING happens in Node (server actions / route
// handlers) via next/headers; this file only builds and verifies the signed value.
//
// The session cookie is self-validating: it carries the raw session token and the
// expiry, signed with BETTER_AUTH_SECRET (the same secret the existing gate uses).
// The Edge proxy verifies signature + expiry with zero database access. Revocation
// is enforced separately in Node against the database (the real authority).

const PROD = process.env.NODE_ENV === "production"

// __Host- prefix (prod) hard-binds the cookie to this exact host with Secure +
// Path=/ and no Domain, which blocks subdomain cookie injection.
export const VIEWER_COOKIE = PROD ? "__Host-mm_pv" : "mm_pv"
// Display-only expiry (epoch ms). NOT HttpOnly — it only drives the visible timer.
export const VIEWER_EXP_COOKIE = "mm_pv_exp"

const SIGN_MESSAGE = "miramaya-private-view-v1"

function toBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

async function sign(payload: string): Promise<string> {
  const secret = process.env.BETTER_AUTH_SECRET ?? ""
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload))
  return toBase64Url(signature)
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return mismatch === 0
}

/** Build the signed cookie value: `<sessionToken>.<expMs>.<sig>`. */
export async function buildViewerValue(sessionToken: string, expiresAtMs: number): Promise<string> {
  const payload = `${SIGN_MESSAGE}|${sessionToken}|${expiresAtMs}`
  const sig = await sign(payload)
  return `${sessionToken}.${expiresAtMs}.${sig}`
}

export type ViewerCookie = { ok: true; sessionToken: string; expiresAtMs: number } | { ok: false }

/** Verify signature and expiry with no database access. Edge-safe. */
export async function verifyViewerValue(value: string | undefined): Promise<ViewerCookie> {
  if (!value) return { ok: false }
  const parts = value.split(".")
  if (parts.length !== 3) return { ok: false }
  const [sessionToken, expRaw, sig] = parts
  if (!/^[A-Za-z0-9_-]{43}$/.test(sessionToken)) return { ok: false }
  const expiresAtMs = Number(expRaw)
  if (!Number.isFinite(expiresAtMs)) return { ok: false }
  const expected = await sign(`${SIGN_MESSAGE}|${sessionToken}|${expiresAtMs}`)
  if (!safeEqual(sig, expected)) return { ok: false }
  if (expiresAtMs <= Date.now()) return { ok: false }
  return { ok: true, sessionToken, expiresAtMs }
}
