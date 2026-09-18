import type { Metadata } from "next"
import { EndedScreen } from "../_components/view-screen"
import { ClearViewerCookies } from "./clear-viewer-cookies"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Private View · Meet Mit",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
}

export default function ViewEndedPage() {
  return (
    <>
      {/* Clears the viewer cookies on arrival (a GET page can't set cookies itself). */}
      <ClearViewerCookies />
      <EndedScreen />
    </>
  )
}
