import type { Metadata } from "next"
import { LedgerView } from "@/components/mea/ledger-view"

export const metadata: Metadata = { title: "Ledger · MEA" }

export default function LedgerPage() {
  return <LedgerView />
}
