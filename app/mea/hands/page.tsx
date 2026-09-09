import type { Metadata } from "next"
import { HandsView } from "@/components/mea/hands-view"

export const metadata: Metadata = { title: "Hands · MEA" }

export default function HandsPage() {
  return <HandsView />
}
