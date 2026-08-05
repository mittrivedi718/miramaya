"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { timingSafeEqual } from "node:crypto"
import { acceptedGuidebookPasswords, GUIDE_COOKIE, guidebookToken } from "@/lib/guidebook"

export async function openGuidebook(_prev: unknown, formData: FormData) {
  const entered = String(formData.get("password") ?? "").trim()
  const ok = acceptedGuidebookPasswords().some(
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
