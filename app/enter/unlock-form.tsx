"use client"

import { useActionState } from "react"
import { unlockSite, type UnlockState } from "./actions"

const initialState: UnlockState = { error: null }

export function UnlockForm({ from }: { from: string }) {
  const [state, formAction, pending] = useActionState(unlockSite, initialState)

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-5">
      <input type="hidden" name="from" value={from} />
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-[10px] uppercase tracking-[0.26em] text-muted-foreground">
          Passphrase
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoFocus
          autoComplete="current-password"
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? "unlock-error" : undefined}
          className="w-full border-b border-border bg-transparent pb-3 text-lg text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-foreground"
          placeholder="Enter to see inside"
        />
      </div>

      {state.error && (
        <p id="unlock-error" role="alert" className="text-sm text-[color:var(--destructive,#e5484d)]">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 flex w-full items-center justify-center bg-primary px-5 py-4 text-[11px] uppercase tracking-[0.22em] text-primary-foreground transition-opacity hover:opacity-85 disabled:opacity-50"
      >
        {pending ? "Opening" : "Enter"}
      </button>
    </form>
  )
}
