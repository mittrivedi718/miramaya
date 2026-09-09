import type { Metadata } from "next"
import { VaultView } from "@/components/mea/vault-view"

export const metadata: Metadata = { title: "Vault · MEA" }

export default function VaultPage() {
  return <VaultView />
}
