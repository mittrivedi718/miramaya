// Storage + notification for Doll Invasion 2026 preview leads.
//
// Submissions are ALWAYS written to Postgres first — that is the source of truth.
// Email is a best-effort notification on top: if RESEND_API_KEY is missing or the
// send fails, the visitor still gets a success state and the row is still saved.

import { desc, eq, sql } from "drizzle-orm"
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

export type DollInvasionSignup = {
  id: string
  firstName: string
  lastName: string | null
  email: string
  instagram: string | null
  message: string | null
  emailedAt: Date | null
  createdAt: Date
}

/** Every Doll Invasion signup, newest first. Admin-only. */
export async function listSignups(): Promise<DollInvasionSignup[]> {
  await ensureContactsTable()
  return db
    .select({
      id: dollInvasionContacts.id,
      firstName: dollInvasionContacts.firstName,
      lastName: dollInvasionContacts.lastName,
      email: dollInvasionContacts.email,
      instagram: dollInvasionContacts.instagram,
      message: dollInvasionContacts.message,
      emailedAt: dollInvasionContacts.emailedAt,
      createdAt: dollInvasionContacts.createdAt,
    })
    .from(dollInvasionContacts)
    .orderBy(desc(dollInvasionContacts.createdAt))
}

/** Best-effort email notification. Never throws. */
export async function notifyOwner(id: string, contact: DollInvasionContact): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey) {
    console.log("[v0] RESEND_API_KEY not set — saved submission but skipped email")
    return
  }

  const when = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/New_York",
  })

  const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(" ")

  const text = [
    `${fullName} just signed up from the Doll Invasion 2026 preview.`,
    "",
    `Name:      ${fullName}`,
    `Email:     ${contact.email}`,
    `Instagram: ${contact.instagram || "not given"}`,
    `Time:      ${when} ET`,
    "",
    "Message:",
    contact.message || "(none)",
    "",
    "Reply to this email to answer them directly.",
  ].join("\n")

  // A matching HTML part is a meaningful deliverability signal: text-only mail
  // from a shared sending domain is scored more harshly by Gmail.
  const esc = (value: string) =>
    value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:6px 16px 6px 0;color:#6f6d65;font-size:13px;white-space:nowrap;vertical-align:top;">${label}</td>
      <td style="padding:6px 0;color:#1b1c1a;font-size:15px;">${value}</td>
    </tr>`

  const html = `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f4f2ec;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#fbfaf6;border:1px solid #d7d2c6;border-radius:14px;padding:28px;">
    <p style="margin:0 0 4px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#7f9aa6;">${esc(SOURCE_LABEL)}</p>
    <h1 style="margin:0 0 20px;font-size:21px;font-weight:600;color:#1b1c1a;">${esc(fullName)} wants the drop link</h1>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
      ${row("Email", `<a href="mailto:${esc(contact.email)}" style="color:#1b1c1a;">${esc(contact.email)}</a>`)}
      ${row("Instagram", contact.instagram ? esc(contact.instagram) : "not given")}
      ${row("Time", `${esc(when)} ET`)}
    </table>
    ${
      contact.message
        ? `<div style="margin-top:20px;padding:14px 16px;background:#f4f2ec;border-radius:10px;">
             <p style="margin:0 0 6px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#6f6d65;">Message</p>
             <p style="margin:0;font-size:15px;line-height:1.55;color:#1b1c1a;white-space:pre-wrap;">${esc(contact.message)}</p>
           </div>`
        : ""
    }
    <p style="margin:22px 0 0;font-size:13px;color:#6f6d65;">Reply to this email to answer ${esc(contact.firstName)} directly.</p>
  </div>
</body></html>`

  // Send from the real brand domain, which is what actually keeps these out of
  // spam. Resend rejects an unverified domain, so we fall back to the shared
  // sandbox sender: mail still arrives (in spam) while DNS is pending, and it
  // silently upgrades to the branded sender the moment meetmit.me verifies.
  const brandedFrom = process.env.DOLL_FROM_EMAIL?.trim() || "Doll Invasion <hello@meetmit.me>"
  const fallbackFrom = "Doll Invasion <onboarding@resend.dev>"

  try {
    const { Resend } = await import("resend")
    const resend = new Resend(apiKey)

    const send = (from: string) =>
      resend.emails.send({
        from,
        to: notifyAddress(),
        replyTo: contact.email,
        subject: `Doll Invasion signup: ${fullName}`,
        text,
        html,
        // Keeps Gmail from collapsing separate signups into one thread.
        headers: { "X-Entity-Ref-ID": id },
      })

    let { error } = await send(brandedFrom)

    if (error && brandedFrom !== fallbackFrom) {
      console.log(`[v0] Branded sender refused (${error.message}) — retrying via sandbox sender`)
      ;({ error } = await send(fallbackFrom))
    }

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
