import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/admin"
import { getAboutPhotos, getArtworks, getEvents } from "@/lib/data"
import { PortalDashboard } from "@/components/portal/portal-dashboard"

export const dynamic = "force-dynamic"

export default async function PortalPage() {
  const admin = await requireAdmin()
  if (!admin) redirect("/portal/login")

  const [artworks, aboutPhotos, events] = await Promise.all([getArtworks(), getAboutPhotos(), getEvents()])

  return <PortalDashboard artworks={artworks} aboutPhotos={aboutPhotos} events={events} artistName={admin.name} />
}
