"use client"

import { useState } from "react"
import { ROOMS, ROOM_MAP, type RoomId } from "@/lib/mea/rooms"
import { useMea } from "./provider"
import { Field, inputClass, MeaButton, SectionTitle, Surface } from "./ui"

// A deterministic template preview. It shows how one intent reads in two rooms
// using their instructions — no model, no sending, clearly labeled as a preview.
function previewFor(room: RoomId, instructions: string): string {
  const opener =
    room === "social"
      ? "hey — quick one:"
      : room === "nulife"
        ? "Dear colleague,"
        : room === "home"
          ? "One small thing:"
          : "Hi,"
  return `${opener}\n\nFollowing up on what we discussed — I'd value a short next step whenever it suits you.\n\n[Written in the ${ROOM_MAP[room].name} register: ${instructions.slice(0, 80)}${instructions.length > 80 ? "…" : ""}]`
}

export function VoiceView() {
  const { document, run, saving } = useMea()
  const [room, setRoom] = useState<RoomId>("mxi")
  const voice = document.voices[room]

  const [instructions, setInstructions] = useState(voice.instructions)
  const [prohibited, setProhibited] = useState(voice.prohibited.join("\n"))
  const [note, setNote] = useState<string | null>(null)

  // Reset local fields when the room changes.
  const [shownRoom, setShownRoom] = useState<RoomId>(room)
  if (shownRoom !== room) {
    setShownRoom(room)
    setInstructions(voice.instructions)
    setProhibited(voice.prohibited.join("\n"))
    setNote(null)
  }

  async function save() {
    const result = await run({
      type: "roomVoice",
      room,
      voice: {
        instructions: instructions.trim(),
        prohibited: prohibited.split("\n").map((s) => s.trim()).filter(Boolean),
      },
    })
    setNote(result.ok ? "Saved." : result.error)
  }

  // The second room for the side-by-side preview: Social if we're not already there.
  const otherRoom: RoomId = room === "social" ? "mxi" : "social"

  return (
    <section aria-labelledby="voice-title" className="mea-room-enter pt-2">
      <SectionTitle sub="Per-room writing instructions, approved examples and prohibited claims. This keeps the register yours.">
        <span id="voice-title">Voice</span>
      </SectionTitle>

      <label className="mb-4 flex items-center gap-2 text-sm text-[var(--mea-dim)]">
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

      <Surface className="mb-4 flex flex-col gap-3">
        <Field label="Writing instructions">
          <textarea
            className={inputClass + " min-h-24 py-2 leading-relaxed"}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />
        </Field>
        <Field label="Prohibited claims" hint="One per line. Things MEA must never assert in this room.">
          <textarea
            className={inputClass + " min-h-20 py-2 leading-relaxed"}
            value={prohibited}
            onChange={(e) => setProhibited(e.target.value)}
            placeholder="No invented availability&#10;No claim that anyone agreed"
          />
        </Field>
        {note ? <p className="text-xs text-[var(--mea-dim)]">{note}</p> : null}
        <div>
          <MeaButton variant="primary" onClick={() => void save()} disabled={saving}>
            Save voice
          </MeaButton>
        </div>
      </Surface>

      {voice.examples.length > 0 ? (
        <div className="mb-4">
          <h3 className="mb-2 text-sm text-[var(--mea-dim)]">Approved examples</h3>
          <ul className="flex flex-col gap-2">
            {voice.examples.map((ex, i) => (
              <li key={i}>
                <Surface className="p-3.5">
                  <p className="text-[11px] text-[var(--mea-dim)]">
                    For {ex.audience} · aiming to {ex.outcome}
                  </p>
                  <p className="mt-1.5 whitespace-pre-wrap text-pretty text-sm leading-relaxed text-[var(--mea-silver)]">{ex.text}</p>
                </Surface>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div>
        <h3 className="mb-2 text-sm text-[var(--mea-dim)]">Template preview — the same intent, two rooms</h3>
        <p className="mb-2 text-xs text-[var(--mea-dim)]">A deterministic preview, not a real message. Nothing is generated or sent.</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[room, otherRoom].map((r) => (
            <Surface key={r} className="p-3.5">
              <p className="mb-1.5 font-display text-sm text-[var(--mea-silver)]">{ROOM_MAP[r].name}</p>
              <p className="whitespace-pre-wrap text-pretty text-xs leading-relaxed text-[var(--mea-dim)]">
                {previewFor(r, r === room ? instructions : document.voices[r].instructions)}
              </p>
            </Surface>
          ))}
        </div>
      </div>
    </section>
  )
}
