"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Theme is only known on the client; wait to avoid a hydration mismatch.
  useEffect(() => setMounted(true), [])

  const isDark = resolvedTheme === "dark"
  const toggle = () => setTheme(isDark ? "light" : "dark")

  return (
    <button
      type="button"
      role="switch"
      aria-checked={mounted ? isDark : false}
      aria-label={mounted ? `Switch to ${isDark ? "light" : "dark"} theme` : "Switch theme"}
      onClick={toggle}
      className={`group relative inline-flex h-7 w-[52px] shrink-0 items-center rounded-full border border-border bg-secondary p-0.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${className}`}
    >
      {/* icons sit under the sliding knob */}
      <Sun className="pointer-events-none absolute left-[7px] size-3 text-muted-foreground" aria-hidden="true" />
      <Moon className="pointer-events-none absolute right-[7px] size-3 text-muted-foreground" aria-hidden="true" />
      <span
        className={`pointer-events-none relative z-10 flex size-6 items-center justify-center rounded-full bg-foreground text-background shadow-sm transition-transform duration-300 ease-out ${
          mounted && isDark ? "translate-x-[24px]" : "translate-x-0"
        }`}
      >
        {mounted && isDark ? (
          <Moon className="size-3" aria-hidden="true" />
        ) : (
          <Sun className="size-3" aria-hidden="true" />
        )}
      </span>
    </button>
  )
}
