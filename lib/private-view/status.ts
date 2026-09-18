// Status is derived from timestamps, never stored. The database clock is the real
// authority for access decisions; this derivation is used for admin display and
// for the read-only gateway routing.

export type PrivateLinkStatus = "REVOKED" | "UNOPENED" | "ACTIVE" | "EXPIRED"

export type StatusInput = {
  revokedAt: Date | null
  firstViewedAt: Date | null
  expiresAt: Date | null
}

export function deriveStatus(row: StatusInput): PrivateLinkStatus {
  if (row.revokedAt) return "REVOKED"
  if (!row.firstViewedAt) return "UNOPENED"
  if (row.expiresAt && row.expiresAt.getTime() > Date.now()) return "ACTIVE"
  return "EXPIRED"
}
