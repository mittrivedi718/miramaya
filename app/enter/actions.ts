"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { acceptedGatePasswords, GATE_COOKIE, gateToken, isGateEnabled, safeEqual, sanitizeReturnPath } from "@/lib/site-gate"
import { isPreviewPassword, PREVIEW_COOKIE, PREVIEW_PATH, previewToken } from "@/lib/preview-gate"

export type UnlockState = { error: string | null }

export async function unlockSite(_prev: UnlockState, formData: FormData): Promise<UnlockState> {
  const from = sanitizeReturnPath(String(formData.get("from") ?? "/"))

  // If the gate isn't configured, there's nothing to unlock.
  if (!isGateEnabled()) redirect(from)

  const entered = String(formData.get("password") ?? "")
  const ok = acceptedGatePasswords().some((expected) => safeEqual(entered, expected))

  // The Doll Invasion passphrase works on this front door too: guests get a
  // single link and a single phrase, and land straight on the preview. Checked
  // before the failure branch so the phrase never reads as "wrong password".
  // They receive ONLY the preview cookie, so proxy.ts still keeps them confined
  // to the preview and out of the rest of the site.
  if (!ok && isPreviewPassword(entered)) {
    const store = await cookies()
    store.set(PREVIEW_COOKIE, await previewToken(), {
      httpOnly: true,
      // `none` + `secure` so the cookie survives the v0 preview iframe, which
      // drops `lax` cookies on a cross-origin embed. The value is an HMAC, so
      // it still cannot be forged.
      sameSite: "none",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 14, // 14 days — a preview, not a residence
    })
    redirect(PREVIEW_PATH)
  }

  if (!ok) {
    return { error: "That password isn't right. Try again." }
  }

  const store = await cookies()
  store.set(GATE_COOKIE, await gateToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })

  redirect(from)
}
