// The pure command reducer. Given a document and a validated command, it returns
// the next document. It runs ONLY on the server, so this is where authority is
// enforced: capability ceilings, record limits, and review invalidation live here
// and cannot be talked out of by a tampered client.

import { clampToCeiling, LIMIT_HISTORY, LIMIT_RECORDS } from "./rooms"
import type { ActivityEntry, Command, Item, WorkspaceDocument } from "./schema"

export type ReduceResult =
  | { ok: true; doc: WorkspaceDocument; resultId?: string; note?: string }
  | { ok: false; error: string; missing?: string[] }

function now(): string {
  return new Date().toISOString()
}

function newId(): string {
  return `it-${globalThis.crypto.randomUUID()}`
}

const INITIAL_STATUS: Record<Item["kind"], Item["status"]> = {
  task: "open",
  draft: "draft",
  memory: "unverified",
  pitch: "active",
  mirror: "captured",
  window: "open",
  door: "open",
}

function record(doc: WorkspaceDocument, entry: Omit<ActivityEntry, "id" | "at" | "undone">): WorkspaceDocument {
  const full: ActivityEntry = { id: `ac-${globalThis.crypto.randomUUID()}`, at: now(), undone: false, ...entry }
  return { ...doc, activity: [full, ...doc.activity].slice(0, LIMIT_HISTORY) }
}

// A door is a real commitment: it must name an owner, a next action and a date.
function doorMissingFields(item: Partial<Item>): string[] {
  const missing: string[] = []
  if (!item.recipient?.trim()) missing.push("an owner")
  if (!item.nextAction?.trim()) missing.push("a next action")
  if (!item.due) missing.push("a date")
  return missing
}

export function applyCommand(doc: WorkspaceDocument, cmd: Command): ReduceResult {
  switch (cmd.type) {
    case "create": {
      if (doc.items.length >= LIMIT_RECORDS) {
        return { ok: false, error: `Pilot limit reached (${LIMIT_RECORDS} records). Clear something first.` }
      }
      const base: Item = {
        id: newId(),
        room: cmd.room,
        kind: cmd.kind,
        title: cmd.title.trim(),
        body: cmd.body?.trim() ?? "",
        status: INITIAL_STATUS[cmd.kind],
        recipient: cmd.recipient?.trim() ?? "",
        due: cmd.due ?? null,
        source: cmd.source?.trim() ?? "",
        isExample: false,
        createdAt: now(),
        updatedAt: now(),
        subject: cmd.subject?.trim() || undefined,
        person: cmd.person?.trim() || undefined,
        contact: cmd.contact?.trim() || undefined,
        stage: cmd.stage?.trim() || undefined,
        nextAction: cmd.nextAction?.trim() || undefined,
        reviewDate: cmd.reviewDate ?? undefined,
        contradicts: cmd.contradicts || undefined,
        confirmed: cmd.kind === "memory" ? false : undefined,
      }
      if (cmd.kind === "door") {
        const missing = doorMissingFields(base)
        if (missing.length) return { ok: false, error: "A door needs its fields.", missing }
      }
      const next = record({ ...doc, items: [base, ...doc.items] }, {
        summary: `Created ${cmd.kind} “${base.title}” in ${cmd.room}`,
        kind: "create",
        itemId: base.id,
        before: null,
        after: base,
      })
      return { ok: true, doc: next, resultId: base.id }
    }

    case "edit": {
      const idx = doc.items.findIndex((i) => i.id === cmd.id)
      if (idx < 0) return { ok: false, error: "That record no longer exists." }
      const before = doc.items[idx]
      const patch = cmd.patch
      const next: Item = { ...before, ...patch, updatedAt: now() }

      // Promoting a window to a door is a real state transition with required fields.
      if (patch.kind === "door" && before.kind !== "door") {
        const missing = doorMissingFields(next)
        if (missing.length) return { ok: false, error: "Opening a window into a door needs its fields.", missing }
        next.status = "open"
      }

      // Editing a reviewed draft invalidates the review — and says so.
      let note: string | undefined
      const touchedContent =
        patch.title !== undefined ||
        patch.body !== undefined ||
        patch.recipient !== undefined ||
        patch.subject !== undefined
      if (before.kind === "draft" && before.status === "reviewed" && touchedContent) {
        next.status = "draft"
        next.reviewInvalidated = true
        note = "Editing this reviewed draft cleared its review. Review it again before you rely on it."
      }

      const items = [...doc.items]
      items[idx] = next
      const recorded = record({ ...doc, items }, {
        summary: `Edited “${next.title}”`,
        kind: "edit",
        itemId: next.id,
        before,
        after: next,
      })
      return { ok: true, doc: recorded, resultId: next.id, note }
    }

    case "status": {
      const idx = doc.items.findIndex((i) => i.id === cmd.id)
      if (idx < 0) return { ok: false, error: "That record no longer exists." }
      const before = doc.items[idx]
      const next: Item = { ...before, status: cmd.status, updatedAt: now() }
      if (before.kind === "memory") next.confirmed = cmd.status === "confirmed"
      if (before.kind === "draft" && cmd.status === "reviewed") next.reviewInvalidated = false
      const items = [...doc.items]
      items[idx] = next
      const recorded = record({ ...doc, items }, {
        summary: `Set “${next.title}” to ${cmd.status}`,
        kind: "status",
        itemId: next.id,
        before,
        after: next,
      })
      return { ok: true, doc: recorded, resultId: next.id }
    }

    case "remove": {
      const before = doc.items.find((i) => i.id === cmd.id)
      if (!before) return { ok: false, error: "That record no longer exists." }
      const items = doc.items.filter((i) => i.id !== cmd.id)
      const recorded = record({ ...doc, items }, {
        summary: `Removed “${before.title}” (a snapshot stays in history)`,
        kind: "remove",
        itemId: before.id,
        before,
        after: null,
      })
      return { ok: true, doc: recorded }
    }

    case "undo": {
      const entry = cmd.entryId
        ? doc.activity.find((a) => a.id === cmd.entryId && !a.undone)
        : doc.activity.find((a) => !a.undone && a.kind !== "undo" && a.itemId !== null)
      if (!entry) return { ok: false, error: "Nothing here can be undone." }

      let items = [...doc.items]
      if (entry.before === null && entry.after) {
        // Was a creation → remove it.
        items = items.filter((i) => i.id !== entry.after!.id)
      } else if (entry.before && entry.after === null) {
        // Was a removal → restore the snapshot.
        items = [entry.before, ...items]
      } else if (entry.before) {
        // Was an edit/status → restore the prior snapshot.
        const idx = items.findIndex((i) => i.id === entry.before!.id)
        if (idx >= 0) items[idx] = entry.before
        else items = [entry.before, ...items]
      }
      const activity = doc.activity.map((a) => (a.id === entry.id ? { ...a, undone: true } : a))
      const recorded = record({ ...doc, items, activity }, {
        summary: `Undid: ${entry.summary}`,
        kind: "undo",
        itemId: entry.itemId,
        before: null,
        after: null,
      })
      return { ok: true, doc: recorded }
    }

    case "clearExamples": {
      const removed = doc.items.filter((i) => i.isExample).length
      const items = doc.items.filter((i) => !i.isExample)
      const recorded = record({ ...doc, items }, {
        summary: `Cleared ${removed} example record${removed === 1 ? "" : "s"}`,
        kind: "clear",
        itemId: null,
        before: null,
        after: null,
      })
      return { ok: true, doc: recorded }
    }

    case "roomVoice": {
      const current = doc.voices[cmd.room]
      const merged = { ...current, ...cmd.voice }
      const voices = { ...doc.voices, [cmd.room]: merged }
      const recorded = record({ ...doc, voices }, {
        summary: `Updated voice for ${cmd.room}`,
        kind: "voice",
        itemId: null,
        before: null,
        after: null,
      })
      return { ok: true, doc: recorded }
    }

    case "capabilityPolicy": {
      // The server clamps to the ceiling. A client cannot raise authority.
      const applied = clampToCeiling(cmd.capability, cmd.level)
      const permissions = { ...doc.permissions, [cmd.capability]: applied }
      const clamped = applied !== cmd.level
      const recorded = record({ ...doc, permissions }, {
        summary: `Set ${cmd.capability} to ${applied}${clamped ? ` (requested ${cmd.level}, clamped to ceiling)` : ""}`,
        kind: "policy",
        itemId: null,
        before: null,
        after: null,
      })
      return { ok: true, doc: recorded, note: clamped ? `${cmd.capability} is capped at ${applied}.` : undefined }
    }

    case "buildCheck": {
      const checks = doc.checks.map((c) => (c.key === cmd.key ? { ...c, done: cmd.done } : c))
      return { ok: true, doc: { ...doc, checks } }
    }
  }
}
