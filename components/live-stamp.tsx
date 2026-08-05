"use client"

import { useEffect, useState } from "react"

/** A ticking clock that makes the document feel like it is being edited right now. */
export function LiveStamp({ prefix = "editing" }: { prefix?: string }) {
  const [now, setNow] = useState<string | null>(null)

  useEffect(() => {
    const tick = () =>
      setNow(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      )
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
      <span className="size-1.5 animate-pulse rounded-full bg-accent" aria-hidden="true" />
      {prefix} · {now ?? "--:--:--"}
    </span>
  )
}
