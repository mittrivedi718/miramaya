"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Sprout } from "lucide-react"
import { ROOM_MAP, type RoomId } from "@/lib/mea/rooms"
import type { Item } from "@/lib/mea/schema"
import { roomItems, formatDate } from "@/lib/mea/select"
import { useMea } from "./provider"
import { Chip, EmptyState, SectionTitle, Surface } from "./ui"
import { PitchPanel } from "./pitch-panel"

const KIND_SECTIONS: { kind: Item["kind"]; label: string }[] = [
  { kind: "task", label: "Tasks" },
  { kind: "draft", label: "Drafts" },
  { kind: "memory", label: "Memories" },
]

export function RoomView({ room }: { room: RoomId }) {
  const { document } = useMea()
  const meta = ROOM_MAP[room]
  const items = roomItems(document, room)

  return (
    <section aria-labelledby="room-title" className="mea-room-enter pt-2">
      <div className="mb-2">
        <Link href="/mea/doors" className="mea-link text-xs">
          ← Doors
        </Link>
      </div>
      <SectionTitle sub={meta.voice}>
        <span id="room-title">{meta.name}</span>
      </SectionTitle>

      <Link
        href={`/mea/doors/${room}/garden`}
        className="mea-surface mea-tap mb-4 flex items-center justify-between p-3.5"
      >
        <span className="flex items-center gap-2.5">
          <Sprout size={18} className="text-[var(--mea-teal)]" aria-hidden />
          <span className="text-sm text-[var(--mea-silver)]">Open the garden</span>
        </span>
        <ArrowRight size={16} className="text-[var(--mea-dim)]" aria-hidden />
      </Link>

      {room === "mxi" ? <PitchPanel room={room} /> : null}

      {items.length === 0 && room !== "mxi" ? (
        <EmptyState line={`${meta.name} is empty. Capture a task or memory below with ${meta.name} selected.`} />
      ) : null}

      {KIND_SECTIONS.map(({ kind, label }) => {
        const list = items.filter((i) => i.kind === kind)
        if (list.length === 0) return null
        return (
          <div key={kind} className="mb-4">
            <h3 className="mb-2 text-sm text-[var(--mea-dim)]">{label}</h3>
            <ul className="flex flex-col gap-2">
              {list.map((item) => (
                <RecordRow key={item.id} item={item} />
              ))}
            </ul>
          </div>
        )
      })}
    </section>
  )
}

function RecordRow({ item }: { item: Item }) {
  const [open, setOpen] = useState(false)
  return (
    <li>
      <Surface className="p-3.5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full items-start justify-between gap-3 text-left"
        >
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <Chip tone={item.isExample ? "example" : "working"} />
              {item.kind === "memory" ? (
                <span className="text-[11px] text-[var(--mea-dim)]">
                  {item.confirmed ? "confirmed" : "unverified"}
                </span>
              ) : null}
            </span>
            <span className="mt-1.5 block text-pretty text-[15px] leading-snug text-[var(--mea-silver)]">
              {item.title}
            </span>
            {item.due ? <span className="mt-0.5 block text-xs text-[var(--mea-dim)]">{formatDate(item.due)}</span> : null}
          </span>
          <ArrowRight
            size={15}
            className={"mt-1 shrink-0 text-[var(--mea-dim)] transition-transform " + (open ? "rotate-90" : "")}
            aria-hidden
          />
        </button>
        {open ? (
          <div className="mt-3 border-t border-[var(--mea-veil)] pt-3 text-sm text-[var(--mea-dim)]">
            {item.body ? <p className="text-pretty leading-relaxed">{item.body}</p> : <p>No notes.</p>}
            {item.source ? <p className="mt-2 text-xs">Source: {item.source}</p> : null}
            {item.contradicts ? (
              <p className="mt-2 text-xs text-[var(--mea-mira)]">A contradicting claim is kept alongside this one.</p>
            ) : null}
            {item.kind === "draft" ? (
              <Link href="/mea/hands" className="mea-link mt-2 inline-block text-xs">
                Review in Hands
              </Link>
            ) : null}
          </div>
        ) : null}
      </Surface>
    </li>
  )
}
