import { desc } from "drizzle-orm"
import { redirect } from "next/navigation"
import { AdminConsole } from "@/components/admin-console"
import { requireAdmin } from "@/lib/admin"
import { buildGuidebookText } from "@/lib/guidebook"
import { SYMBOLS } from "@/lib/portal-symbols"
import { db } from "@/lib/db"
import { shareLinks } from "@/lib/db/schema"
import { getPortalSequences } from "@/lib/portal-access"
import { WORLDS } from "@/lib/worlds"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const admin = await requireAdmin()
  if (!admin) redirect("/admin/login")

  const [sequenceRecords, links] = await Promise.all([
    getPortalSequences(),
    db.select().from(shareLinks).orderBy(desc(shareLinks.createdAt)),
  ])
  const sequences = Object.fromEntries(sequenceRecords.map((record) => [record.handle, record.symbolIds]))
  const guidebookText = buildGuidebookText(
    WORLDS.map((world) => ({
      handle: world.handle,
      name: world.name,
      symbols: (sequences[world.handle] ?? []).map((id: string) => SYMBOLS[id as keyof typeof SYMBOLS]?.label ?? id),
    })),
    admin.email,
  )

  return <AdminConsole worlds={WORLDS} sequences={sequences} links={links} guidebookText={guidebookText} />
}
