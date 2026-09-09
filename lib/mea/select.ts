// Pure, deterministic derivations over the workspace document. Shared by every
// surface so ordering and grouping are defined in exactly one place.

import type { RoomId } from "./rooms"
import type { Item, WorkspaceDocument } from "./schema"

export function todayISODate(): string {
  return new Date().toISOString().slice(0, 10)
}

/** A human, date-only label. Never implies a time or a zone. */
export function formatDate(due: string | null | undefined): string {
  if (!due) return "no date"
  const [y, m, d] = due.split("-").map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  return dt.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })
}

export function daysUntil(due: string | null | undefined): number | null {
  if (!due) return null
  const today = new Date(todayISODate() + "T00:00:00Z").getTime()
  const target = new Date(due + "T00:00:00Z").getTime()
  return Math.round((target - today) / 86_400_000)
}

export function roomItems(doc: WorkspaceDocument, room: RoomId, kind?: Item["kind"]): Item[] {
  return doc.items.filter((i) => i.room === room && (kind ? i.kind === kind : true))
}

export function allOfKind(doc: WorkspaceDocument, kind: Item["kind"]): Item[] {
  return doc.items.filter((i) => i.kind === kind)
}

/**
 * Threshold order, deterministic and honest — no invented urgency:
 *   1. dated open tasks, soonest first
 *   2. pending drafts
 *   3. undated open tasks
 */
export function thresholdQueue(doc: WorkspaceDocument): Item[] {
  const openTasks = doc.items.filter((i) => i.kind === "task" && i.status === "open")
  const datedTasks = openTasks
    .filter((i) => i.due)
    .sort((a, b) => (a.due! < b.due! ? -1 : a.due! > b.due! ? 1 : 0))
  const pendingDrafts = doc.items.filter((i) => i.kind === "draft" && i.status === "draft")
  const undatedTasks = openTasks.filter((i) => !i.due)
  return [...datedTasks, ...pendingDrafts, ...undatedTasks]
}

export function nextActionLabel(item: Item): string {
  switch (item.kind) {
    case "draft":
      return "Review in Hands"
    case "task":
      return "Mark done"
    case "door":
      return item.nextAction || "Open"
    default:
      return "Open"
  }
}

/** Confirmed memories in a room — each grows one ring on the room's tree. */
export function treeRings(doc: WorkspaceDocument, room: RoomId): number {
  return doc.items.filter((i) => i.room === room && i.kind === "memory" && i.confirmed === true).length
}

export type GardenModel = {
  mirrors: Item[]
  windows: Item[]
  openDoors: Item[]
  closedDoors: Item[]
  rings: number
  unrootedMemories: number
  isEmpty: boolean
}

export function gardenFor(doc: WorkspaceDocument, room: RoomId): GardenModel {
  const inRoom = roomItems(doc, room)
  const mirrors = inRoom.filter((i) => i.kind === "mirror")
  const windows = inRoom.filter((i) => i.kind === "window")
  const doors = inRoom.filter((i) => i.kind === "door")
  const openDoors = doors
    .filter((i) => i.status !== "closed")
    .sort((a, b) => (a.due || "9999") < (b.due || "9999") ? -1 : 1)
  const closedDoors = doors.filter((i) => i.status === "closed")
  const rings = treeRings(doc, room)
  const unrootedMemories = inRoom.filter((i) => i.kind === "memory" && !i.confirmed).length
  return {
    mirrors,
    windows,
    openDoors,
    closedDoors,
    rings,
    unrootedMemories,
    isEmpty: mirrors.length + windows.length + doors.length + rings + unrootedMemories === 0,
  }
}

export function realItems(doc: WorkspaceDocument): Item[] {
  return doc.items.filter((i) => !i.isExample)
}

export function exampleCount(doc: WorkspaceDocument): number {
  return doc.items.filter((i) => i.isExample).length
}
