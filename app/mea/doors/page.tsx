import type { Metadata } from "next"
import { DoorsView } from "@/components/mea/doors-view"

export const metadata: Metadata = { title: "Doors · MEA" }

export default function DoorsPage() {
  return <DoorsView />
}
