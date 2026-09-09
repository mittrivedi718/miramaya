"use client"

import { useState } from "react"
import { X } from "lucide-react"
import type { RoomId } from "@/lib/mea/rooms"
import type { Item } from "@/lib/mea/schema"
import { useMea } from "./provider"
import { Field, inputClass, MeaButton } from "./ui"

export type NewElementKind = Extract<Item["kind"], "mirror" | "window" | "door">

const COPY: Record<NewElementKind, { title: string; note: string }> = {
  mirror: { title: "Add a mirror", note: "A mirror reflects something you carry — captured, not yet shaped." },
  window: { title: "Add a window", note: "A window is an open idea — visible, but not yet a commitment." },
  door: { title: "Add a door", note: "A door is a commitment on the path. It needs an owner, a next action and a date." },
}

// Placing a new element in the room's garden. Mirrors and windows need only a
// name; a door is a commitment, so it asks for its owner, next action and date.
export function AddElement({
  room,
  kind,
  onClose,
}: {
  room: RoomId
  kind: NewElementKind
  onClose: () => void
}) {
  const { run, saving } = useMea()
  const [title, setTitle] = useState("")
  const [owner, setOwner] = useState("")
  const [nextAction, setNextAction] = useState("")
  const [due, setDue] = useState("")
  const [missing, setMissing] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  async function add() {
    if (!title.trim()) {
      setMissing(["a name"])
      return
    }
    const result = await run(
      kind === "door"
        ? {
            type: "create",
            room,
            kind,
            title: title.trim(),
            recipient: owner.trim(),
            nextAction: nextAction.trim(),
            due: due || null,
          }
        : { type: "create", room, kind, title: title.trim() },
    )
    if (!result.ok) {
      setMissing(result.missing ?? [])
      setError(result.error)
      return
    }
    onClose()
  }

  const copy = COPY[kind]

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={copy.title}
    >
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="mea-surface relative z-10 w-full max-w-md rounded-b-none rounded-t-2xl p-5 sm:rounded-2xl">
        <div className="flex items-start justify-between">
          <h2 className="text-pretty font-display text-xl text-[var(--mea-silver)]">{copy.title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="mea-tap rounded-lg p-1 text-[var(--mea-dim)]"
          >
            <X size={18} aria-hidden />
          </button>
        </div>

        <p className="mt-2 text-sm text-[var(--mea-dim)]">{copy.note}</p>

        <div className="mt-4 flex flex-col gap-3">
          <Field label="Name">
            <input
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={kind === "door" ? "What is this opportunity" : "What is this"}
              autoFocus
            />
          </Field>

          {kind === "door" ? (
            <>
              <Field label="Owner">
                <input
                  className={inputClass}
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  placeholder="Who owns this"
                />
              </Field>
              <Field label="Next action">
                <input
                  className={inputClass}
                  value={nextAction}
                  onChange={(e) => setNextAction(e.target.value)}
                  placeholder="The single next step"
                />
              </Field>
              <Field label="Date" hint="Date only. It books nothing.">
                <input type="date" className={inputClass} value={due} onChange={(e) => setDue(e.target.value)} />
              </Field>
            </>
          ) : null}
        </div>

        {missing.length ? (
          <p className="mt-3 text-xs text-[var(--mea-mira)]">Still needs {missing.join(", ")}.</p>
        ) : null}
        {error && !missing.length ? <p className="mt-3 text-xs text-[var(--mea-mira)]">{error}</p> : null}

        <div className="mt-4 flex items-center gap-2">
          <MeaButton variant="primary" onClick={() => void add()} disabled={saving}>
            Place it in the garden
          </MeaButton>
          <MeaButton variant="quiet" onClick={onClose}>
            Cancel
          </MeaButton>
        </div>
      </div>
    </div>
  )
}
