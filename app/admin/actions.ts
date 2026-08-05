"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { requireAdmin } from "@/lib/admin"
import { db } from "@/lib/db"
import { portalSequences, shareLinks } from "@/lib/db/schema"
import { newShareToken, hashToken } from "@/lib/portal-access"
import { SYMBOLS } from "@/lib/portal-symbols"
import { getWorld } from "@/lib/worlds"

async function adminOrThrow() {
  const admin = await requireAdmin()
  if (!admin) throw new Error("Unauthorized")
  return admin
}

export async function updateSequence(handle: string, symbols: string[]) {
  await adminOrThrow()
  if (!getWorld(handle) || symbols.length !== 3 || new Set(symbols).size !== 3 || symbols.some((id) => !(id in SYMBOLS))) {
    throw new Error("Invalid sequence")
  }
  await db.update(portalSequences).set({ symbolIds: symbols, updatedAt: new Date() }).where(eq(portalSequences.handle, handle))
  revalidatePath("/")
  revalidatePath("/admin")
}

export async function createShareLink(handle: string, label: string, expiresInDays: number | null) {
  const admin = await adminOrThrow()
  if (!getWorld(handle)) throw new Error("Invalid world")
  const token = newShareToken()
  const expiresAt = expiresInDays ? new Date(Date.now() + Math.min(expiresInDays, 90) * 86_400_000) : null
  await db.insert(shareLinks).values({ tokenHash: hashToken(token), handle, label: label.slice(0, 80), expiresAt, createdBy: admin.id })
  const origin = (await headers()).get("origin") ?? process.env.V0_RUNTIME_URL ?? ""
  revalidatePath("/admin")
  return `${origin}/s/${token}`
}

export async function revokeShareLink(id: string) {
  await adminOrThrow()
  await db.update(shareLinks).set({ revokedAt: new Date() }).where(eq(shareLinks.id, id))
  revalidatePath("/admin")
}

export async function signOutAdmin() {
  await auth.api.signOut({ headers: await headers() })
  redirect("/")
}
