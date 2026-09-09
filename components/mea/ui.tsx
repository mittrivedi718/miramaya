"use client"

import type { ButtonHTMLAttributes, ReactNode } from "react"
import { cn } from "@/lib/utils"

// The three honesty chips, used everywhere and never mixed up.
export type Tone = "working" | "example" | "notconnected"

export function Chip({ tone, children }: { tone: Tone; children?: ReactNode }) {
  const label = children ?? (tone === "working" ? "Working" : tone === "example" ? "Example" : "Not connected")
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-none",
        tone === "working" && "border-[var(--mea-teal)] text-[var(--mea-cyan)]",
        tone === "example" && "border-[var(--mea-veil)] text-[var(--mea-dim)]",
        tone === "notconnected" && "border-dashed border-[var(--mea-veil)] text-[var(--mea-dim)]",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "size-1.5 rounded-full",
          tone === "working" && "bg-[var(--mea-cyan)]",
          tone === "example" && "bg-[var(--mea-dim)]",
          tone === "notconnected" && "bg-transparent ring-1 ring-[var(--mea-dim)]",
        )}
      />
      {label}
    </span>
  )
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "quiet" | "danger"
}

export function MeaButton({ variant = "ghost", className, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        "mea-tap inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-[var(--mea-mira)] text-[var(--mea-ground)] hover:opacity-90",
        variant === "ghost" && "border border-[var(--mea-veil)] text-[var(--mea-silver)] hover:border-[var(--mea-teal)]",
        variant === "quiet" && "text-[var(--mea-dim)] hover:text-[var(--mea-silver)]",
        variant === "danger" && "border border-[var(--mea-veil)] text-[var(--mea-silver)] hover:border-[color:#c66]",
        className,
      )}
    />
  )
}

export function Surface({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mea-surface p-4", className)}>{children}</div>
}

export function SectionTitle({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="mb-3">
      <h2 className="mea-display text-pretty text-xl text-[var(--mea-silver)]">{children}</h2>
      {sub ? <p className="mt-1 text-sm text-[var(--mea-dim)]">{sub}</p> : null}
    </div>
  )
}

// Every empty state names one specific next action.
export function EmptyState({ line, action }: { line: string; action?: ReactNode }) {
  return (
    <div className="mea-surface flex flex-col items-start gap-3 p-5">
      <p className="text-pretty text-sm text-[var(--mea-dim)]">{line}</p>
      {action}
    </div>
  )
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string
  children: ReactNode
  hint?: string
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-[var(--mea-dim)]">{label}</span>
      {children}
      {hint ? <span className="text-xs text-[var(--mea-dim)]">{hint}</span> : null}
    </label>
  )
}

export const inputClass =
  "min-h-11 w-full rounded-xl border border-[var(--mea-veil)] bg-[var(--mea-ground)] px-3 text-base text-[var(--mea-silver)] outline-none placeholder:text-[var(--mea-dim)] focus:border-[var(--mea-teal)]"
