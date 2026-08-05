"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createHmac, timingSafeEqual } from "node:crypto"

const GUIDE_COOKIE = "mm_guidebook"

/** The accepted guidebook passwords. Both phrasings the owner chose are allowed. */
function acceptedPasswords(): string[] {
  const extra = process.env.GUIDEBOOK_PASSWORD?.trim()
  const base = ["MiraMaya MIRAMAYA11", "MiraMaya MIRAMAY"]
  return extra ? [extra, ...base] : base
}

/** Signed token proving the guidebook password was entered, tied to the server secret. */
export function guidebookToken(): string {
  const secret = process.env.BETTER_AUTH_SECRET ?? "miramaya-guide"
  return createHmac("sha256", secret).update("miramaya-guidebook-v1").digest("base64url")
}

export async function hasGuidebookAccess(): Promise<boolean> {
  const jar = await cookies()
  const value = jar.get(GUIDE_COOKIE)?.value ?? ""
  const expected = guidebookToken()
  if (value.length !== expected.length) return false
  return timingSafeEqual(Buffer.from(value), Buffer.from(expected))
}

export async function openGuidebook(_prev: unknown, formData: FormData) {
  const entered = String(formData.get("password") ?? "").trim()
  const ok = acceptedPasswords().some(
    (pw) => pw.length === entered.length && timingSafeEqual(Buffer.from(pw), Buffer.from(entered)),
  )
  if (!ok) return { error: "That key does not turn. Try the phrase from Mit." }

  const jar = await cookies()
  jar.set(GUIDE_COOKIE, guidebookToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 6,
    path: "/",
  })
  redirect("/guidebook")
}
