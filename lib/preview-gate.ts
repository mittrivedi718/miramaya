// Doll Invasion 2026 — private preview gate.
//
// This is a THIRD, deliberately weaker lock that lives beside the existing two:
//   1. View gate  (lib/site-gate.ts) -> full site access. UNCHANGED by this file.
//   2. Owner login (/admin)          -> edit access.      UNCHANGED by this file.
//   3. Preview gate (this file)      -> ONLY /preview/doll-invasion.
//
// A preview session can never see the rest of the site: proxy.ts sends preview-only
// visitors back to the preview page. The passphrase itself never reaches the browser
// (it is compared inside a server action) and the cookie holds an HMAC token derived
// from BETTER_AUTH_SECRET, so it cannot be forged.
//
// Edge-safe: Web Crypto only, so proxy.ts can import it.

export const PREVIEW_COOKIE = "mm_doll_preview"
export const PREVIEW_PATH = "/preview/doll-invasion"
const PREVIEW_MESSAGE = "miramaya-doll-invasion-preview-v1"

/**
 * Normalize a passphrase so "  Doll Invasion 26 " === "doll invasion 26".
 * Trims, lowercases, and collapses runs of whitespace to a single space.
 */
function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ")
}

/**
 * Passphrases that unlock the preview. The launch phrase is baked in so the
 * preview works before any env var is set; DOLL_INVASION_PASSWORD (if present)
 * is also accepted, which is how you rotate it later without a code change.
 */
export function acceptedPreviewPasswords(): string[] {
  const configured = process.env.DOLL_INVASION_PASSWORD?.trim()
  // The page is titled "Doll Invasion 2026", so people naturally type the full
  // year. Both forms are accepted: guessing the year wrong is not a security
  // boundary, and a locked-out invited guest is the real failure here.
  const base = ["doll invasion 26", "doll invasion 2026"]
  if (!configured) return base
  const extra = normalize(configured)
  return base.includes(extra) ? base : [extra, ...base]
}

/** True when the entered phrase unlocks the preview (case/whitespace-insensitive). */
export function isPreviewPassword(entered: string): boolean {
  const candidate = normalize(entered)
  if (!candidate) return false
  // Compared against normalized values, so a length check is not a secret leak.
  return acceptedPreviewPasswords().some((expected) => timingSafeEqual(candidate, expected))
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return mismatch === 0
}

function toBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

/** The value the preview cookie must hold for a valid preview session. */
export async function previewToken(): Promise<string> {
  const secret = process.env.BETTER_AUTH_SECRET ?? ""
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(PREVIEW_MESSAGE))
  return toBase64Url(signature)
}
