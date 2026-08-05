"use server"

import { db } from "@/lib/db"
import { consultations } from "@/lib/db/schema"

export type ConsultationState = { ok: boolean; error?: string }

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

function clean(value: FormDataEntryValue | null, max: number): string {
  return String(value ?? "").trim().slice(0, max)
}

export async function submitConsultation(_prev: ConsultationState | null, formData: FormData): Promise<ConsultationState> {
  const name = clean(formData.get("name"), 120)
  const email = clean(formData.get("email"), 200)
  const placement = clean(formData.get("placement"), 120)
  const size = clean(formData.get("size"), 120)
  const idea = clean(formData.get("idea"), 2000)
  const budget = clean(formData.get("budget"), 120)
  const availability = clean(formData.get("availability"), 200)
  // Honeypot: real people leave this hidden field empty.
  const trap = clean(formData.get("company"), 100)

  if (trap) return { ok: true }
  if (!name) return { ok: false, error: "Please share your name." }
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Please enter a valid email so Mit can reply." }
  if (idea.length < 8) return { ok: false, error: "Tell Mit a little about the idea." }

  try {
    await db.insert(consultations).values({ name, email, placement, size, idea, budget, availability })
    return { ok: true }
  } catch {
    return { ok: false, error: "Something went still on our end. Please try again in a moment." }
  }
}
