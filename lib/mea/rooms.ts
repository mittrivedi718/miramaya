// Static shape of MEA: the seven rooms, the capability ladder, and the palettes.
// These are constants, not user data — they describe the world, not what's in it.

export const ROOM_IDS = ["mxi", "meetmit", "miramaya", "m3", "nulife", "home", "social"] as const
export type RoomId = (typeof ROOM_IDS)[number]

export type Room = {
  id: RoomId
  name: string
  tagline: string
  voice: string
}

export const ROOMS: Room[] = [
  { id: "mxi", name: "MXI · 1011", tagline: "Concept links, pitches, approvals", voice: "Precise, creative, confidentiality-aware" },
  { id: "meetmit", name: "meetMit.me", tagline: "Portfolio, milestones, team tasks", voice: "Clear, imaginative, direct" },
  { id: "miramaya", name: "Mira Maya", tagline: "Product concepts, launch prep, inventory", voice: "Minimal, sensory, no invented claims" },
  { id: "m3", name: "M³ Collective", tagline: "Shoot scope, studio, collaborators", voice: "Collaborative, concrete about logistics" },
  { id: "nulife", name: "NuLife", tagline: "Research operations, evidence, replies", voice: "Formal, full names when verified, never casual" },
  { id: "home", name: "Home", tagline: "Household actions, objects, deadlines", voice: "Practical, kind, one next action" },
  { id: "social", name: "Social", tagline: "RSVPs, plans, group logistics", voice: "Short, warm, often lowercase" },
]

export const ROOM_MAP: Record<RoomId, Room> = Object.fromEntries(ROOMS.map((r) => [r.id, r])) as Record<RoomId, Room>

export function isRoomId(value: string): value is RoomId {
  return (ROOM_IDS as readonly string[]).includes(value)
}

// ── Capabilities ───────────────────────────────────────────────────────────
// Three levels of authority. Reading is WATCH, never DO — reading is not harmless.
export const LEVELS = ["WATCH", "DRAFT", "DO"] as const
export type Level = (typeof LEVELS)[number]
export const LEVEL_RANK: Record<Level, number> = { WATCH: 0, DRAFT: 1, DO: 2 }

export const CAPABILITY_IDS = ["read", "own", "holds", "comms", "invites", "money"] as const
export type CapabilityId = (typeof CAPABILITY_IDS)[number]

export type Capability = {
  id: CapabilityId
  label: string
  default: Level
  ceiling: Level
  note: string
}

// `ceiling` is the maximum autonomy the server will ever allow for a capability,
// regardless of what a client submits. These ceilings are the product's spine.
export const CAPABILITIES: Capability[] = [
  { id: "read", label: "Read approved sources", default: "WATCH", ceiling: "WATCH", note: "Consent and scope still required" },
  { id: "own", label: "MEA's own tasks and notes", default: "DO", ceiling: "DO", note: "Logged, internally undoable" },
  { id: "holds", label: "Private calendar holds", default: "DRAFT", ceiling: "DRAFT", note: "May become DO later; zero attendees" },
  { id: "comms", label: "Email / Slack", default: "DRAFT", ceiling: "DRAFT", note: "No autonomous send, ever, including scheduled" },
  { id: "invites", label: "Invitations", default: "DRAFT", ceiling: "DRAFT", note: "Other people are affected — treat as communication" },
  { id: "money", label: "Money", default: "WATCH", ceiling: "WATCH", note: "Fixed. No payment path exists in the UI at all" },
]

export const CAPABILITY_MAP: Record<CapabilityId, Capability> = Object.fromEntries(
  CAPABILITIES.map((c) => [c.id, c]),
) as Record<CapabilityId, Capability>

export function isCapabilityId(value: string): value is CapabilityId {
  return (CAPABILITY_IDS as readonly string[]).includes(value)
}

/** Clamp a requested level down to a capability's ceiling. Server-side only. */
export function clampToCeiling(capability: CapabilityId, requested: Level): Level {
  const ceiling = CAPABILITY_MAP[capability].ceiling
  return LEVEL_RANK[requested] > LEVEL_RANK[ceiling] ? ceiling : requested
}

// ── Palettes ─────────────────────────────────────────────────────────────
export const PALETTES = ["miramire", "daylight", "obsidian", "auto"] as const
export type Palette = (typeof PALETTES)[number]

// Pilot limits, surfaced in Ledger.
export const LIMIT_RECORDS = 600
export const LIMIT_HISTORY = 120
