"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { acceptedGatePasswords, GATE_COOKIE, gateToken, isGateEnabled, safeEqual, sanitizeReturnPath } from "@/lib/site-gate"

export type UnlockState = { error: string | null }

export async function unlockSite(_prev: UnlockState, formData: FormData): Promise<UnlockState> {
  const from = sanitizeReturnPath(String(formData.get("from") ?? "/"))

  // If the gate isn't configured, there's nothing to unlock.
  if (!isGateEnabled()) redirect(from)

  const entered = String(formData.get("password") ?? "")
  const ok = acceptedGatePasswords().some((expected) => safeEqual(entered, expected))

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
