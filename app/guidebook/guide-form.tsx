"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { openGuidebook } from "./actions"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-11 w-full bg-primary px-5 text-[11px] uppercase tracking-[0.22em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {pending ? "Opening…" : "Open the guidebook"}
    </button>
  )
}

export function GuideForm() {
  const [state, formAction] = useActionState(openGuidebook, null as { error?: string } | null)
  return (
    <form action={formAction} className="mt-7 flex flex-col gap-4">
      <label className="flex flex-col gap-2 text-left">
        <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">The keeper&apos;s phrase</span>
        <input
          type="password"
          name="password"
          autoComplete="off"
          autoFocus
          required
          placeholder="Enter the phrase"
          className="min-h-11 border border-input bg-background px-4 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>
      {state?.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <SubmitButton />
    </form>
  )
}
