"use server"

import { redirect } from "next/navigation"
import { acceptedAlbumPasswords, grantAlbumAccess } from "@/lib/album-access"
import { getPortalSequence, grantWorld, redeemShareToken } from "@/lib/portal-access"
import { safeEqual } from "@/lib/site-gate"
import { getWorld } from "@/lib/worlds"

export async function unlockPortal(handle: string, presses: string[]) {
  const world = getWorld(handle)
  const sequence = await getPortalSequence(handle)
  if (!world || !sequence?.enabled) return { ok: false, message: "This passage is resting." }

  const correct = sequence.symbolIds.length === presses.length && sequence.symbolIds.every((symbol, index) => symbol === presses[index])
  if (!correct) return { ok: false, message: "The mirror went still. Begin again." }

  await grantWorld(handle)
  return { ok: true }
}

/**
 * Grants entry to a world once its keeper's mechanic has been completed on the
 * client. These are temporary landing pages, so completing the act of attention
 * is the proof — there is no secret to check server-side.
 */
export async function enterWorld(handle: string) {
  const world = getWorld(handle)
  if (!world) return { ok: false as const }
  await grantWorld(handle)
  return { ok: true as const }
}

export async function redeemShareLink(token: string) {
  const handle = await redeemShareToken(token)
  if (!handle) redirect("/?share=invalid")
  redirect(`/store/${handle}`)
}

/**
 * Unlocks a password-protected album (a second lock, inside a world). On the
 * correct password we set a signed cookie; the password is never trusted from
 * the client beyond this check.
 */
export async function unlockAlbum(slug: string, password: string) {
  const accepted = acceptedAlbumPasswords(slug)
  const value = password.trim()
  const ok = accepted.length > 0 && accepted.some((p) => safeEqual(p, value))
  if (!ok) return { ok: false as const, message: "That key doesn't fit this lock." }
  await grantAlbumAccess(slug)
  return { ok: true as const }
}
