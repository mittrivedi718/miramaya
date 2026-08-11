import { notFound, redirect } from "next/navigation"
import { AlbumGate } from "@/components/album-gate"
import { HelixScroll } from "@/components/helix-scroll"
import { requireAdmin } from "@/lib/admin"
import { hasAlbumAccess } from "@/lib/album-access"
import { getAlbum } from "@/lib/maya-album"
import { hasWorldGrant } from "@/lib/portal-access"
import { getWorld } from "@/lib/worlds"

export const dynamic = "force-dynamic"

export default async function MayaAlbumPage({ params }: { params: Promise<{ album: string }> }) {
  const { album: slug } = await params
  const album = getAlbum(slug)
  const world = getWorld("maya")
  if (!album || !world) notFound()

  const isAdmin = await requireAdmin()

  // Must have passed maya's own gate first.
  const inMaya = (await hasWorldGrant("maya")) || isAdmin
  if (!inMaya) redirect("/store/maya")

  // The album's own password lock.
  const unlocked = (await hasAlbumAccess(slug)) || isAdmin
  if (!unlocked) return <AlbumGate world={world} album={album} />

  return <HelixScroll world={world} />
}
