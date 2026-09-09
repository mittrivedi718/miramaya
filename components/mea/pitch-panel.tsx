"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, PenLine } from "lucide-react"
import type { RoomId } from "@/lib/mea/rooms"
import type { Item } from "@/lib/mea/schema"
import { roomItems, formatDate } from "@/lib/mea/select"
import { useMea } from "./provider"
import { Chip, Field, inputClass, MeaButton, Surface } from "./ui"

const STAGES = ["lead", "contacted", "pitched", "in discussion", "won", "closed"] as const

// The MXI deep room: a real pitch list. Stage changes are manual; "Draft follow-up"
// creates a template that names the pitch record as its source.
export function PitchPanel({ room }: { room: RoomId }) {
  const { document, run, saving } = useMea()
  const pitches = roomItems(document, room, "pitch")
  const [adding, setAdding] = useState(false)

  return (
    <div className="mb-5">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm text-[var(--mea-dim)]">Pitch list</h3>
        <MeaButton variant="quiet" onClick={() => setAdding((v) => !v)} className="px-2 text-xs">
          <Plus size={15} aria-hidden /> Add pitch
        </MeaButton>
      </div>

      {adding ? <AddPitch room={room} onDone={() => setAdding(false)} /> : null}

      {pitches.length === 0 && !adding ? (
        <Surface className="text-sm text-[var(--mea-dim)]">
          No pitches yet. Add a person, a verified contact and a follow-up date to start.
        </Surface>
      ) : null}

      <ul className="flex flex-col gap-2.5">
        {pitches.map((p) => (
          <PitchRow key={p.id} pitch={p} onRun={run} busy={saving} />
        ))}
      </ul>
    </div>
  )
}

function PitchRow({
  pitch,
  onRun,
  busy,
}: {
  pitch: Item
  onRun: ReturnType<typeof useMea>["run"]
  busy: boolean
}) {
  const router = useRouter()

  async function draftFollowUp() {
    const recipient = pitch.contact?.trim() || ""
    const body = [
      `Hi ${pitch.person?.split(" ")[0] || "there"},`,
      "",
      "Following up on the concept we discussed — I'd value twenty minutes to take it one step further whenever it suits you.",
      "",
      "Warmly,",
      "Mit",
    ].join("\n")
    const result = await onRun({
      type: "create",
      room: pitch.room,
      kind: "draft",
      title: `Follow-up to ${pitch.person || pitch.title}`,
      body,
      recipient,
      subject: "Following up on the concept",
      source: `Pitch: ${pitch.title}`,
    })
    if (result.ok) router.push("/mea/hands")
  }

  async function setStage(stage: string) {
    await onRun({ type: "edit", id: pitch.id, patch: { stage } })
  }

  return (
    <li>
      <Surface className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Chip tone={pitch.isExample ? "example" : "working"} />
          {pitch.due ? <span className="text-[11px] text-[var(--mea-dim)]">follow up {formatDate(pitch.due)}</span> : null}
        </div>
        <h4 className="mt-1.5 text-pretty text-[15px] text-[var(--mea-silver)]">{pitch.title}</h4>
        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs text-[var(--mea-dim)]">
          {pitch.person ? (
            <>
              <dt>Person</dt>
              <dd className="text-[var(--mea-silver)]">{pitch.person}</dd>
            </>
          ) : null}
          {pitch.contact ? (
            <>
              <dt>Contact</dt>
              <dd className="text-[var(--mea-silver)]">{pitch.contact}</dd>
            </>
          ) : null}
          {pitch.body ? (
            <>
              <dt>Notes</dt>
              <dd className="text-pretty">{pitch.body}</dd>
            </>
          ) : null}
        </dl>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-[var(--mea-dim)]">
            Stage
            <select
              value={pitch.stage ?? "lead"}
              onChange={(e) => void setStage(e.target.value)}
              disabled={busy}
              className="min-h-9 rounded-lg border border-[var(--mea-veil)] bg-[var(--mea-ground)] px-2 text-xs text-[var(--mea-silver)] outline-none focus:border-[var(--mea-teal)]"
            >
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <MeaButton variant="ghost" onClick={() => void draftFollowUp()} disabled={busy} className="px-3 text-xs">
            <PenLine size={14} aria-hidden /> Draft follow-up
          </MeaButton>
        </div>
      </Surface>
    </li>
  )
}

function AddPitch({ room, onDone }: { room: RoomId; onDone: () => void }) {
  const { run, saving } = useMea()
  const [person, setPerson] = useState("")
  const [contact, setContact] = useState("")
  const [notes, setNotes] = useState("")
  const [due, setDue] = useState("")
  const [error, setError] = useState<string | null>(null)

  async function save() {
    if (!person.trim()) {
      setError("A pitch needs a person.")
      return
    }
    const result = await run({
      type: "create",
      room,
      kind: "pitch",
      title: person.trim(),
      person: person.trim(),
      contact: contact.trim(),
      body: notes.trim(),
      due: due || null,
      stage: "lead",
      source: "MXI pitch list",
    })
    if (!result.ok) {
      setError(result.error)
      return
    }
    onDone()
  }

  return (
    <Surface className="mb-3 flex flex-col gap-3">
      <Field label="Person">
        <input className={inputClass} value={person} onChange={(e) => setPerson(e.target.value)} placeholder="Full name" />
      </Field>
      <Field label="Verified contact" hint="Only enter a contact you have actually verified.">
        <input className={inputClass} value={contact} onChange={(e) => setContact(e.target.value)} placeholder="email or handle" />
      </Field>
      <Field label="Notes">
        <textarea
          className={inputClass + " min-h-20 py-2"}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Context, what was discussed"
        />
      </Field>
      <Field label="Follow-up date" hint="Date only. It books nothing.">
        <input type="date" className={inputClass} value={due} onChange={(e) => setDue(e.target.value)} />
      </Field>
      {error ? <p className="text-xs text-[var(--mea-mira)]">{error}</p> : null}
      <div className="flex items-center gap-2">
        <MeaButton variant="primary" onClick={() => void save()} disabled={saving}>
          Save pitch
        </MeaButton>
        <MeaButton variant="quiet" onClick={onDone}>
          Cancel
        </MeaButton>
      </div>
    </Surface>
  )
}
