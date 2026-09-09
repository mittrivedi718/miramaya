"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, ArrowRight, DoorOpen, PenLine, AudioLines, Layers, ScrollText } from "lucide-react"
import { ROOM_MAP } from "@/lib/mea/rooms"
import type { Item, WorkspaceDocument } from "@/lib/mea/schema"
import { thresholdQueue, formatDate, daysUntil, nextActionLabel } from "@/lib/mea/select"
import { useMea } from "./provider"
import { Chip, EmptyState, MeaButton, SectionTitle } from "./ui"

// The MEA home reads top-to-bottom: the logo, a dashboard of where things stand,
// the executive-assistant functions, then the live queue of what matters now.
export function ThresholdView() {
  const { document, run, saving } = useMea()
  const queue = thresholdQueue(document)
  const top = queue.slice(0, 3)
  const rest = queue.slice(3)
  const [restOpen, setRestOpen] = useState(false)

  return (
    <section aria-labelledby="home-title" className="mea-room-enter pt-2">
      <Masthead />
      <Dashboard doc={document} />
      <Functions />

      <div className="mt-8">
        <SectionTitle sub="Dated tasks first, then drafts to review, then the undated.">
          <span id="threshold-title">What matters now</span>
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
      </div>
    </section>
  )
}

// The logo, framed as an app medallion. The emblem lives on black, so a fixed
// dark disc keeps it intentional whichever palette the room is wearing.
function Masthead() {
  return (
    <header className="mb-6 flex flex-col items-center pt-2 text-center">
      <span
        className="relative grid size-24 place-items-center rounded-3xl"
        style={{
          background: "radial-gradient(circle at 50% 38%, #14131c, #050509)",
          boxShadow: "0 0 0 1px var(--mea-veil), 0 10px 30px -12px var(--mea-mira)",
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-2 rounded-2xl blur-md"
          style={{ background: "radial-gradient(circle, var(--mea-mira) 0%, transparent 70%)", opacity: 0.35 }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/mea/mea-eye.png"
          alt="MEA — an almond eye with a lowercase i in its iris"
          className="relative w-[112%] max-w-none"
          style={{ mixBlendMode: "screen" }}
        />
      </span>
      <h1 id="home-title" className="mea-display mt-4 text-3xl tracking-tight text-[var(--mea-silver)]">
        MEA
      </h1>
      <p className="mt-1 text-sm text-[var(--mea-dim)]">Your executive assistant. It watches, drafts, and remembers — it never acts alone.</p>
    </header>
  )
}

// A glanceable dashboard. Every number is derived from real records — no invented
// urgency, and the attention line names exactly what is overdue or due today.
function Dashboard({ doc }: { doc: WorkspaceDocument }) {
  const items = doc.items
  const openTasks = items.filter((i) => i.kind === "task" && i.status === "open")
  const overdue = openTasks.filter((i) => (daysUntil(i.due) ?? 1) < 0).length
  const dueToday = openTasks.filter((i) => daysUntil(i.due) === 0).length
  const drafts = items.filter((i) => i.kind === "draft" && i.status === "draft").length
  const openDoors = items.filter((i) => i.kind === "door" && i.status !== "closed").length
  const toVerify = items.filter((i) => i.kind === "memory" && !i.confirmed).length

  const tiles = [
    { n: openTasks.length, label: "Open tasks" },
    { n: drafts, label: "Drafts to review" },
    { n: openDoors, label: "Open doors" },
    { n: toVerify, label: "Memories to verify" },
  ]

  const attention =
    overdue > 0 || dueToday > 0
      ? `${overdue} overdue · ${dueToday} due today`
      : "Nothing overdue or due today"

  return (
    <div className="mea-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--mea-dim)]">Where things stand</p>
        <p className={`text-xs ${overdue > 0 ? "text-[var(--mea-mira)]" : "text-[var(--mea-dim)]"}`}>{attention}</p>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {tiles.map((t) => (
          <div
            key={t.label}
            className="flex flex-col gap-1 rounded-xl border border-[var(--mea-veil)] bg-[var(--mea-ground)] p-3"
          >
            <dt className="order-2 text-[11px] leading-tight text-[var(--mea-dim)]">{t.label}</dt>
            <dd className="order-1 mea-display text-2xl leading-none text-[var(--mea-silver)]">{t.n}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

// The executive-assistant functions, offered as cards below the dashboard.
const FUNCTIONS = [
  { href: "/mea/doors", label: "Doors", icon: DoorOpen, line: "Rooms, gardens and follow-ups" },
  { href: "/mea/hands", label: "Hands", icon: PenLine, line: "Review and shape drafts" },
  { href: "/mea/voice", label: "Voice", icon: AudioLines, line: "How MEA sounds, per room" },
  { href: "/mea/vault", label: "Vault", icon: Layers, line: "Permissions and authority" },
  { href: "/mea/ledger", label: "Ledger", icon: ScrollText, line: "Every action, undoable" },
] as const

function Functions() {
  return (
    <div className="mt-6">
      <p className="mb-3 text-xs uppercase tracking-[0.18em] text-[var(--mea-dim)]">What MEA can do</p>
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3">
        {FUNCTIONS.map((f) => {
          const Icon = f.icon
          return (
            <Link
              key={f.href}
              href={f.href}
              className="mea-tap group flex min-h-[76px] flex-col justify-between gap-2 rounded-2xl border border-[var(--mea-veil)] bg-[var(--mea-ground)] p-3 hover:border-[var(--mea-teal)]"
            >
              <Icon size={18} className="text-[var(--mea-cyan)]" strokeWidth={1.75} aria-hidden />
              <span>
                <span className="block text-sm font-medium text-[var(--mea-silver)]">{f.label}</span>
                <span className="block text-[11px] leading-tight text-[var(--mea-dim)]">{f.line}</span>
              </span>
            </Link>
          )
        })}
      </div>
    </div>
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
