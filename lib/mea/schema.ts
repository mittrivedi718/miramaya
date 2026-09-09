// Zod schemas for the MEA workspace document and every command.
// Types are inferred from the schemas so validation and TypeScript never drift.

import { z } from "zod"
import { CAPABILITY_IDS, LEVELS, ROOM_IDS } from "./rooms"

export const roomId = z.enum(ROOM_IDS)
export const level = z.enum(LEVELS)
export const capabilityId = z.enum(CAPABILITY_IDS)

// task | draft | memory | pitch are records; mirror | window | door are garden states.
export const itemKind = z.enum(["task", "draft", "memory", "pitch", "mirror", "window", "door"])
export const itemStatus = z.enum([
  "open",
  "done",
  "draft",
  "reviewed",
  "unverified",
  "confirmed",
  "active",
  "closed",
  "captured",
  "dismissed",
])

// Date-only string: "YYYY-MM-DD". No time, no zone — it books nothing.
const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a YYYY-MM-DD date")
  .nullable()

export const item = z.object({
  id: z.string(),
  room: roomId,
  kind: itemKind,
  title: z.string().min(1).max(240),
  body: z.string().max(6000).default(""),
  status: itemStatus,
  recipient: z.string().max(240).default(""),
  due: dateOnly.default(null),
  source: z.string().max(240).default(""),
  isExample: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
  // Kind-specific, all optional so one flat shape serves every kind.
  subject: z.string().max(240).optional(),
  confirmed: z.boolean().optional(),
  reviewDate: dateOnly.optional(),
  contradicts: z.string().nullable().optional(),
  person: z.string().max(240).optional(),
  contact: z.string().max(240).optional(),
  stage: z.string().max(60).optional(),
  nextAction: z.string().max(240).optional(),
  reviewInvalidated: z.boolean().optional(),
})
export type Item = z.infer<typeof item>

export const voiceExample = z.object({
  audience: z.string().max(160),
  outcome: z.string().max(240),
  text: z.string().max(4000),
})
export type VoiceExample = z.infer<typeof voiceExample>

export const roomVoice = z.object({
  instructions: z.string().max(4000).default(""),
  examples: z.array(voiceExample).max(20).default([]),
  prohibited: z.array(z.string().max(240)).max(40).default([]),
})
export type RoomVoice = z.infer<typeof roomVoice>

export const buildCheck = z.object({
  key: z.string(),
  label: z.string(),
  done: z.boolean(),
})
export type BuildCheck = z.infer<typeof buildCheck>

export const activityEntry = z.object({
  id: z.string(),
  at: z.string(),
  summary: z.string(),
  kind: z.enum(["create", "edit", "status", "remove", "policy", "voice", "check", "undo", "clear"]),
  // Snapshot used for guarded undo. `before === null` means the item did not exist.
  itemId: z.string().nullable().default(null),
  before: item.nullable().default(null),
  after: item.nullable().default(null),
  undone: z.boolean().default(false),
})
export type ActivityEntry = z.infer<typeof activityEntry>

export const workspaceDocument = z.object({
  schemaVersion: z.literal(1),
  items: z.array(item).default([]),
  voices: z.record(roomId, roomVoice),
  permissions: z.record(capabilityId, level),
  checks: z.array(buildCheck).default([]),
  activity: z.array(activityEntry).default([]),
})
export type WorkspaceDocument = z.infer<typeof workspaceDocument>

// ── Commands ────────────────────────────────────────────────────────────
export const createCommand = z.object({
  type: z.literal("create"),
  room: roomId,
  kind: itemKind,
  title: z.string().min(1).max(240),
  body: z.string().max(6000).optional(),
  recipient: z.string().max(240).optional(),
  due: dateOnly.optional(),
  source: z.string().max(240).optional(),
  subject: z.string().max(240).optional(),
  person: z.string().max(240).optional(),
  contact: z.string().max(240).optional(),
  stage: z.string().max(60).optional(),
  nextAction: z.string().max(240).optional(),
  reviewDate: dateOnly.optional(),
  contradicts: z.string().optional(),
})

export const editCommand = z.object({
  type: z.literal("edit"),
  id: z.string(),
  patch: z
    .object({
      title: z.string().min(1).max(240),
      body: z.string().max(6000),
      recipient: z.string().max(240),
      due: dateOnly,
      source: z.string().max(240),
      subject: z.string().max(240),
      person: z.string().max(240),
      contact: z.string().max(240),
      stage: z.string().max(60),
      nextAction: z.string().max(240),
      kind: itemKind,
      reviewDate: dateOnly,
    })
    .partial(),
})

export const statusCommand = z.object({
  type: z.literal("status"),
  id: z.string(),
  status: itemStatus,
})

export const removeCommand = z.object({ type: z.literal("remove"), id: z.string() })
export const undoCommand = z.object({ type: z.literal("undo"), entryId: z.string().optional() })
export const clearExamplesCommand = z.object({ type: z.literal("clearExamples") })

export const roomVoiceCommand = z.object({
  type: z.literal("roomVoice"),
  room: roomId,
  voice: roomVoice.partial(),
})

export const capabilityPolicyCommand = z.object({
  type: z.literal("capabilityPolicy"),
  capability: capabilityId,
  level,
})

export const buildCheckCommand = z.object({
  type: z.literal("buildCheck"),
  key: z.string(),
  done: z.boolean(),
})

export const command = z.discriminatedUnion("type", [
  createCommand,
  editCommand,
  statusCommand,
  removeCommand,
  undoCommand,
  clearExamplesCommand,
  roomVoiceCommand,
  capabilityPolicyCommand,
  buildCheckCommand,
])
export type Command = z.infer<typeof command>

export const postBody = z.object({
  revision: z.number().int().nonnegative(),
  command,
})
