"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { ROOMS, type RoomId } from "@/lib/mea/rooms"
import type { Item } from "@/lib/mea/schema"
import { useMea } from "./provider"
import { inputClass, MeaButton } from "./ui"

type CaptureKind = Extract<Item["kind"], "task" | "memory" | "draft">
const KINDS: { id: CaptureKind; label: string }[] = [
  { id: "task", label: "Task" },
  { id: "memory", label: "Memory" },
  { id: "draft", label: "Draft" },
]

// The persistent capture bar. I pick the room and the kind — MEA never guesses.
export function MirrorLine() {
  const { run, saving } = useMea()
  const router = useRouter()
  const [room, setRoom] = useState<RoomId>("mxi")
  const [kind, setKind] = useState<CaptureKind>("task")
  const [text, setText] = useState("")
  const [note, setNote] = useState<string | null>(null)

  async function submit() {
    const title = text.trim()
    if (!title) return
    const result = await run({ type: "create", room, kind, title })
    if (!result.ok) {
      setNote(result.error)
      return
    }
    // Tasks and memories are saved. Drafts open in Hands to be shaped.
    setText("")
    if (kind === "draft") {
      router.push("/mea/hands")
    } else {
      setNote(`Saved to ${ROOMS.find((r) => r.id === room)?.name}.`)
      window.setTimeout(() => setNote(null), 2200)
    }
  }

  return (
    <div className="mea-surface rounded-2xl p-2.5">
      <div className="flex items-center gap-2">
        <select
          aria-label="Room"
          value={room}
          onChange={(e) => setRoom(e.target.value as RoomId)}
          className="min-h-11 max-w-[38%] shrink-0 rounded-xl border border-[var(--mea-veil)] bg-[var(--mea-ground)] px-2 text-sm text-[var(--mea-silver)] outline-none focus:border-[var(--mea-teal)]"
        >
          {ROOMS.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>

        <div
          role="radiogroup"
          aria-label="Capture as"
          className="flex shrink-0 overflow-hidden rounded-xl border border-[var(--mea-veil)]"
        >
          {KINDS.map((k) => (
            <button
              key={k.id}
              role="radio"
              aria-checked={kind === k.id}
              onClick={() => setKind(k.id)}
              className={
                "mea-tap min-h-11 px-2.5 text-xs font-medium " +
                (kind === k.id
                  ? "bg-[var(--mea-teal)] text-[var(--mea-ground)]"
                  : "text-[var(--mea-dim)]")
              }
            >
              {k.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2 flex items-end gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) {
              e.preventDefault()
              void submit()
            }
          }}
          placeholder={kind === "draft" ? "What should the draft say?" : "What's on your mind?"}
          aria-label="Capture text"
          className={inputClass}
          enterKeyHint="send"
        />
        <MeaButton variant="primary" onClick={() => void submit()} disabled={saving || !text.trim()} className="shrink-0 px-3">
          {saving ? "…" : "Add"}
        </MeaButton>
      </div>

      {note ? <p className="mt-1.5 px-1 text-xs text-[var(--mea-dim)]">{note}</p> : null}
    </div>
  )
}
