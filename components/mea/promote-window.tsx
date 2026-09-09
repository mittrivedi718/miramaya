"use client"

import { useState } from "react"
import { X } from "lucide-react"
import type { Item } from "@/lib/mea/schema"
import { useMea } from "./provider"
import { Field, inputClass, MeaButton } from "./ui"

// Opening a window into a door is a real state transition: it requires an owner,
// a next action and a date. The app asks for whatever is missing.
export function PromoteWindow({ item, onClose }: { item: Item; onClose: () => void }) {
  const { run, saving } = useMea()
  const [owner, setOwner] = useState(item.recipient ?? "")
  const [nextAction, setNextAction] = useState(item.nextAction ?? "")
  const [due, setDue] = useState(item.due ?? "")
  const [missing, setMissing] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  async function promote() {
    const gaps: string[] = []
    if (!owner.trim()) gaps.push("an owner")
    if (!nextAction.trim()) gaps.push("a next action")
    if (!due) gaps.push("a date")
    if (gaps.length) {
      setMissing(gaps)
      return
    }
    const result = await run({
      type: "edit",
      id: item.id,
      patch: { kind: "door", recipient: owner.trim(), nextAction: nextAction.trim(), due },
    })
    if (!result.ok) {
      setMissing(result.missing ?? [])
      setError(result.error)
      return
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="Open into a door">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="mea-surface relative z-10 w-full max-w-md rounded-b-none rounded-t-2xl p-5 sm:rounded-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-[var(--mea-dim)]">{item.kind === "mirror" ? "Mirror → Door" : "Window → Door"}</p>
            <h2 className="mt-1 text-pretty font-display text-xl text-[var(--mea-silver)]">{item.title}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="mea-tap rounded-lg p-1 text-[var(--mea-dim)]">
            <X size={18} aria-hidden />
          </button>
        </div>

        <p className="mt-2 text-sm text-[var(--mea-dim)]">A door is a commitment. It needs an owner, a next action and a date.</p>

        <div className="mt-4 flex flex-col gap-3">
          <Field label="Owner">
            <input className={inputClass} value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="Who owns this" />
          </Field>
          <Field label="Next action">
            <input className={inputClass} value={nextAction} onChange={(e) => setNextAction(e.target.value)} placeholder="The single next step" />
          </Field>
          <Field label="Date" hint="Date only. It books nothing.">
            <input type="date" className={inputClass} value={due} onChange={(e) => setDue(e.target.value)} />
          </Field>
        </div>

        {missing.length ? (
          <p className="mt-3 text-xs text-[var(--mea-mira)]">Still needs {missing.join(", ")}.</p>
        ) : null}
        {error && !missing.length ? <p className="mt-3 text-xs text-[var(--mea-mira)]">{error}</p> : null}

        <div className="mt-4 flex items-center gap-2">
          <MeaButton variant="primary" onClick={() => void promote()} disabled={saving}>
            Open the door
          </MeaButton>
          <MeaButton variant="quiet" onClick={onClose}>
            Cancel
          </MeaButton>
        </div>
      </div>
    </div>
  )
}
