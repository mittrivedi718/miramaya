"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { MeaButton } from "./ui"

const DONE_KEY = "mea-walkthrough-done"

const STEPS: { title: string; body: string }[] = [
  { title: "Enter a room", body: "Open Doors and step into MXI — the deep room where pitches live." },
  { title: "Add a real person", body: "Add someone to the pitch list with a verified contact and a follow-up date." },
  { title: "Prepare a follow-up", body: "Use Draft follow-up, then edit it until every line is true." },
  { title: "Review in Hands", body: "Check the exact recipient and every word. Nothing is sent — MEA only drafts." },
  { title: "Mark reviewed", body: "Mark it reviewed for manual use, then copy it to send yourself, in the right app." },
  { title: "Remember it", body: "Add the decision and its source to Vault. New memories start unverified." },
  { title: "Inspect and undo", body: "Open Ledger → History, undo one internal change, refresh, and confirm your work reloaded." },
  { title: "Export", body: "Export the whole workspace as JSON from Ledger. Your work is always yours to take." },
]

// A dismissible eight-step walkthrough. Shows progress, allows skipping, never blocks the app.
export function Walkthrough() {
  const [step, setStep] = useState<number | null>(null)

  useEffect(() => {
    if (window.localStorage.getItem(DONE_KEY) === "1") return
    setStep(0)
  }, [])

  function finish() {
    window.localStorage.setItem(DONE_KEY, "1")
    setStep(null)
  }

  if (step === null) return null
  const current = STEPS[step]
  const last = step === STEPS.length - 1

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="MEA walkthrough">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/60" onClick={finish} />
      <div className="mea-surface relative z-10 w-full max-w-md rounded-b-none rounded-t-2xl p-5 sm:rounded-2xl">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs text-[var(--mea-dim)]">
            Step {step + 1} of {STEPS.length}
          </p>
          <button type="button" onClick={finish} aria-label="Skip" className="mea-tap rounded-lg p-1 text-[var(--mea-dim)]">
            <X size={18} aria-hidden />
          </button>
        </div>

        <h2 className="mt-1 text-pretty font-display text-2xl text-[var(--mea-silver)]">{current.title}</h2>
        <p className="mt-2 text-pretty text-sm leading-relaxed text-[var(--mea-dim)]">{current.body}</p>

        <div className="mt-4 flex items-center gap-1.5" aria-hidden>
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={"h-1 flex-1 rounded-full " + (i <= step ? "bg-[var(--mea-teal)]" : "bg-[var(--mea-veil)]")}
            />
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <MeaButton variant="quiet" onClick={finish}>
            Skip
          </MeaButton>
          <div className="flex items-center gap-2">
            {step > 0 ? (
              <MeaButton variant="ghost" onClick={() => setStep(step - 1)}>
                Back
              </MeaButton>
            ) : null}
            <MeaButton variant="primary" onClick={() => (last ? finish() : setStep(step + 1))}>
              {last ? "Enter MEA" : "Next"}
            </MeaButton>
          </div>
        </div>
      </div>
    </div>
  )
}
