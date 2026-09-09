import type { ReactNode } from "react"
import type { Metadata, Viewport } from "next"
import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/admin"
import { loadWorkspace } from "@/lib/mea/store"
import { MeaProvider } from "@/components/mea/provider"
import { MeaShell } from "@/components/mea/shell"
import "./mea.css"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "MEA",
  description: "Mit's Executive Assistant — a private surface for turning what you carry into tasks, drafts, decisions and conversations.",
  robots: { index: false, follow: false },
  manifest: "/mea/manifest.webmanifest",
  appleWebApp: { capable: true, title: "MEA", statusBarStyle: "black-translucent" },
  icons: { apple: "/mea/apple-touch-icon.png" },
}

export const viewport: Viewport = {
  themeColor: "#14181F",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
}

export default async function MeaLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin()
  if (!admin) redirect("/admin/login")

  const { revision, document } = await loadWorkspace(admin.id)

  return (
    <div className="mea-world min-h-[100dvh] font-body text-[var(--mea-silver)]">
      <MeaProvider initialRevision={revision} initialDocument={document}>
        <MeaShell>{children}</MeaShell>
      </MeaProvider>
    </div>
  )
}
