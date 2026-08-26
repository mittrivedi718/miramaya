// Storage + notification for Doll Invasion 2026 preview leads.
//
// Submissions are ALWAYS written to Postgres first — that is the source of truth.
// Email is a best-effort notification on top: if RESEND_API_KEY is missing or the
// send fails, the visitor still gets a success state and the row is still saved.

import { eq, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import { dollInvasionContacts } from "@/lib/db/schema"

export const SOURCE_LABEL = "Doll Invasion 2026"

/** Where notifications go. Override with DOLL_NOTIFY_EMAIL, no code change needed. */
function notifyAddress(): string {
  return process.env.DOLL_NOTIFY_EMAIL?.trim() || "meetmiramaya@gmail.com"
}

/**
 * The project has no migration runner, so the table is created on first use.
 * Cheap: Postgres no-ops when it already exists, and we only try once per process.
 */
let ensured: Promise<void> | null = null
function ensureTable(): Promise<void> {
  ensured ??= db
    .execute(sql`
      CREATE TABLE IF NOT EXISTS doll_invasion_contacts (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        first_name text NOT NULL,
        last_name text,
        email text NOT NULL,
        instagram text,
        message text,
        source text NOT NULL DEFAULT 'Doll Invasion 2026',
        emailed_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `)
    .then(() => undefined)
  return ensured
}

export type DollInvasionContact = {
  firstName: string
  lastName: string
  email: string
  instagram: string
  message: string
}

/** Save one submission. Throws only if the database write fails. */
export async function saveContact(contact: DollInvasionContact): Promise<string> {
  await ensureTable()
  const [row] = await db
    .insert(dollInvasionContacts)
    .values({
      firstName: contact.firstName,
      lastName: contact.lastName || null,
      email: contact.email,
      instagram: contact.instagram || null,
      message: contact.message || null,
      source: SOURCE_LABEL,
    })
    .returning({ id: dollInvasionContacts.id })
  return row.id
}

/** Best-effort email notification. Never throws. */
export async function notifyOwner(id: string, contact: DollInvasionContact): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey) {
    console.log("[v0] RESEND_API_KEY not set — saved submission but skipped email")
    return
  }

  const timestamp = new Date().toISOString()
  const lines = [
    `Time:       ${timestamp}`,
    `Source:     ${SOURCE_LABEL}`,
    "",
    `First name: ${contact.firstName}`,
    `Last name:  ${contact.lastName || "—"}`,
    `Email:      ${contact.email}`,
    `Instagram:  ${contact.instagram || "—"}`,
    "",
    "Message:",
    contact.message || "—",
  ]

  try {
    const { Resend } = await import("resend")
    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from: process.env.DOLL_FROM_EMAIL?.trim() || "Doll Invasion <onboarding@resend.dev>",
      to: notifyAddress(),
      replyTo: contact.email,
      subject: `New Doll Invasion Contact — ${contact.firstName}`,
      text: lines.join("\n"),
    })
    if (error) {
      console.log("[v0] Resend rejected the notification:", error.message)
      return
    }
    await db
      .update(dollInvasionContacts)
      .set({ emailedAt: new Date() })
      .where(eq(dollInvasionContacts.id, id))
  } catch (error) {
    console.log("[v0] Email notification failed:", error instanceof Error ? error.message : error)
  }
}
