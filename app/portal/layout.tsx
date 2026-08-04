import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Artist Portal",
  robots: { index: false, follow: false },
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-background">{children}</div>
}
