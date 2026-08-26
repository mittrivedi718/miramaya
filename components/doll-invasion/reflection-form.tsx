"use client"

import { useActionState, useEffect, useState } from "react"
import { submitReflection, type ReflectionState } from "@/app/preview/doll-invasion/actions"
import { SmokeMotif } from "./smoke-motif"

const FIELD =
  "min-h-[44px] w-full rounded-lg border border-border bg-card px-4 py-2 text-base text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
const LABEL = "text-[11px] uppercase tracking-[0.22em] text-muted-foreground"

export function ReflectionForm() {
  const [state, formAction, pending] = useActionState<ReflectionState | null, FormData>(submitReflection, null)
  // Two-stage success: the glass fogs over, then clears to the closing lines.
  const [cleared, setCleared] = useState(false)

  useEffect(() => {
    if (!state?.ok) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce) {
      setCleared(true)
      return
    }
    const t = setTimeout(() => setCleared(true), 1000)
    return () => clearTimeout(t)
  }, [state?.ok])

  if (state?.ok) {
    return (
      <section aria-live="polite" className="flex min-h-[320px] flex-col items-center justify-center gap-6 text-center">
        {cleared ? (
          <div className="di-clearing flex flex-col items-center gap-5">
            <SmokeMotif size={112} />
            <p className="font-serif text-2xl leading-snug text-balance">Received. I&apos;ll send your link soon.</p>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground text-pretty">
              Until then, some things are still just smoke.
            </p>
          </div>
        ) : (
          <div className="di-fogging flex flex-col items-center gap-4">
            <SmokeMotif size={112} />
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Fogging over…</p>
          </div>
        )}
      </section>
    )
  }

  return (
    <section className="di-reveal flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="font-serif text-2xl leading-tight text-balance">Leave a Reflection</h2>
        <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
          So I know where to send your album.
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-5">
        {/* Honeypot — hidden from people, tempting to bots. */}
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="pointer-events-none absolute h-0 w-0 opacity-0"
        />

        <div className="flex flex-col gap-2">
          <label htmlFor="di-first" className={LABEL}>
            First name <span aria-hidden="true">*</span>
          </label>
          <input id="di-first" name="firstName" required autoComplete="given-name" className={FIELD} />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="di-email" className={LABEL}>
            Email <span aria-hidden="true">*</span>
          </label>
          <input id="di-email" name="email" type="email" required autoComplete="email" className={FIELD} />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="di-last" className={LABEL}>
            Last name <span className="normal-case tracking-normal">(optional)</span>
          </label>
          <input id="di-last" name="lastName" autoComplete="family-name" className={FIELD} />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="di-ig" className={LABEL}>
            Instagram <span className="normal-case tracking-normal">(optional)</span>
          </label>
          <input
            id="di-ig"
            name="instagram"
            inputMode="text"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="@yourhandle"
            className={FIELD}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="di-message" className={LABEL}>
            Message <span className="normal-case tracking-normal">(optional)</span>
          </label>
          <textarea id="di-message" name="message" rows={4} className={`${FIELD} resize-y`} />
        </div>

        {state?.error ? (
          <p role="alert" className="text-sm text-destructive">
            {state.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="min-h-[44px] rounded-lg bg-primary px-5 text-sm uppercase tracking-[0.18em] text-primary-foreground transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send me my link"}
        </button>
      </form>
    </section>
  )
}
