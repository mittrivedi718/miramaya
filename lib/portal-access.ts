import { createHash, randomBytes } from "node:crypto"
import { and, eq, gt, isNull, or, sql } from "drizzle-orm"
import { cookies } from "next/headers"
import { db } from "@/lib/db"
import { portalSequences, shareLinkEvents, shareLinks } from "@/lib/db/schema"

const ACCESS_COOKIE = "mirror-world-access"

export type PortalSequence = { handle: string; symbolIds: string[]; enabled: boolean }

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}

export function newShareToken() {
  return randomBytes(24).toString("base64url")
}

export async function getPortalSequences(): Promise<PortalSequence[]> {
  return db.select().from(portalSequences).orderBy(portalSequences.handle)
}

export async function getPortalSequence(handle: string): Promise<PortalSequence | null> {
  const [sequence] = await db.select().from(portalSequences).where(eq(portalSequences.handle, handle)).limit(1)
  return sequence ?? null
}

export async function grantWorld(handle: string) {
  const jar = await cookies()
  const current = new Set((jar.get(ACCESS_COOKIE)?.value ?? "").split(".").filter(Boolean))
  current.add(handle)
  jar.set(ACCESS_COOKIE, [...current].join("."), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12,
    path: "/",
  })
}

export async function hasWorldGrant(handle: string) {
  const jar = await cookies()
  return (jar.get(ACCESS_COOKIE)?.value ?? "").split(".").includes(handle)
}

export async function redeemShareToken(token: string) {
  const now = new Date()
  const [link] = await db
    .select()
    .from(shareLinks)
    .where(and(eq(shareLinks.tokenHash, hashToken(token)), isNull(shareLinks.revokedAt), or(isNull(shareLinks.expiresAt), gt(shareLinks.expiresAt, now))))
    .limit(1)
  if (!link) return null

  await grantWorld(link.handle)
  await db.update(shareLinks).set({ useCount: sql`${shareLinks.useCount} + 1`, lastUsedAt: now }).where(eq(shareLinks.id, link.id))
  await db.insert(shareLinkEvents).values({ shareLinkId: link.id, eventType: "redeemed" })
  return link.handle
}
