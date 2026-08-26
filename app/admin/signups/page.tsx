import { redirect } from "next/navigation"
import { SignupsTable } from "@/components/doll-invasion/signups-table"
import { requireAdmin } from "@/lib/admin"
import { listSignups } from "@/lib/doll-invasion"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Doll Invasion signups",
  robots: { index: false, follow: false },
}

export default async function SignupsPage() {
  const admin = await requireAdmin()
  if (!admin) redirect("/admin/login")

  const signups = await listSignups()
  return <SignupsTable signups={signups} />
}
