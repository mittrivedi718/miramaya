import { PortalGallery } from "@/components/portal-gallery"
import { getPortalSequences } from "@/lib/portal-access"

export const dynamic = "force-dynamic"

export default async function Page() {
  const records = await getPortalSequences()
  const sequences = Object.fromEntries(records.map((record) => [record.handle, record.symbolIds]))
  return <PortalGallery sequences={sequences} />
}
