import type { Metadata } from "next"
import { VoiceView } from "@/components/mea/voice-view"

export const metadata: Metadata = { title: "Voice · MEA" }

export default function VoicePage() {
  return <VoiceView />
}
