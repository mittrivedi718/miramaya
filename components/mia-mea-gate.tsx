"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { worldStyle, type World } from "@/lib/worlds"
import { WorldBackground } from "./world-background"

/* ---------------------------------------------------------------------------
   The MIA / MEA chooser.

   One traveller stands at the base of two flights of steps. Walk them LEFT and
   they climb to MIA's emblem-eye and cross over to the MIA chat. Walk them RIGHT
   and they climb to MEA's i-in-the-iris eye and open the executive assistant.

   Both eyes are real, focusable buttons — the walk is enhancement, not the only
   way through — and reduced-motion visitors skip straight to the crossing.
--------------------------------------------------------------------------- */

const MIA_URL = "https://meetmia.vercel.app/"

// Isometric step paths in a 300 x 260 field. Index 0 is the shared base stone;
// the last node is the foot of that side's eye.
const MIA_PATH: ReadonlyArray<readonly [number, number]> = [
  [150, 232],
  [124, 208],
  [106, 178],
  [95, 142],
  [94, 104],
]
const MEA_PATH: ReadonlyArray<readonly [number, number]> = [
  [150, 232],
  [176, 208],
  [194, 178],
  [205, 142],
  [206, 104],
]

const MIA_GLOW = "#9aa6d8" // the emblem's cool silver-blue
const MEA_GLOW = "#b9a8e6" // MEA's lavender

type Choice = "mia" | "mea"

function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/** Position along a polyline at fraction t (0..1), by cumulative segment length. */
function pointAt(path: ReadonlyArray<readonly [number, number]>, t: number): [number, number] {
  if (t <= 0) return [path[0][0], path[0][1]]
  if (t >= 1) return [path[path.length - 1][0], path[path.length - 1][1]]
  const seg: number[] = []
  let total = 0
  for (let i = 1; i < path.length; i++) {
    const d = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1])
    seg.push(d)
    total += d
  }
  let dist = t * total
  for (let i = 1; i < path.length; i++) {
    if (dist <= seg[i - 1]) {
      const f = seg[i - 1] === 0 ? 0 : dist / seg[i - 1]
      return [path[i - 1][0] + (path[i][0] - path[i - 1][0]) * f, path[i - 1][1] + (path[i][1] - path[i - 1][1]) * f]
    }
    dist -= seg[i - 1]
  }
  const end = path[path.length - 1]
  return [end[0], end[1]]
}

const pct = (v: number, span: number) => `${(v / span) * 100}%`

export function MiaMeaGate({ world }: { world: World }) {
  const router = useRouter()
  const [choice, setChoice] = useState<Choice | null>(null)
  const [t, setT] = useState(0)
  const [opened, setOpened] = useState(false)
  const [last, setLast] = useState<Choice | null>(null)
  const committed = useRef(false)
  const raf = useRef<number | null>(null)

  // Warm the MEA route and recall which assistant was opened last time.
  useEffect(() => {
    router.prefetch("/mea")
    try {
      const stored = window.localStorage.getItem("mm:lastAssistant")
      if (stored === "mia" || stored === "mea") setLast(stored)
    } catch {
      /* private mode — no memory, no harm */
    }
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [router])

  const cross = useCallback(
    (dir: Choice) => {
      try {
        window.localStorage.setItem("mm:lastAssistant", dir)
      } catch {
        /* ignore */
      }
      if (dir === "mia") {
        try {
          ;(window.top ?? window).location.href = MIA_URL
        } catch {
          window.location.href = MIA_URL
        }
      } else {
        router.push("/mea")
      }
    },
    [router],
  )

  const choose = useCallback(
    (dir: Choice) => {
      if (committed.current) return
      committed.current = true
      setChoice(dir)

      const reduced =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

      if (reduced) {
        setT(1)
        setOpened(true)
        window.setTimeout(() => cross(dir), 260)
        return
      }

      const DURATION = 820
      const start = performance.now()
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / DURATION)
        setT(easeInOut(p))
        if (p < 1) {
          raf.current = requestAnimationFrame(tick)
        } else {
          setOpened(true)
          window.setTimeout(() => cross(dir), 220)
        }
      }
      raf.current = requestAnimationFrame(tick)
    },
    [cross],
  )

  const path = choice === "mea" ? MEA_PATH : MIA_PATH
  const fig = choice ? pointAt(path, t) : [MIA_PATH[0][0], MIA_PATH[0][1]]
  const litTrail = choice
    ? (() => {
        // Draw the walked portion of the chosen path up to the figure.
        const pts = [pointAt(path, 0)]
        for (let i = 1; i < path.length; i++) {
          // include nodes already passed
          const nodeT = i / (path.length - 1)
          if (nodeT <= t) pts.push([path[i][0], path[i][1]])
        }
        pts.push([fig[0], fig[1]])
        return pts.map((p) => `${p[0]},${p[1]}`).join(" ")
      })()
    : ""

  const dim = (side: Choice) => choice !== null && choice !== side

  return (
    <main
      style={worldStyle(world)}
      className="relative flex min-h-svh flex-col overflow-hidden bg-background text-foreground"
    >
      <style>{`
        @keyframes mm-bob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-2.5px) } }
        @keyframes mm-ring { 0% { opacity:.5; transform:scale(.9) } 70%,100% { opacity:0; transform:scale(1.5) } }
      `}</style>

      <WorldBackground ambience="astral" />

      <header className="relative z-10 flex items-center justify-between px-5 py-4 text-[10px] uppercase tracking-[0.22em] text-muted-foreground md:px-8">
        <a href="/" className="min-h-11 py-3 transition-colors hover:text-foreground">
          ← the mirrors
        </a>
        <span>{world.tagline}</span>
      </header>

      <section
        className={`relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-14 text-center transition-all duration-700 ${
          opened ? "scale-105 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        <p className="mv-rise mb-2 text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
          who are you talking to?
        </p>
        <h1 className="mv-rise mv-rise-2 mb-2 font-serif text-5xl tracking-tight md:text-7xl">MIA / MEA</h1>
        <p className="mv-rise mv-rise-2 mb-8 max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
          Two eyes at the top of two stairs. Walk left to <span className="text-foreground">MIA</span>, who remembers —
          or right to <span className="text-foreground">MEA</span>, who helps you act.
        </p>

        {/* The forking stairway. */}
        <div
          className="mv-rise mv-rise-3 relative w-[min(90vw,24rem)] touch-none select-none"
          style={{ aspectRatio: "300 / 260" }}
        >
          <svg viewBox="0 0 300 260" className="absolute inset-0 h-full w-full" aria-hidden="true">
            {/* faint dashed guides for both stairways */}
            {[MIA_PATH, MEA_PATH].map((p, idx) => (
              <polyline
                key={idx}
                points={p.map((q) => `${q[0]},${q[1]}`).join(" ")}
                fill="none"
                stroke="currentColor"
                strokeOpacity="0.14"
                strokeWidth="1"
                strokeDasharray="2 5"
                strokeLinecap="round"
              />
            ))}

            {/* the walked, glowing trail on the chosen side */}
            {choice && (
              <polyline
                points={litTrail}
                fill="none"
                stroke={choice === "mea" ? MEA_GLOW : MIA_GLOW}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: `drop-shadow(0 0 3px ${choice === "mea" ? MEA_GLOW : MIA_GLOW})` }}
              />
            )}

            {/* isometric step platforms for each side (skip the shared base at index 0) */}
            {([[MIA_PATH, MIA_GLOW, "mia"] as const, [MEA_PATH, MEA_GLOW, "mea"] as const]).map(
              ([p, glow, side]) =>
                p.slice(1).map((node, i) => {
                  const w = 22
                  const h = 8
                  const depth = 12
                  const faded = dim(side as Choice)
                  return (
                    <g key={`${side}-${i}`} style={{ opacity: faded ? 0.25 : 1, transition: "opacity 0.5s ease" }}>
                      <path
                        d={`M ${node[0] - w} ${node[1]} L ${node[0]} ${node[1] + h} L ${node[0]} ${node[1] + h + depth} L ${node[0] - w} ${node[1] + depth} Z`}
                        fill={`color-mix(in oklab, ${glow} 16%, #05060d)`}
                      />
                      <path
                        d={`M ${node[0] + w} ${node[1]} L ${node[0]} ${node[1] + h} L ${node[0]} ${node[1] + h + depth} L ${node[0] + w} ${node[1] + depth} Z`}
                        fill={`color-mix(in oklab, ${glow} 9%, #05060d)`}
                      />
                      <path
                        d={`M ${node[0]} ${node[1] - h} L ${node[0] + w} ${node[1]} L ${node[0]} ${node[1] + h} L ${node[0] - w} ${node[1]} Z`}
                        fill={`color-mix(in oklab, ${glow} 26%, #05060d)`}
                        stroke={glow}
                        strokeOpacity="0.5"
                        strokeWidth="0.75"
                      />
                    </g>
                  )
                }),
            )}

            {/* the traveller — a small neutral figure; idle bob until a way is chosen */}
            <g
              style={{
                transform: `translate(${fig[0]}px, ${fig[1] - 9}px)`,
                transition: choice ? "none" : "transform 0.5s ease",
                opacity: opened ? 0 : 1,
                filter: "drop-shadow(0 0 4px color-mix(in oklab, var(--foreground) 60%, white))",
              }}
            >
              <g style={{ animation: choice ? "none" : "mm-bob 3.2s ease-in-out infinite" }}>
                <ellipse cx="0" cy="1" rx="7" ry="2.5" fill="#000000" opacity="0.3" />
                <path d="M -3.4 0 L 3.4 0 L 2.4 -11 L -2.4 -11 Z" fill="#f1f2f8" />
                <circle cx="0" cy="-14.5" r="3.3" fill="#f1f2f8" />
              </g>
            </g>
          </svg>

          {/* MIA eye — the existing emblem; screen blend drops its black field */}
          <EyeButton
            side="mia"
            label="MIA"
            sub="remembers · the chat"
            x={MIA_PATH[MIA_PATH.length - 1][0]}
            glow={MIA_GLOW}
            dimmed={dim("mia")}
            active={choice === "mia"}
            opened={opened && choice === "mia"}
            disabled={committed.current}
            onChoose={() => choose("mia")}
          >
            <img
              src="/mia/meetmia-emblem.jpeg"
              alt=""
              className="pointer-events-none w-[118%] max-w-none"
              style={{ mixBlendMode: "screen" }}
            />
          </EyeButton>

          {/* MEA eye — the lens with a lowercase i standing in the iris */}
          <EyeButton
            side="mea"
            label="MEA"
            sub="helps you act · the assistant"
            x={MEA_PATH[MEA_PATH.length - 1][0]}
            glow={MEA_GLOW}
            dimmed={dim("mea")}
            active={choice === "mea"}
            opened={opened && choice === "mea"}
            disabled={committed.current}
            onChoose={() => choose("mea")}
          >
            <img src="/mea/icon-512.png" alt="" className="pointer-events-none w-full rounded-full" />
          </EyeButton>
        </div>

        <p className="mv-rise mv-rise-3 mt-8 min-h-4 text-[10px] uppercase tracking-[0.26em] text-muted-foreground/80">
          {choice
            ? choice === "mia"
              ? "crossing over to meet MIA…"
              : "opening MEA…"
            : last
              ? `last time, you opened ${last.toUpperCase()}`
              : "choose a stairway"}
        </p>
      </section>
    </main>
  )
}

function EyeButton({
  side,
  label,
  sub,
  x,
  glow,
  dimmed,
  active,
  opened,
  disabled,
  onChoose,
  children,
}: {
  side: Choice
  label: string
  sub: string
  x: number
  glow: string
  dimmed: boolean
  active: boolean
  opened: boolean
  disabled: boolean
  onChoose: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onChoose}
      disabled={disabled}
      aria-label={side === "mia" ? "Walk to MIA — the chat that remembers" : "Walk to MEA — the executive assistant"}
      className="group absolute flex -translate-x-1/2 flex-col items-center gap-2 rounded-2xl p-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:cursor-default"
      style={{
        left: pct(x, 300),
        top: "1%",
        width: "31%",
        opacity: dimmed ? 0.3 : 1,
        transition: "opacity 0.5s ease, transform 0.7s cubic-bezier(0.22,1,0.36,1)",
        transform: `translateX(-50%) scale(${opened ? 1.16 : 1})`,
      }}
    >
      <span className="relative grid aspect-square w-full place-items-center">
        {/* glow halo */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-[8%] rounded-full blur-md"
          style={{
            background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
            opacity: active ? 0.7 : 0.28,
            transition: "opacity 0.6s ease",
          }}
        />
        {/* invitation ring while idle */}
        {!disabled && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-[10%] rounded-full border"
            style={{ borderColor: glow, animation: "mm-ring 2.8s ease-out infinite", transformOrigin: "center" }}
          />
        )}
        <span className="relative grid w-[78%] place-items-center transition-transform duration-500 group-hover:scale-105">
          {children}
        </span>
      </span>
      <span className="flex flex-col items-center leading-none">
        <span className="font-serif text-xl tracking-tight text-foreground [text-shadow:0_1px_10px_var(--background)]">
          {label}
        </span>
        <span className="mt-1 text-[8.5px] uppercase tracking-[0.16em] text-muted-foreground">{sub}</span>
      </span>
    </button>
  )
}
