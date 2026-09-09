import type { Metadata } from "next"
import { ThresholdView } from "@/components/mea/threshold-view"

export const metadata: Metadata = { title: "Threshold · MEA" }

export default function ThresholdPage() {
  return <ThresholdView />
}
