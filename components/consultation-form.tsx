"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { submitConsultation, type ConsultationState } from "@/app/consultation-actions"

const FIELD =
  "min-h-11 w-full border border-input bg-background px-4 py-2 text-base text-foreground outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring"
const LABEL = "flex flex-col gap-2 text-left"
const LABEL_TEXT = "text-[10px] uppercase tracking-[0.2em] text-muted-foreground"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-11 bg-primary px-6 text-[11px] uppercase tracking-[0.22em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {pending ? "Sending…" : "Request a session"}
    </button>
  )
}

export function ConsultationForm() {
  const [state, formAction] = useActionState(submitConsultation, null as ConsultationState | null)

  if (state?.ok) {
    return (
      <div className="border border-border bg-card p-7 text-center md:p-10">
        <p className="font-serif text-3xl tracking-tight">Your request is with Mit.</p>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
          Thank you for trusting this. Mit reviews each request personally and will reply to the email you left. For
          anything urgent, write directly to{" "}
          <a href="mailto:createwithmit@gmail.com" className="underline underline-offset-4">
            createwithmit@gmail.com
          </a>
          .
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {/* Honeypot: hidden from people, tempting to bots. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <label className={LABEL}>
          <span className={LABEL_TEXT}>Your name</span>
          <input name="name" required autoComplete="name" className={FIELD} />
        </label>
        <label className={LABEL}>
          <span className={LABEL_TEXT}>Email</span>
          <input name="email" type="email" required autoComplete="email" className={FIELD} />
        </label>
        <label className={LABEL}>
          <span className={LABEL_TEXT}>Placement</span>
          <input name="placement" placeholder="e.g. inner forearm" className={FIELD} />
        </label>
        <label className={LABEL}>
          <span className={LABEL_TEXT}>Approximate size</span>
          <input name="size" placeholder="e.g. palm-sized" className={FIELD} />
        </label>
      </div>

      <label className={LABEL}>
        <span className={LABEL_TEXT}>Your idea</span>
        <textarea
          name="idea"
          required
          rows={5}
          placeholder="The image, feeling, or memory you'd like to carry. White-ink flash, fine line, or something new."
          className={`${FIELD} resize-y leading-relaxed`}
        />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className={LABEL}>
          <span className={LABEL_TEXT}>Budget (optional)</span>
          <input name="budget" placeholder="e.g. flexible" className={FIELD} />
        </label>
        <label className={LABEL}>
          <span className={LABEL_TEXT}>Your availability</span>
          <input name="availability" placeholder="e.g. weekends, evenings" className={FIELD} />
        </label>
      </div>

      {state?.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <SubmitButton />
        <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Or write to createwithmit@gmail.com
        </span>
      </div>
    </form>
  )
}
