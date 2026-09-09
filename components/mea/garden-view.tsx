"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ROOM_MAP, type RoomId } from "@/lib/mea/rooms"
import type { Item } from "@/lib/mea/schema"
import { gardenFor, roomItems, formatDate, daysUntil } from "@/lib/mea/select"
import { useMea } from "./provider"
import { EmptyState, SectionTitle } from "./ui"
import { GardenCanvas } from "./garden-canvas"
import { PromoteWindow } from "./promote-window"
import { RecordSheet } from "./record-sheet"

// A room that hasn't been watered in 14 days shows dry — and says exactly why.
function lastWateredDays(items: Item[]): number | null {
  const memoryDates = items
    .filter((i) => i.kind === "memory" && i.confirmed)
    .map((i) => new Date(i.updatedAt).getTime())
  if (memoryDates.length === 0) return null
  const newest = Math.max(...memoryDates)
  return Math.round((Date.now() - newest) / 86_400_000)
}

export function GardenView({ room }: { room: RoomId }) {
  const { document } = useMea()
  const meta = ROOM_MAP[room]
  const model = useMemo(() => gardenFor(document, room), [document, room])
  const inRoom = roomItems(document, room)
  const dry = lastWateredDays(inRoom)

  const [selected, setSelected] = useState<Item | null>(null)
  const [promoting, setPromoting] = useState<Item | null>(null)

  return (
    <section aria-labelledby="garden-title" className="mea-room-enter pt-2">
      <div className="mb-2">
        <Link href={`/mea/doors/${room}`} className="mea-link text-xs">
          ← {meta.name}
        </Link>
      </div>
      <SectionTitle sub="Mirrors reflect what you carry. Windows are open ideas. Doors have an owner and a date. The tree is confirmed memory.">
        <span id="garden-title">Garden</span>
      </SectionTitle>

      {dry !== null && dry >= 14 ? (
        <p className="mea-surface mb-3 p-3 text-xs text-[var(--mea-mira)]">
          This room looks dry — no memory confirmed in {dry} days. Water it: confirm memories, clear stale actions, retire
          dead doors.
        </p>
      ) : null}

      {model.isEmpty ? (
        <EmptyState
          line={`The ${meta.name} garden is empty. Capture something below to place a mirror here.`}
        />
      ) : (
        <GardenCanvas model={model} onPick={(item) => setSelected(item)} />
      )}

      {selected ? (
        <RecordSheet
          item={selected}
          onClose={() => setSelected(null)}
          onPromote={
            selected.kind === "window"
              ? () => {
                  setPromoting(selected)
                  setSelected(null)
                }
              : undefined
          }
        />
      ) : null}

      {promoting ? <PromoteWindow item={promoting} onClose={() => setPromoting(null)} /> : null}
    </section>
  )
}
