import type { Metadata } from "next"
import { cookies } from "next/headers"
import { GATE_COOKIE, gateToken } from "@/lib/site-gate"
import { PREVIEW_COOKIE, previewToken } from "@/lib/preview-gate"
import { PreviewUnlock } from "@/components/doll-invasion/preview-unlock"
import { PreviewExperience } from "@/components/doll-invasion/preview-experience"

export const metadata: Metadata = {
  title: "Doll Invasion 2026 · Private Preview",
  description: "A private preview. Some things are only here for a moment.",
  robots: { index: false, follow: false, nocache: true },
}

export default async function DollInvasionPreviewPage() {
  const store = await cookies()

  // Either lock opens this page: the preview passphrase, or full site access
  // (so the owner never has to type the preview phrase to check their own work).
  const [preview, site] = await Promise.all([previewToken(), gateToken()])
  const unlocked =
    store.get(PREVIEW_COOKIE)?.value === preview || store.get(GATE_COOKIE)?.value === site

  if (!unlocked) return <PreviewUnlock />

  return <PreviewExperience />
}
