"use client"

import { useEffect, useState } from "react"
import { Download, Pause, Play, Printer } from "lucide-react"

export function AdminGuidebook({ text }: { text: string }) {
  const [speaking, setSpeaking] = useState(false)

  useEffect(() => () => window.speechSynthesis?.cancel(), [])

  function toggleSpeech() {
    if (!("speechSynthesis" in window)) return
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
    setSpeaking(true)
  }

  return (
    <section className="border border-border bg-card p-5 md:p-8" aria-labelledby="guidebook-title">
      <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Private reference</p>
      <h2 id="guidebook-title" className="mt-2 font-serif text-4xl">Keeper&apos;s guidebook</h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">Print or save the protected PDF, or have these instructions read aloud after signing in. The password is never exposed by either copy.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a href="/admin/guidebook.pdf" download className="flex h-11 items-center gap-2 bg-foreground px-5 text-[10px] uppercase tracking-[0.18em] text-background"><Download className="size-4" />Download PDF</a>
        <button type="button" onClick={toggleSpeech} className="flex h-11 items-center gap-2 border border-border px-5 text-[10px] uppercase tracking-[0.18em]">{speaking ? <Pause className="size-4" /> : <Play className="size-4" />}{speaking ? "Stop dictation" : "Read aloud"}</button>
        <button type="button" onClick={() => window.print()} className="flex h-11 items-center gap-2 border border-border px-5 text-[10px] uppercase tracking-[0.18em]"><Printer className="size-4" />Print page</button>
      </div>
      <div className="mt-8 whitespace-pre-line border-t border-border pt-6 text-sm leading-relaxed text-muted-foreground">{text}</div>
    </section>
  )
}
