"use client"

import { useActionState } from "react"
import { unlockPreview, type PreviewUnlockState } from "@/app/preview/doll-invasion/actions"
import { SmokeMotif } from "./smoke-motif"

const initial: PreviewUnlockState = { error: null }

export function PreviewUnlock() {
  const [state, formAction, pending] = useActionState(unlockPreview, initial)

  return (
    <main className="di-world flex flex-col items-center justify-center gap-8 px-6 py-16">
      <SmokeMotif size={120} />

      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-[10px] uppercase tracking-[0.34em] text-muted-foreground">Private Preview</p>
        <h1 className="font-serif text-3xl leading-tight text-balance">Doll Invasion 2026</h1>
        <p className="max-w-xs text-sm leading-relaxed text-muted-foreground text-pretty">
          Some things are only here for a moment. Enter the phrase you were given.
        </p>
      </div>

      <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="preview-password" className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Passphrase
          </label>
          <input
            id="preview-password"
            name="password"
            type="password"
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
            aria-describedby={state.error ? "preview-password-error" : undefined}
            className="min-h-[44px] w-full rounded-lg border border-border bg-card px-4 text-base text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {state.error ? (
          <p id="preview-password-error" role="alert" className="text-sm text-destructive">
            {state.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="min-h-[44px] rounded-lg bg-primary px-5 text-sm uppercase tracking-[0.18em] text-primary-foreground transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
        >
          {pending ? "Clearing…" : "Enter"}
        </button>
      </form>
    </main>
  )
}
