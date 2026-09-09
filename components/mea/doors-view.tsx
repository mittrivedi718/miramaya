"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ROOMS } from "@/lib/mea/rooms"
import { roomItems } from "@/lib/mea/select"
import { useMea } from "./provider"
import { SectionTitle } from "./ui"

export function DoorsView() {
  const { document } = useMea()

  return (
    <section aria-labelledby="doors-title" className="mea-room-enter pt-2">
      <SectionTitle sub="Seven rooms, each with its own records, people and voice. A record in one room never appears in another.">
        <span id="doors-title">Doors</span>
      </SectionTitle>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ROOMS.map((room) => {
          const count = roomItems(document, room.id).length
          return (
            <li key={room.id}>
              <Link
                href={`/mea/doors/${room.id}`}
                className="mea-surface mea-tap flex min-h-[104px] flex-col justify-between p-4"
              >
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-display text-lg text-[var(--mea-silver)]">{room.name}</h3>
                    <ArrowRight size={16} className="text-[var(--mea-dim)]" aria-hidden />
                  </div>
                  <p className="mt-1 text-sm text-[var(--mea-dim)]">{room.tagline}</p>
                </div>
                <p className="mt-3 text-xs text-[var(--mea-dim)]">
                  {count === 0 ? "Empty" : `${count} record${count === 1 ? "" : "s"}`}
                </p>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
