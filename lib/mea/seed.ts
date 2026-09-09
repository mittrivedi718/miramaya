// The starter workspace. Everything here is flagged isExample so it can be
// wiped with one tap in Ledger and never masquerades as real work.

import { CAPABILITIES, ROOMS, type RoomId } from "./rooms"
import type { Item, RoomVoice, WorkspaceDocument } from "./schema"

function iso(offsetDays = 0): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() + offsetDays)
  return d.toISOString()
}

function dateOnly(offsetDays: number): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

let n = 0
function ex(partial: Omit<Item, "id" | "isExample" | "createdAt" | "updatedAt"> & Partial<Pick<Item, "createdAt">>): Item {
  n += 1
  return {
    body: "",
    recipient: "",
    due: null,
    source: "",
    ...partial,
    id: `ex-${n}`,
    isExample: true,
    createdAt: partial.createdAt ?? iso(-n),
    updatedAt: iso(-n),
  } as Item
}

function seedItems(): Item[] {
  return [
    // ── MXI · 1011 — the deep room ──────────────────────────────────────
    ex({
      room: "mxi", kind: "pitch", title: "Concept partner — placeholder A", status: "active",
      person: "Placeholder Person A", contact: "a@example.com (unverified example)", stage: "pitched",
      due: dateOnly(2), source: "MXI concept list", body: "Example pitch record. No real person; no reply implied.",
    }),
    ex({
      room: "mxi", kind: "pitch", title: "Concept partner — placeholder B", status: "active",
      person: "Placeholder Person B", contact: "b@example.com (unverified example)", stage: "contacted",
      due: dateOnly(5), source: "MXI concept list", body: "Example pitch record.",
    }),
    ex({
      room: "mxi", kind: "pitch", title: "Concept partner — placeholder C", status: "active",
      person: "Placeholder Person C", contact: "c@example.com (unverified example)", stage: "lead",
      due: dateOnly(9), source: "MXI concept list", body: "Example pitch record.",
    }),
    ex({
      room: "mxi", kind: "draft", title: "Follow-up to Placeholder Person A", status: "draft",
      recipient: "a@example.com (unverified example)", subject: "Following up on the concept",
      source: "Pitch: Concept partner — placeholder A",
      body: "Hi Placeholder — following up on the concept we discussed. Example draft only; nothing has been sent.",
    }),
    // Three confirmed MXI memories → the MXI tree shows three rings.
    ex({ room: "mxi", kind: "memory", title: "Concept scope is confidential until signed", status: "confirmed", confirmed: true, subject: "MXI · 1011", source: "Founder decision", reviewDate: dateOnly(60) }),
    ex({ room: "mxi", kind: "memory", title: "Pitches go out one at a time, not in batches", status: "confirmed", confirmed: true, subject: "MXI · 1011", source: "Founder decision", reviewDate: dateOnly(60) }),
    ex({ room: "mxi", kind: "memory", title: "Stage changes are always manual", status: "confirmed", confirmed: true, subject: "MXI · 1011", source: "Build guide", reviewDate: dateOnly(60) }),
    // Garden objects for MXI: two windows, one open door.
    ex({ room: "mxi", kind: "window", title: "A licensing angle worth exploring", status: "open", body: "An open idea. Visible, not yet actionable." }),
    ex({ room: "mxi", kind: "window", title: "Reframe the deck around one story", status: "open", body: "An open idea, not yet owned." }),
    ex({
      room: "mxi", kind: "door", title: "Close the placeholder-A concept", status: "open",
      recipient: "Mit (owner)", nextAction: "Send the reviewed follow-up", due: dateOnly(3),
      source: "Pitch: Concept partner — placeholder A", body: "An opportunity with an owner, a room, a next action and a date.",
    }),

    // ── meetMit.me — a dated task ───────────────────────────────────────
    ex({ room: "meetmit", kind: "task", title: "Draft the portfolio milestone note", status: "open", due: dateOnly(1), source: "meetMit.me milestones" }),
    // ── Home — an undated task ──────────────────────────────────────────
    ex({ room: "home", kind: "task", title: "Replace the water filter", status: "open", source: "Home" }),

    // ── Mira Maya — a contradiction pair, both visible ──────────────────
    ex({ room: "miramaya", kind: "memory", title: "Launch is targeted for spring", status: "confirmed", confirmed: true, subject: "Mira Maya launch", source: "Planning note (older)", reviewDate: dateOnly(30) }),
    ex({ room: "miramaya", kind: "memory", title: "Launch may slip to summer — unconfirmed", status: "unverified", confirmed: false, subject: "Mira Maya launch", source: "Hallway conversation", contradicts: "ex-13" }),
  ]
}

function seedVoices(): Record<RoomId, RoomVoice> {
  const base = Object.fromEntries(
    ROOMS.map((r) => [r.id, { instructions: r.voice, examples: [], prohibited: [] } satisfies RoomVoice]),
  ) as Record<RoomId, RoomVoice>

  base.mxi = {
    instructions:
      "Precise, creative, confidentiality-aware. Draft within MXI only. Never imply a reply, a signed deal, or a meeting that has not happened.",
    examples: [
      {
        audience: "A warm concept partner we have already spoken to",
        outcome: "Keep the thread alive without pressure",
        text: "Hi — I keep coming back to the idea we sketched. No rush at all, but I'd love to find twenty minutes to take it one step further whenever it suits you.",
      },
    ],
    prohibited: ["No prices unless a verified source states them", "No claim that anyone has agreed or signed", "No invented availability"],
  }

  return base
}

// The build's own checklist (section 11), lives in Ledger to tick off as verified.
const CHECK_ITEMS: [string, string][] = [
  ["surfaces", "Six surfaces navigable on a phone, thumb-reachable"],
  ["mirror-line", "Mirror Line captures into the room I select"],
  ["mxi-flow", "MXI pitch → draft → Hands → mark reviewed → copy works end to end"],
  ["invalidate", "Editing a reviewed draft invalidates its review with an explicit message"],
  ["vault", "Vault memories carry source and confirmation status"],
  ["garden", "Garden reflects real record state; window → door demands its fields"],
  ["ledger", "Ledger shows policy ceilings, history, guarded undo, JSON export"],
  ["palettes", "Three palettes plus follow-the-light"],
  ["persist", "Refresh reloads saved work; conflicts do not silently overwrite"],
  ["install", "Installs to the home screen and opens standalone"],
]

export function makeSeedDocument(): WorkspaceDocument {
  n = 0
  return {
    schemaVersion: 1,
    items: seedItems(),
    voices: seedVoices(),
    permissions: Object.fromEntries(CAPABILITIES.map((c) => [c.id, c.default])) as WorkspaceDocument["permissions"],
    checks: CHECK_ITEMS.map(([key, label]) => ({ key, label, done: false })),
    activity: [],
  }
}
