"use client"

import { useEffect } from "react"
import { X, ArrowRight } from "lucide-react"
import Link from "next/link"
import type { Item } from "@/lib/mea/schema"
import { formatDate } from "@/lib/mea/select"
import { useMea } from "./provider"
import { Chip, MeaButton } from "./ui"

const KIND_LABEL: Record<Item["kind"], string> = {
  mirror: "Mirror — captured, not yet shaped",
  window: "Window — an open idea",
  door: "Door — an opportunity with an owner",
  task: "Task",
  draft: "Draft",
  memory: "Memory",
  pitch: "Pitch",
}

export function RecordSheet({
  item,
  onClose,
  onPromote,
}: {
  item: Item
  onClose: () => void
  onPromote?: () => void
}) {
  const { run, saving } = useMea()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={item.title}>
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="mea-surface relative z-10 w-full max-w-md rounded-b-none rounded-t-2xl p-5 sm:rounded-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-[var(--mea-dim)]">{KIND_LABEL[item.kind]}</p>
            <h2 className="mt-1 text-pretty font-display text-xl text-[var(--mea-silver)]">{item.title}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="mea-tap rounded-lg p-1 text-[var(--mea-dim)]">
            <X size={18} aria-hidden />
          </button>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Chip tone={item.isExample ? "example" : "working"} />
          {item.due ? <span className="text-xs text-[var(--mea-dim)]">{formatDate(item.due)}</span> : null}
        </div>

        {item.body ? <p className="mt-3 text-pretty text-sm leading-relaxed text-[var(--mea-dim)]">{item.body}</p> : null}
        {item.recipient ? <p className="mt-2 text-xs text-[var(--mea-dim)]">Owner: {item.recipient}</p> : null}
        {item.nextAction ? <p className="mt-1 text-xs text-[var(--mea-dim)]">Next: {item.nextAction}</p> : null}
        {item.source ? <p className="mt-1 text-xs text-[var(--mea-dim)]">Source: {item.source}</p> : null}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {item.kind === "window" && onPromote ? (
            <MeaButton variant="primary" onClick={onPromote}>
              Open into a door <ArrowRight size={15} aria-hidden />
            </MeaButton>
          ) : null}

          {item.kind === "door" && item.status !== "closed" ? (
            <MeaButton
              variant="ghost"
              disabled={saving}
              onClick={async () => {
                await run({ type: "status", id: item.id, status: "closed" })
                onClose()
              }}
            >
              Close with outcome
            </MeaButton>
          ) : null}

          {item.kind === "draft" ? (
            <Link href="/mea/hands" className="mea-link text-sm" onClick={onClose}>
              Review in Hands
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  )
}
