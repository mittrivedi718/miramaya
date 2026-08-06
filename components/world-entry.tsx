"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { enterWorld } from "@/app/portal-actions"
import { worldEntry } from "@/lib/world-entry-config"
import { worldStyle, type World } from "@/lib/worlds"
import { WorldBackground } from "./world-background"

/** The gate: renders the world's distinct act of attention, then grants and reveals. */
export function WorldGate({ world }: { world: World }) {
  const cfg = worldEntry(world.handle)
  const router = useRouter()
  const [entering, setEntering] = useState(false)

  const onSolved = useCallback(() => {
    setEntering((already) => {
      if (already) return already
      void enterWorld(world.handle).then(() => {
        window.setTimeout(() => router.refresh(), 750)
      })
      return true
    })
  }, [router, world.handle])

  return (
    <main
      style={worldStyle(world)}
      className="relative flex min-h-svh flex-col overflow-hidden bg-background text-foreground"
    >
      <WorldBackground ambience={cfg.ambience} />

      <header className="relative z-10 flex items-center justify-between px-5 py-4 text-[10px] uppercase tracking-[0.22em] text-muted-foreground md:px-8">
        <a href="/" className="transition-colors hover:text-foreground">
          ← the mirrors
        </a>
        <span>{world.tagline}</span>
      </header>

      <section
        className={`relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-16 text-center transition-all duration-700 ${
          entering ? "scale-105 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        <p className="mv-rise mb-2 font-serif text-5xl lowercase tracking-tight md:text-7xl">{world.name}</p>
        <p className="mv-rise mv-rise-2 mb-12 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
          {cfg.clue}
        </p>

        <div className="mv-rise mv-rise-3">
          {cfg.mechanic === "reflection" && <ReflectionGate onSolved={onSolved} />}
          {cfg.mechanic === "refraction" && <RefractionGate onSolved={onSolved} name={world.name} />}
          {cfg.mechanic === "earth" && <EarthGate onSolved={onSolved} />}
          {cfg.mechanic === "constellation" && <ConstellationGate onSolved={onSolved} />}
        </div>

        <p className="mv-rise mv-rise-3 mt-10 text-[10px] uppercase tracking-[0.24em] text-muted-foreground/70">
          the keeper&apos;s guidebook knows the way
        </p>
      </section>

      {entering && (
        <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center bg-background/30">
          <p className="animate-pulse text-[10px] uppercase tracking-[0.35em]">crossing into {world.name}</p>
        </div>
      )}
    </main>
  )
}

/* ---- mira: attention as stillness. Hold until the reflection resolves. ------ */
function ReflectionGate({ onSolved }: { onSolved: () => void }) {
  const DURATION = 2200
  const [progress, setProgress] = useState(0)
  const holding = useRef(false)
  const startAt = useRef(0)
  const raf = useRef<number | null>(null)

  const stop = useCallback(() => {
    holding.current = false
    startAt.current = 0
    if (raf.current) cancelAnimationFrame(raf.current)
    setProgress(0)
  }, [])

  const begin = useCallback(() => {
    if (holding.current) return
    holding.current = true
    startAt.current = 0
    const tick = (t: number) => {
      if (!holding.current) return
      if (!startAt.current) startAt.current = t
      const p = Math.min(1, (t - startAt.current) / DURATION)
      setProgress(p)
      if (p >= 1) {
        holding.current = false
        onSolved()
        return
      }
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
  }, [onSolved])

  useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current) }, [])

  const R = 104
  const circ = 2 * Math.PI * R

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Rest your finger and hold until the reflection settles"
      onPointerDown={begin}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onKeyDown={(e) => { if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); begin() } }}
      onKeyUp={(e) => { if (e.key === " " || e.key === "Enter") stop() }}
      className="relative grid size-60 cursor-pointer touch-none select-none place-items-center rounded-full border border-foreground/20 bg-[radial-gradient(circle_at_50%_35%,color-mix(in_oklab,var(--primary)_22%,transparent),transparent_70%)] outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* concentric ripples, calm while held */}
      <span className={`pointer-events-none absolute inset-6 rounded-full border border-foreground/15 ${progress > 0 ? "" : "animate-ping"}`} style={{ animationDuration: "3.6s" }} />
      <span className="pointer-events-none absolute inset-12 rounded-full border border-foreground/10" />

      {/* the reflection: the mark sharpens as you hold */}
      <span
        className="brand-mark brand-mark--current pointer-events-none h-24 text-foreground transition-none"
        style={{ filter: `blur(${(1 - progress) * 9}px)`, opacity: 0.28 + progress * 0.72 }}
      />

      <svg className="pointer-events-none absolute inset-0 -rotate-90" viewBox="0 0 240 240" aria-hidden="true">
        <circle cx="120" cy="120" r={R} fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="2" />
        <circle
          cx="120" cy="120" r={R} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - progress)}
        />
      </svg>

      <span className="pointer-events-none absolute bottom-7 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        {progress > 0 ? "be still" : "hold"}
      </span>
    </div>
  )
}

/* ---- maya: attention as perspective. Drag until the split light aligns. ----- */
function RefractionGate({ onSolved, name }: { onSolved: () => void; name: string }) {
  const [value, setValue] = useState(14) // 50 is aligned
  const timer = useRef<number | null>(null)
  const split = (value - 50) / 5 // px offset per channel
  const aligned = Math.abs(value - 50) < 4

  useEffect(() => {
    if (aligned) {
      timer.current = window.setTimeout(onSolved, 600)
    }
    return () => { if (timer.current) clearTimeout(timer.current) }
  }, [aligned, onSolved])

  return (
    <div className="flex w-[min(80vw,22rem)] flex-col items-center gap-8">
      <div className="relative grid h-28 w-full place-items-center overflow-hidden rounded-lg border border-foreground/15">
        <span className="relative font-serif text-6xl lowercase tracking-tight md:text-7xl" style={{ opacity: aligned ? 1 : 0.9 }}>
          <span className="absolute inset-0" style={{ color: "#ff5a7a", transform: `translateX(${-split}px)`, mixBlendMode: "screen" }}>{name}</span>
          <span className="absolute inset-0" style={{ color: "#57e0c8", transform: `translateX(${split}px)`, mixBlendMode: "screen" }}>{name}</span>
          <span className="relative" style={{ color: "var(--foreground)", opacity: aligned ? 1 : 0.85 }}>{name}</span>
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={value}
        aria-label="Turn the light until the colours align"
        onChange={(e) => setValue(Number(e.target.value))}
        className="h-1 w-full cursor-pointer touch-none appearance-none rounded-full bg-foreground/20 accent-[var(--primary)] outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--primary)]"
      />
      <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        {aligned ? "the light agrees" : "find the angle"}
      </span>
    </div>
  )
}

/* ---- gaia: attention as making. Gather three stones into a cairn. ----------- */
function EarthGate({ onSolved }: { onSolved: () => void }) {
  const [stacked, setStacked] = useState<number[]>([])
  const stones = [0, 1, 2]
  // resting positions for un-stacked stones (scattered along the ground)
  const scatter = [{ left: "8%" }, { left: "46%" }, { left: "80%" }]

  const take = (id: number) => {
    if (stacked.includes(id)) return
    const next = [...stacked, id]
    setStacked(next)
    if (next.length === stones.length) window.setTimeout(onSolved, 650)
  }

  return (
    <div className="relative h-64 w-[min(84vw,22rem)]">
      {/* the cairn base line */}
      <span className="absolute inset-x-6 bottom-8 h-px bg-foreground/25" />

      {/* stacked cairn */}
      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col-reverse items-center">
        {stacked.map((id, i) => (
          <span
            key={id}
            className="mt-[-6px] rounded-[45%] border border-foreground/20 bg-[color-mix(in_oklab,var(--primary)_38%,var(--background))] shadow-sm"
            style={{ width: `${74 - i * 14}px`, height: `${40 - i * 6}px`, animation: "mv-rise 0.5s cubic-bezier(0.22,1,0.36,1) both" }}
          />
        ))}
      </div>

      {/* scattered stones still to gather */}
      {stones.filter((s) => !stacked.includes(s)).map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => take(id)}
          aria-label="Place this stone on the cairn"
          className="absolute bottom-8 grid place-items-center rounded-[45%] border border-foreground/25 bg-[color-mix(in_oklab,var(--accent)_60%,var(--background))] transition-transform hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          style={{ width: `${70 - id * 12}px`, height: `${38 - id * 4}px`, left: scatter[id].left }}
        />
      ))}

      <span className="absolute inset-x-0 top-0 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        {stacked.length === 3 ? "it stands" : `stone ${stacked.length} of 3`}
      </span>
    </div>
  )
}

/* ---- mia: attention as connection. Trace all three lights in one stroke. ---- */
function ConstellationGate({ onSolved }: { onSolved: () => void }) {
  const points = [
    { x: 40, y: 150 },
    { x: 150, y: 50 },
    { x: 260, y: 140 },
  ]
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [visited, setVisited] = useState<number[]>([])
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null)
  const tracing = useRef(false)
  const done = useRef(false)

  const toLocal = (e: React.PointerEvent) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const r = svg.getBoundingClientRect()
    return { x: ((e.clientX - r.left) / r.width) * 300, y: ((e.clientY - r.top) / r.height) * 200 }
  }
  const near = (p: { x: number; y: number }, i: number) => Math.hypot(p.x - points[i].x, p.y - points[i].y) < 34

  const reset = () => { tracing.current = false; setVisited([]); setPointer(null) }

  const down = (e: React.PointerEvent) => {
    if (done.current) return
    const p = toLocal(e)
    const hit = points.findIndex((_, i) => near(p, i))
    if (hit === -1) return
    tracing.current = true
    setVisited([hit])
    setPointer(p)
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
  }
  const move = (e: React.PointerEvent) => {
    if (!tracing.current || done.current) return
    const p = toLocal(e)
    setPointer(p)
    const hit = points.findIndex((_, i) => near(p, i))
    if (hit !== -1 && !visited.includes(hit)) {
      const next = [...visited, hit]
      setVisited(next)
      if (next.length === points.length) {
        done.current = true
        tracing.current = false
        window.setTimeout(onSolved, 500)
      }
    }
  }
  const up = () => { if (!done.current) reset() }

  const line = visited.map((i) => `${points[i].x},${points[i].y}`).join(" ")
  const liveTo = tracing.current && pointer && visited.length ? ` ${pointer.x},${pointer.y}` : ""

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 300 200"
      className="h-52 w-[min(86vw,22rem)] touch-none select-none rounded-lg border border-foreground/15"
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerLeave={up}
      onPointerCancel={up}
      role="img"
      aria-label="Trace a single line connecting the three lights"
    >
      {visited.length > 0 && (
        <polyline points={line + liveTo} fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
      )}
      {points.map((pt, i) => {
        const on = visited.includes(i)
        return (
          <g key={i}>
            {on && <circle cx={pt.x} cy={pt.y} r="12" fill="var(--primary)" opacity="0.18" />}
            <circle cx={pt.x} cy={pt.y} r={on ? 5 : 4} fill={on ? "var(--primary)" : "currentColor"} className={on ? "" : "opacity-70"} />
          </g>
        )
      })}
    </svg>
  )
}
