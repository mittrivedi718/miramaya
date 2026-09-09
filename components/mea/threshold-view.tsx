"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, ArrowRight } from "lucide-react"
import { ROOM_MAP } from "@/lib/mea/rooms"
import type { Item } from "@/lib/mea/schema"
import { thresholdQueue, formatDate, daysUntil, nextActionLabel } from "@/lib/mea/select"
import { useMea } from "./provider"
import { Chip, EmptyState, MeaButton, SectionTitle } from "./ui"

export function ThresholdView() {
  const { document, run, saving } = useMea()
  const queue = thresholdQueue(document)
  const top = queue.slice(0, 3)
  const rest = queue.slice(3)
  const [restOpen, setRestOpen] = useState(false)

  return (
    <section aria-labelledby="threshold-title" className="mea-room-enter pt-2">
      <SectionTitle sub="What matters now. Dated tasks first, then drafts to review, then the undated.">
        <span id="threshold-title">Threshold</span>
      </SectionTitle>

      {queue.length === 0 ? (
        <EmptyState
          line="Nothing is waiting. Capture a task or memory below, or open a room to prepare a follow-up."
          action={
            <Link href="/mea/doors" className="mea-link inline-flex items-center gap-1.5 text-sm">
              Open Doors <ArrowRight size={15} aria-hidden />
            </Link>
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {top.map((item) => (
            <ThresholdCard key={item.id} item={item} onDone={run} busy={saving} />
          ))}
        </ul>
      )}

      {rest.length > 0 ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setRestOpen((v) => !v)}
            aria-expanded={restOpen}
            className="mea-link text-sm"
          >
            {restOpen ? "Hide the rest" : `The rest (${rest.length})`}
          </button>
          {restOpen ? (
            <ul className="mt-3 flex flex-col gap-3">
              {rest.map((item) => (
                <ThresholdCard key={item.id} item={item} onDone={run} busy={saving} />
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}

function ThresholdCard({
  item,
  onDone,
  busy,
}: {
  item: Item
  onDone: ReturnType<typeof useMea>["run"]
  busy: boolean
}) {
  const room = ROOM_MAP[item.room]
  const dueLabel = item.due ? formatDate(item.due) : null
  const days = daysUntil(item.due)

  return (
    <li className="mea-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-[var(--mea-dim)]">{room.name}</span>
            <Chip tone={item.isExample ? "example" : "working"} />
          </div>
          <p className="text-pretty text-[15px] leading-snug text-[var(--mea-silver)]">{item.title}</p>
          <p className="mt-1 text-xs text-[var(--mea-dim)]">
            {item.kind === "draft" ? "Pending draft" : item.kind === "task" ? "Task" : item.kind}
            {dueLabel ? ` · ${dueLabel}` : " · no date"}
            {days !== null ? (days < 0 ? ` · ${Math.abs(days)}d ago` : days === 0 ? " · today" : ` · in ${days}d`) : ""}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        {item.kind === "draft" ? (
          <Link
            href="/mea/hands"
            className="mea-tap inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--mea-veil)] px-4 text-sm text-[var(--mea-silver)] hover:border-[var(--mea-teal)]"
          >
            {nextActionLabel(item)} <ArrowRight size={15} aria-hidden />
          </Link>
        ) : (
          <MeaButton
            variant="ghost"
            disabled={busy}
            onClick={() => onDone({ type: "status", id: item.id, status: "done" })}
          >
            <Check size={16} aria-hidden /> Mark done
          </MeaButton>
        )}
      </div>
    </li>
  )
}
