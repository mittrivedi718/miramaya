"use client"

import { useState } from "react"
import { Check, Copy, Pencil, X, Undo } from "lucide-react"
import { ROOM_MAP } from "@/lib/mea/rooms"
import type { Item } from "@/lib/mea/schema"
import { allOfKind } from "@/lib/mea/select"
import { useMea } from "./provider"
import { Chip, EmptyState, Field, inputClass, MeaButton, SectionTitle, Surface } from "./ui"

// Email / Slack sits at DRAFT — MEA never sends. "Mark reviewed" means reviewed
// for manual use. Nothing here ever leaves MEA.
export function HandsView() {
  const { document } = useMea()
  const drafts = allOfKind(document, "draft")
  const pending = drafts.filter((d) => d.status !== "dismissed" && d.status !== "done")
  const dismissed = drafts.filter((d) => d.status === "dismissed" || d.status === "done")

  return (
    <section aria-labelledby="hands-title" className="mea-room-enter pt-2">
      <SectionTitle sub="Every draft shows its exact recipient, full body and source. MEA drafts — it never sends. Copy it out to send it yourself.">
        <span id="hands-title">Hands</span>
      </SectionTitle>

      {pending.length === 0 ? (
        <EmptyState line="No drafts to review. Prepare a follow-up from an MXI pitch, or capture a draft from the Mirror Line below." />
      ) : (
        <ul className="flex flex-col gap-3">
          {pending.map((d) => (
            <DraftCard key={d.id} draft={d} />
          ))}
        </ul>
      )}

      {dismissed.length > 0 ? (
        <div className="mt-5">
          <h3 className="mb-2 text-sm text-[var(--mea-dim)]">Set aside</h3>
          <ul className="flex flex-col gap-2">
            {dismissed.map((d) => (
              <DismissedRow key={d.id} draft={d} />
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}

function DraftCard({ draft }: { draft: Item }) {
  const { run, saving } = useMea()
  const [editing, setEditing] = useState(false)
  const [recipient, setRecipient] = useState(draft.recipient)
  const [subject, setSubject] = useState(draft.subject ?? "")
  const [body, setBody] = useState(draft.body)
  const [copied, setCopied] = useState(false)
  const [note, setNote] = useState<string | null>(null)

  const reviewed = draft.status === "reviewed"
  const room = ROOM_MAP[draft.room]

  async function saveEdits() {
    const result = await run({
      type: "edit",
      id: draft.id,
      patch: { recipient: recipient.trim(), subject: subject.trim(), body },
    })
    if (result.ok) {
      setEditing(false)
      if (result.note) setNote(result.note)
      else setNote(null)
    } else {
      setNote(result.error)
    }
  }

  async function copyOut() {
    const text = [recipient ? `To: ${recipient}` : "", subject ? `Subject: ${subject}` : "", "", body].join("\n").trim()
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setNote("Couldn't reach the clipboard. Select the text and copy it manually.")
    }
  }

  return (
    <li>
      <Surface className="p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-[var(--mea-dim)]">{room.name}</span>
          <Chip tone={draft.isExample ? "example" : "working"} />
          <span className="text-[11px] text-[var(--mea-dim)]">Email · DRAFT — never sent</span>
          {reviewed ? (
            <span className="rounded-full border border-[var(--mea-teal)] px-2 py-0.5 text-[11px] text-[var(--mea-cyan)]">
              Reviewed for manual use
            </span>
          ) : null}
        </div>

        <h3 className="text-pretty text-[15px] text-[var(--mea-silver)]">{draft.title}</h3>

        {draft.reviewInvalidated ? (
          <p className="mt-2 rounded-lg border border-[var(--mea-veil)] bg-[color-mix(in_oklab,var(--mea-mira)_12%,transparent)] px-3 py-2 text-xs text-[var(--mea-mira)]">
            This draft was edited after being reviewed, so its review was cleared. Review it again before you rely on it.
          </p>
        ) : null}

        {editing ? (
          <div className="mt-3 flex flex-col gap-3">
            <Field label="Recipient">
              <input className={inputClass} value={recipient} onChange={(e) => setRecipient(e.target.value)} />
            </Field>
            <Field label="Subject">
              <input className={inputClass} value={subject} onChange={(e) => setSubject(e.target.value)} />
            </Field>
            <Field label="Body">
              <textarea className={inputClass + " min-h-40 py-2 leading-relaxed"} value={body} onChange={(e) => setBody(e.target.value)} />
            </Field>
            <p className="text-xs text-[var(--mea-dim)]">Editing a reviewed draft clears its review.</p>
            <div className="flex items-center gap-2">
              <MeaButton variant="primary" onClick={() => void saveEdits()} disabled={saving}>
                Save changes
              </MeaButton>
              <MeaButton
                variant="quiet"
                onClick={() => {
                  setRecipient(draft.recipient)
                  setSubject(draft.subject ?? "")
                  setBody(draft.body)
                  setEditing(false)
                }}
              >
                Cancel
              </MeaButton>
            </div>
          </div>
        ) : (
          <div className="mt-3">
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
              <dt className="text-[var(--mea-dim)]">To</dt>
              <dd className="text-[var(--mea-silver)]">{draft.recipient || <span className="text-[var(--mea-mira)]">no recipient — add one before copying</span>}</dd>
              {draft.subject ? (
                <>
                  <dt className="text-[var(--mea-dim)]">Subject</dt>
                  <dd className="text-[var(--mea-silver)]">{draft.subject}</dd>
                </>
              ) : null}
              {draft.source ? (
                <>
                  <dt className="text-[var(--mea-dim)]">Source</dt>
                  <dd className="text-[var(--mea-silver)]">{draft.source}</dd>
                </>
              ) : null}
            </dl>
            <p className="mt-3 whitespace-pre-wrap text-pretty text-sm leading-relaxed text-[var(--mea-silver)]">{draft.body}</p>
          </div>
        )}

        {note ? <p className="mt-3 text-xs text-[var(--mea-mira)]">{note}</p> : null}

        {!editing ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <MeaButton variant="ghost" onClick={() => setEditing(true)} className="px-3 text-xs">
              <Pencil size={14} aria-hidden /> Edit
            </MeaButton>
            {!reviewed ? (
              <MeaButton
                variant="ghost"
                disabled={saving}
                onClick={() => run({ type: "status", id: draft.id, status: "reviewed" })}
                className="px-3 text-xs"
              >
                <Check size={14} aria-hidden /> Mark reviewed
              </MeaButton>
            ) : null}
            <MeaButton variant="ghost" onClick={() => void copyOut()} className="px-3 text-xs">
              <Copy size={14} aria-hidden /> {copied ? "Copied" : "Copy"}
            </MeaButton>
            <MeaButton
              variant="quiet"
              disabled={saving}
              onClick={() => run({ type: "status", id: draft.id, status: "dismissed" })}
              className="px-2 text-xs"
            >
              <X size={14} aria-hidden /> Dismiss
            </MeaButton>
          </div>
        ) : null}
      </Surface>
    </li>
  )
}

function DismissedRow({ draft }: { draft: Item }) {
  const { run, saving } = useMea()
  return (
    <li>
      <Surface className="flex items-center justify-between gap-3 p-3">
        <span className="min-w-0 flex-1 truncate text-sm text-[var(--mea-dim)]">{draft.title}</span>
        <MeaButton
          variant="quiet"
          disabled={saving}
          onClick={() => run({ type: "status", id: draft.id, status: "draft" })}
          className="shrink-0 px-2 text-xs"
        >
          <Undo size={14} aria-hidden /> Restore
        </MeaButton>
      </Surface>
    </li>
  )
}
