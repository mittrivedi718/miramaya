"use client"

import { useEffect, useRef, useState } from "react"

/**
 * A short manuscript that types itself out, line by line, as if MiraMaya is
 * being written in real time. Deliberately unfinished: it ends on an open line
 * and a blinking cursor, so the page never feels final.
 */
const LINES = [
  "MiraMaya is not a shop. It is a house of mirrors,",
  "and each mirror opens onto a world that Mit is still building.",
  "",
  "mira keeps vigil at the water. maya bends the render.",
  "gaia trades in small marvels. mirabelle mends, slowly.",
  "marked by Mit leaves something permanent, barely there.",
  "",
  "Meet Mit is the person behind all five —",
  "an artist writing this place into being, one line at a time.",
  "",
  "You are early. Most of it is still ink and intention.",
  "Come back and it will have grown while you were gone.",
]

export function LivingDocument() {
  const [typed, setTyped] = useState<string[]>([""])
  const [done, setDone] = useState(false)
  const reduced = useRef(false)

  useEffect(() => {
    reduced.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (reduced.current) {
      setTyped(LINES)
      setDone(true)
      return
    }

    let line = 0
    let char = 0
    let cancelled = false

    function step() {
      if (cancelled) return
      const current = LINES[line] ?? ""
      char += 1
      setTyped((prev) => {
        const next = [...prev]
        next[line] = current.slice(0, char)
        return next
      })
      if (char >= current.length) {
        line += 1
        char = 0
        if (line >= LINES.length) {
          setDone(true)
          return
        }
        setTyped((prev) => [...prev, ""])
        window.setTimeout(step, LINES[line] === "" ? 260 : 420)
        return
      }
      // Slightly irregular cadence, like a hand that pauses to think.
      window.setTimeout(step, 26 + Math.random() * 44)
    }

    const start = window.setTimeout(step, 500)
    return () => {
      cancelled = true
      window.clearTimeout(start)
    }
  }, [])

  return (
    <div className="font-mono text-sm leading-7 text-foreground md:text-base md:leading-8">
      {typed.map((line, index) => (
        <p key={index} className="min-h-[1.75rem] text-pretty">
          {line}
          {index === typed.length - 1 && (
            <span
              className={`ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[2px] bg-accent align-middle ${done ? "animate-pulse" : ""}`}
              aria-hidden="true"
            />
          )}
        </p>
      ))}
    </div>
  )
}
