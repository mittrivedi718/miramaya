"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { ROOM_MAP, type RoomId } from "@/lib/mea/rooms"
import type { Item } from "@/lib/mea/schema"
import { gardenFor, roomItems } from "@/lib/mea/select"
import { useMea } from "./provider"
import { EmptyState, SectionTitle } from "./ui"
import { GardenCanvas } from "./garden-canvas"
import { PromoteWindow } from "./promote-window"
import { RecordSheet } from "./record-sheet"
import { AddElement, type NewElementKind } from "./add-element"

// A room that hasn't been watered in 14 days shows dry — and says exactly why.
function lastWateredDays(items: Item[]): number | null {
  const memoryDates = items
    .filter((i) => i.kind === "memory" && i.confirmed)
    .map((i) => new Date(i.updatedAt).getTime())
  if (memoryDates.length === 0) return null
  const newest = Math.max(...memoryDates)
  return Math.round((Date.now() - newest) / 86_400_000)
}

const ADD_OPTIONS: { kind: NewElementKind; label: string }[] = [
  { kind: "mirror", label: "Mirror" },
  { kind: "window", label: "Window" },
  { kind: "door", label: "Door" },
]

export function GardenView({ room }: { room: RoomId }) {
  const { document, run } = useMea()
  const meta = ROOM_MAP[room]
  const model = useMemo(() => gardenFor(document, room), [document, room])
  const inRoom = roomItems(document, room)
  const dry = lastWateredDays(inRoom)

  const [selected, setSelected] = useState<Item | null>(null)
  const [promoting, setPromoting] = useState<Item | null>(null)
  const [adding, setAdding] = useState<NewElementKind | null>(null)

  return (
    <section aria-labelledby="garden-title" className="mea-room-enter pt-2">
      <div className="mb-2">
        <Link href={`/mea/doors/${room}`} className="mea-link text-xs">
          ← {meta.name}
        </Link>
      </div>
      <SectionTitle sub="Mirrors reflect what you carry. Windows are open ideas. Shape them into doors — each door with an owner and a date joins the path. The tree is confirmed memory.">
        <span id="garden-title">Garden</span>
      </SectionTitle>

      {/* Add to the garden and path. */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-xs text-[var(--mea-dim)]">Add:</span>
        {ADD_OPTIONS.map((o) => (
          <button
            key={o.kind}
            type="button"
            onClick={() => setAdding(o.kind)}
            className="mea-tap inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-[var(--mea-veil)] px-3 text-sm text-[var(--mea-silver)] hover:border-[var(--mea-teal)]"
          >
            <Plus size={14} aria-hidden /> {o.label}
          </button>
        ))}
      </div>

      {dry !== null && dry >= 14 ? (
        <p className="mea-surface mb-3 p-3 text-xs text-[var(--mea-mira)]">
          This room looks dry — no memory confirmed in {dry} days. Water it: confirm memories, clear stale actions, retire
          dead doors.
        </p>
      ) : null}

      {model.isEmpty ? (
        <EmptyState line={`The ${meta.name} garden is empty. Add a mirror or window above, or capture something below.`} />
      ) : (
        <GardenCanvas model={model} onPick={(item) => setSelected(item)} />
      )}

      {selected ? (
        <RecordSheet
          item={selected}
          onClose={() => setSelected(null)}
          onPromote={
            selected.kind === "window" || selected.kind === "mirror"
              ? () => {
                  setPromoting(selected)
                  setSelected(null)
                }
              : undefined
          }
          onShapeWindow={
            selected.kind === "mirror"
              ? async () => {
                  await run({ type: "edit", id: selected.id, patch: { kind: "window" } })
                  setSelected(null)
                }
              : undefined
          }
        />
      ) : null}

      {promoting ? <PromoteWindow item={promoting} onClose={() => setPromoting(null)} /> : null}

      {adding ? <AddElement room={room} kind={adding} onClose={() => setAdding(null)} /> : null}
    </section>
  )
}
