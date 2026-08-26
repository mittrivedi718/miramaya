"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { after } from "next/server"
import { isPreviewPassword, PREVIEW_COOKIE, PREVIEW_PATH, previewToken } from "@/lib/preview-gate"
import { notifyOwner, saveContact } from "@/lib/doll-invasion"

// ─── Unlock ──────────────────────────────────────────────────────────────────
// The passphrase is compared here, on the server. It is never shipped to the
// browser, and unlocking sets ONLY the preview cookie — never the site gate.

export type PreviewUnlockState = { error: string | null }

export async function unlockPreview(
  _prev: PreviewUnlockState,
  formData: FormData,
): Promise<PreviewUnlockState> {
  const entered = String(formData.get("password") ?? "")

  if (!isPreviewPassword(entered)) {
    return { error: "That isn't the phrase. Try again." }
  }

  const store = await cookies()
  store.set(PREVIEW_COOKIE, await previewToken(), {
    httpOnly: true,
    // The v0 preview renders this page inside a cross-origin iframe, where a
    // `lax` cookie is dropped by the browser — the unlock appeared to fail even
    // though the phrase was correct. `none` + `secure` survives the iframe and
    // is still safe: the value is an HMAC that cannot be forged.
    sameSite: "none",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 14, // 14 days — a preview, not a residence
  })

  // Re-render this same page, now unlocked.
  redirect(PREVIEW_PATH)
}

// ─── Lead capture ────────────────────────────────────────────────────────────

export type ReflectionState = { ok: boolean; error?: string }

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

function clean(value: FormDataEntryValue | null, max: number): string {
  return String(value ?? "")
    .trim()
    .slice(0, max)
}

/** Accepts "@name", "name", or a full profile URL and stores a bare handle. */
function normalizeInstagram(raw: string): string {
  if (!raw) return ""
  let handle = raw.trim()
  const urlMatch = handle.match(/instagram\.com\/([^/?#\s]+)/i)
  if (urlMatch) handle = urlMatch[1]
  handle = handle.replace(/^@+/, "").replace(/\/+$/, "")
  return handle ? `@${handle}` : ""
}

export async function submitReflection(
  _prev: ReflectionState | null,
  formData: FormData,
): Promise<ReflectionState> {
  const firstName = clean(formData.get("firstName"), 120)
  const lastName = clean(formData.get("lastName"), 120)
  const email = clean(formData.get("email"), 200)
  const instagram = normalizeInstagram(clean(formData.get("instagram"), 200))
  const message = clean(formData.get("message"), 2000)
  // Honeypot: real people leave this hidden field empty.
  const trap = clean(formData.get("company"), 100)

  if (trap) return { ok: true }
  if (!firstName) return { ok: false, error: "Please add your first name." }
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Please enter a valid email so the album can reach you." }

  const contact = { firstName, lastName, email, instagram, message }

  let id: string
  try {
    id = await saveContact(contact)
  } catch (error) {
    console.log("[v0] Doll Invasion save failed:", error instanceof Error ? error.message : error)
    return { ok: false, error: "Something went still on our end. Please try again in a moment." }
  }

  // Email is best-effort and must never make the visitor wait: a cold Resend
  // client can take many seconds, and the lead is already safely saved. `after`
  // runs the send once the response has been flushed.
  after(() => notifyOwner(id, contact))

  return { ok: true }
}
