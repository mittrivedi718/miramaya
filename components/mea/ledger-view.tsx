"use client"

import { useState } from "react"
import { Download, Undo, Lock } from "lucide-react"
import { CAPABILITIES, LEVELS, LIMIT_HISTORY, LIMIT_RECORDS, type Level } from "@/lib/mea/rooms"
import { exampleCount, realItems } from "@/lib/mea/select"
import { useMea } from "./provider"
import { Chip, MeaButton, SectionTitle, Surface } from "./ui"

const CONNECTIONS = [
  { name: "Google Calendar", needs: "Read one selected calendar, scoped OAuth, revoke handling" },
  { name: "Gmail", needs: "One selected account, consent and scope review — no autonomous send" },
  { name: "ClickUp", needs: "Narrowly scoped token, verified workspace and list mapping" },
  { name: "Slack", needs: "Installed app, channel membership, visible posting identity" },
]

export function LedgerView() {
  const { document } = useMea()

  return (
    <section aria-labelledby="ledger-title" className="mea-room-enter pt-2">
      <SectionTitle sub="Make authority inspectable. Policy ceilings, connection status, recent changes, and a full export.">
        <span id="ledger-title">Ledger</span>
      </SectionTitle>

      <Policy />
      <Connections />
      <Limits real={realItems(document).length} examples={exampleCount(document)} />
      <History />
      <Checklist />
      <DataActions />
    </section>
  )
}

function Policy() {
  const { document, run, saving } = useMea()
  return (
    <div className="mb-5">
      <h3 className="mb-2 text-sm text-[var(--mea-dim)]">Capability policy — watch, draft, do</h3>
      <p className="mb-2 text-xs text-[var(--mea-dim)]">
        Reading is WATCH, never DO — reading is not harmless. The server clamps every request to the ceiling; a tampered
        client cannot raise it.
      </p>
      <ul className="flex flex-col gap-2">
        {CAPABILITIES.map((cap) => {
          const current = document.permissions[cap.id] ?? cap.default
          return (
            <li key={cap.id}>
              <Surface className="p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-[var(--mea-silver)]">{cap.label}</p>
                    <p className="mt-0.5 text-xs text-[var(--mea-dim)]">{cap.note}</p>
                    <p className="mt-1 text-[11px] text-[var(--mea-dim)]">Ceiling: {cap.ceiling}</p>
                  </div>
                  <label className="sr-only" htmlFor={`cap-${cap.id}`}>
                    {cap.label} level
                  </label>
                  <select
                    id={`cap-${cap.id}`}
                    value={current}
                    disabled={saving || cap.ceiling === cap.default && cap.id === "money"}
                    onChange={(e) => run({ type: "capabilityPolicy", capability: cap.id, level: e.target.value as Level })}
                    className="min-h-9 shrink-0 rounded-lg border border-[var(--mea-veil)] bg-[var(--mea-ground)] px-2 text-xs text-[var(--mea-silver)] outline-none focus:border-[var(--mea-teal)]"
                  >
                    {LEVELS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </Surface>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function Connections() {
  return (
    <div className="mb-5">
      <h3 className="mb-2 text-sm text-[var(--mea-dim)]">Connections</h3>
      <ul className="flex flex-col gap-2">
        {CONNECTIONS.map((c) => (
          <li key={c.name}>
            <Surface className="p-3.5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-[var(--mea-silver)]">{c.name}</p>
                <Chip tone="notconnected" />
              </div>
              <p className="mt-1 text-xs text-[var(--mea-dim)]">Will need: {c.needs}</p>
              <p className="mt-1 flex items-center gap-1 text-[11px] text-[var(--mea-dim)]">
                <Lock size={11} aria-hidden /> Cannot be switched on in this build.
              </p>
            </Surface>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Limits({ real, examples }: { real: number; examples: number }) {
  return (
    <Surface className="mb-5 p-3.5 text-xs text-[var(--mea-dim)]">
      <p>
        Pilot limits: {real + examples} of {LIMIT_RECORDS} records ({real} yours, {examples} examples). Last {LIMIT_HISTORY}{" "}
        changes retained.
      </p>
      <p className="mt-1">Removing a record may leave its snapshot in history — this build does not promise silent erasure.</p>
    </Surface>
  )
}

function History() {
  const { document, run, saving } = useMea()
  const entries = document.activity

  return (
    <div className="mb-5">
      <h3 className="mb-2 text-sm text-[var(--mea-dim)]">History — last {LIMIT_HISTORY} changes</h3>
      {entries.length === 0 ? (
        <Surface className="p-3.5 text-xs text-[var(--mea-dim)]">No changes yet. Your actions will appear here.</Surface>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {entries.map((e) => {
            const undoable = !e.undone && e.itemId !== null && e.kind !== "undo"
            return (
              <li key={e.id}>
                <Surface className="flex items-center justify-between gap-3 p-3">
                  <div className="min-w-0">
                    <p className={"truncate text-xs " + (e.undone ? "text-[var(--mea-dim)] line-through" : "text-[var(--mea-silver)]")}>
                      {e.summary}
                    </p>
                    <p className="text-[10px] text-[var(--mea-dim)]">{new Date(e.at).toLocaleString()}</p>
                  </div>
                  {undoable ? (
                    <MeaButton
                      variant="quiet"
                      disabled={saving}
                      onClick={() => run({ type: "undo", entryId: e.id })}
                      className="shrink-0 px-2 text-xs"
                    >
                      <Undo size={13} aria-hidden /> Undo
                    </MeaButton>
                  ) : (
                    <span className="shrink-0 text-[10px] text-[var(--mea-dim)]">{e.undone ? "undone" : "—"}</span>
                  )}
                </Surface>
              </li>
            )
          })}
        </ul>
      )}
      <p className="mt-2 text-[11px] text-[var(--mea-dim)]">
        Undo is capability-specific: internal record edits can be undone while their snapshot survives. A sent message could
        never be promised retractable — and nothing here is ever sent.
      </p>
    </div>
  )
}

function Checklist() {
  const { document, run, saving } = useMea()
  return (
    <div className="mb-5">
      <h3 className="mb-2 text-sm text-[var(--mea-dim)]">Build checklist</h3>
      <ul className="flex flex-col gap-1.5">
        {document.checks.map((c) => (
          <li key={c.key}>
            <label className="mea-surface flex cursor-pointer items-center gap-3 p-3 text-sm">
              <input
                type="checkbox"
                checked={c.done}
                disabled={saving}
                onChange={(e) => run({ type: "buildCheck", key: c.key, done: e.target.checked })}
                className="size-4 accent-[var(--mea-teal)]"
              />
              <span className={c.done ? "text-[var(--mea-dim)] line-through" : "text-[var(--mea-silver)]"}>{c.label}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  )
}

function DataActions() {
  const { document, run, saving } = useMea()
  const [confirmClear, setConfirmClear] = useState(false)
  const examples = exampleCount(document)

  function exportJson() {
    const blob = new Blob([JSON.stringify(document, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = window.document.createElement("a")
    a.href = url
    a.download = `mea-workspace-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mb-2">
      <h3 className="mb-2 text-sm text-[var(--mea-dim)]">Workspace</h3>
      <div className="flex flex-col gap-2">
        <MeaButton variant="ghost" onClick={exportJson}>
          <Download size={15} aria-hidden /> Export workspace as JSON
        </MeaButton>

        {examples > 0 ? (
          confirmClear ? (
            <Surface className="p-3.5">
              <p className="text-sm text-[var(--mea-silver)]">
                Remove all {examples} example records? Your real work is untouched.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <MeaButton
                  variant="danger"
                  disabled={saving}
                  onClick={async () => {
                    await run({ type: "clearExamples" })
                    setConfirmClear(false)
                  }}
                >
                  Clear examples
                </MeaButton>
                <MeaButton variant="quiet" onClick={() => setConfirmClear(false)}>
                  Keep them
                </MeaButton>
              </div>
            </Surface>
          ) : (
            <MeaButton variant="quiet" onClick={() => setConfirmClear(true)} className="justify-start">
              Clear examples ({examples})
            </MeaButton>
          )
        ) : (
          <p className="text-xs text-[var(--mea-dim)]">No example records remain — everything here is yours.</p>
        )}
      </div>
    </div>
  )
}
