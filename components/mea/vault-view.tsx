"use client"

import { useMemo, useState } from "react"
import { Check, Plus } from "lucide-react"
import { ROOMS, ROOM_MAP, type RoomId } from "@/lib/mea/rooms"
import type { Item } from "@/lib/mea/schema"
import { allOfKind, formatDate } from "@/lib/mea/select"
import { useMea } from "./provider"
import { Chip, EmptyState, Field, inputClass, MeaButton, SectionTitle, Surface } from "./ui"

export function VaultView() {
  const { document } = useMea()
  const [room, setRoom] = useState<RoomId>("mxi")
  const [adding, setAdding] = useState(false)

  const memories = useMemo(
    () => allOfKind(document, "memory").filter((m) => m.room === room),
    [document, room],
  )

  return (
    <section aria-labelledby="vault-title" className="mea-room-enter pt-2">
      <SectionTitle sub="Every memory carries its subject and source. New memories start unverified. Contradictions stay visible side by side.">
        <span id="vault-title">Vault</span>
      </SectionTitle>

      <div className="mb-4 flex items-center gap-2">
        <label className="flex flex-1 items-center gap-2 text-sm text-[var(--mea-dim)]">
          Room
          <select
            value={room}
            onChange={(e) => setRoom(e.target.value as RoomId)}
            className="min-h-11 flex-1 rounded-xl border border-[var(--mea-veil)] bg-[var(--mea-ground)] px-2 text-sm text-[var(--mea-silver)] outline-none focus:border-[var(--mea-teal)]"
          >
            {ROOMS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
        <MeaButton variant="ghost" onClick={() => setAdding((v) => !v)} className="shrink-0 px-3 text-xs">
          <Plus size={15} aria-hidden /> Add
        </MeaButton>
      </div>

      {adding ? <AddMemory room={room} onDone={() => setAdding(false)} /> : null}

      {memories.length === 0 && !adding ? (
        <EmptyState line={`No memories in ${ROOM_MAP[room].name} yet. Add a fact with its source to start the room's tree.`} />
      ) : (
        <ul className="flex flex-col gap-3">
          {memories.map((m) => (
            <MemoryCard key={m.id} memory={m} all={memories} />
          ))}
        </ul>
      )}
    </section>
  )
}

function MemoryCard({ memory, all }: { memory: Item; all: Item[] }) {
  const { run, saving } = useMea()
  // A contradiction is shown side by side: find the record this one contradicts.
  const contradiction = all.find((m) => m.id === memory.contradicts || m.contradicts === memory.id)

  return (
    <li>
      <Surface className="p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Chip tone={memory.isExample ? "example" : "working"} />
          <span
            className={
              "rounded-full border px-2 py-0.5 text-[11px] " +
              (memory.confirmed
                ? "border-[var(--mea-teal)] text-[var(--mea-cyan)]"
                : "border-dashed border-[var(--mea-veil)] text-[var(--mea-dim)]")
            }
          >
            {memory.confirmed ? "confirmed" : "unverified"}
          </span>
        </div>

        <p className="text-pretty text-[15px] leading-snug text-[var(--mea-silver)]">{memory.title}</p>
        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs text-[var(--mea-dim)]">
          {memory.subject ? (
            <>
              <dt>Subject</dt>
              <dd className="text-[var(--mea-silver)]">{memory.subject}</dd>
            </>
          ) : null}
          {memory.source ? (
            <>
              <dt>Source</dt>
              <dd className="text-[var(--mea-silver)]">{memory.source}</dd>
            </>
          ) : null}
          {memory.reviewDate ? (
            <>
              <dt>Review</dt>
              <dd>{formatDate(memory.reviewDate)}</dd>
            </>
          ) : null}
        </dl>

        {contradiction ? (
          <div className="mt-3 rounded-lg border border-[var(--mea-veil)] p-2.5">
            <p className="text-[11px] text-[var(--mea-mira)]">A contradicting claim is kept alongside this one:</p>
            <p className="mt-1 text-xs text-[var(--mea-silver)]">{contradiction.title}</p>
            <p className="text-[11px] text-[var(--mea-dim)]">
              {contradiction.confirmed ? "confirmed" : "unverified"} · {contradiction.source || "no source"}
            </p>
          </div>
        ) : null}

        <div className="mt-3">
          {memory.confirmed ? (
            <MeaButton
              variant="quiet"
              disabled={saving}
              onClick={() => run({ type: "status", id: memory.id, status: "unverified" })}
              className="px-2 text-xs"
            >
              Mark unverified
            </MeaButton>
          ) : (
            <MeaButton
              variant="ghost"
              disabled={saving}
              onClick={() => run({ type: "status", id: memory.id, status: "confirmed" })}
              className="px-3 text-xs"
            >
              <Check size={14} aria-hidden /> Confirm — grows the tree
            </MeaButton>
          )}
        </div>
      </Surface>
    </li>
  )
}

function AddMemory({ room, onDone }: { room: RoomId; onDone: () => void }) {
  const { run, saving } = useMea()
  const [fact, setFact] = useState("")
  const [subject, setSubject] = useState("")
  const [source, setSource] = useState("")
  const [review, setReview] = useState("")
  const [error, setError] = useState<string | null>(null)

  async function save() {
    if (!fact.trim()) {
      setError("A memory needs a fact.")
      return
    }
    if (!source.trim()) {
      setError("A memory needs a source — where did this come from?")
      return
    }
    const result = await run({
      type: "create",
      room,
      kind: "memory",
      title: fact.trim(),
      subject: subject.trim(),
      source: source.trim(),
      reviewDate: review || null,
    })
    if (!result.ok) {
      setError(result.error)
      return
    }
    onDone()
  }

  return (
    <Surface className="mb-4 flex flex-col gap-3">
      <Field label="Fact">
        <input className={inputClass} value={fact} onChange={(e) => setFact(e.target.value)} placeholder="What is true" />
      </Field>
      <Field label="Subject">
        <input className={inputClass} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="What or who it's about" />
      </Field>
      <Field label="Source" hint="Where this came from. Required — a memory without provenance is a rumour.">
        <input className={inputClass} value={source} onChange={(e) => setSource(e.target.value)} placeholder="Decision, message, document…" />
      </Field>
      <Field label="Review date" hint="Optional. Date only.">
        <input type="date" className={inputClass} value={review} onChange={(e) => setReview(e.target.value)} />
      </Field>
      <p className="text-xs text-[var(--mea-dim)]">New memories start unverified until you confirm them.</p>
      {error ? <p className="text-xs text-[var(--mea-mira)]">{error}</p> : null}
      <div className="flex items-center gap-2">
        <MeaButton variant="primary" onClick={() => void save()} disabled={saving}>
          Save memory
        </MeaButton>
        <MeaButton variant="quiet" onClick={onDone}>
          Cancel
        </MeaButton>
      </div>
    </Surface>
  )
}
