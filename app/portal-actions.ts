"use server"

import { redirect } from "next/navigation"
import { getPortalSequence, grantWorld, redeemShareToken } from "@/lib/portal-access"
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

export async function redeemShareLink(token: string) {
  const handle = await redeemShareToken(token)
  if (!handle) redirect("/?share=invalid")
  redirect(`/store/${handle}`)
}
