"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { worldStyle, type World } from "@/lib/worlds"
import { WorldBackground } from "./world-background"

/* ---------------------------------------------------------------------------
   The MIA / MEA chooser.

   One traveller stands on the base stone at the fork of two stairways. You move
   them by TAPPING the glowing stones — one step at a time. Tap up to climb, tap
   the stone below to step back down; at the base you can switch to the other
   stair. Reach the final summit stone behind an eye and that realm opens.

   LEFT, at the far left, is MIA's emblem-eye → crosses to the MIA chat.
   RIGHT, at the far right, is MEA's i-in-the-iris eye → opens the assistant.

   The stones are the game; each eye is also a real focusable button that enters
   its realm directly, so keyboard and reduced-motion visitors are never stuck.
--------------------------------------------------------------------------- */

const MIA_URL = "https://meetmia.vercel.app/"

type Side = "mia" | "mea"

type StepNode = {
  id: string
  x: number // in a 300 x 260 field
  y: number
  side: Side | "base"
  summit?: Side // set only on the final stone behind an eye
}

// The two stairways. Index climbs away from the shared base stone; the last
// stone on each side is the SUMMIT that sits behind that side's eye.
const NODES: StepNode[] = [
  { id: "base", x: 150, y: 236, side: "base" },
  { id: "mia-1", x: 124, y: 212, side: "mia" },
  { id: "mia-2", x: 102, y: 186, side: "mia" },
  { id: "mia-3", x: 82, y: 150, side: "mia" },
  { id: "mia-4", x: 66, y: 92, side: "mia", summit: "mia" },
  { id: "mea-1", x: 176, y: 212, side: "mea" },
  { id: "mea-2", x: 198, y: 186, side: "mea" },
  { id: "mea-3", x: 218, y: 150, side: "mea" },
  { id: "mea-4", x: 234, y: 92, side: "mea", summit: "mea" },
]

const byId = (id: string): StepNode => NODES.find((n) => n.id === id) as StepNode

/** Stones you can step to from `id` — always the one below, plus the one above. */
function neighbors(id: string): string[] {
  if (id === "base") return ["mia-1", "mea-1"]
  const node = byId(id)
  const side = node.side as Side
  const step = Number(id.split("-")[1])
  const out: string[] = [step === 1 ? "base" : `${side}-${step - 1}`]
  const up = `${side}-${step + 1}`
  if (NODES.some((n) => n.id === up)) out.push(up)
  return out
}

/** base → … → current, along the side currently occupied (drives the lit trail). */
function progress(id: string): StepNode[] {
  if (id === "base") return [byId("base")]
  const node = byId(id)
  const side = node.side as Side
  const step = Number(id.split("-")[1])
  const chain = [byId("base")]
  for (let k = 1; k <= step; k += 1) chain.push(byId(`${side}-${k}`))
  return chain
}

const MIA_GLOW = "#9aa6d8" // the emblem's cool silver-blue
const MEA_GLOW = "#b9a8e6" // MEA's lavender
const NEUTRAL = "#c9ced8"

const HOP_MS = 300
const HOP = 18

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const pct = (v: number, span: number) => `${(v / span) * 100}%`
const glowFor = (side: Side | "base") => (side === "mia" ? MIA_GLOW : side === "mea" ? MEA_GLOW : NEUTRAL)

export function MiaMeaGate({ world }: { world: World }) {
  const router = useRouter()
  const [currentId, setCurrentId] = useState("base")
  const [fig, setFig] = useState<readonly [number, number]>([150, 236])
  const [committed, setCommitted] = useState(false)
  const [opened, setOpened] = useState<Side | null>(null)
  const [last, setLast] = useState<Side | null>(null)
  const animating = useRef(false)
  const raf = useRef<number | null>(null)

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
    (dir: Side) => {
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

  const enter = useCallback(
    (side: Side) => {
      setCommitted(true)
      setOpened(side)
      window.setTimeout(() => cross(side), 560)
    },
    [cross],
  )

  const land = useCallback(
    (node: StepNode) => {
      setCurrentId(node.id)
      if (node.summit) enter(node.summit)
    },
    [enter],
  )

  // Step one stone. Ignores taps that aren't an immediate neighbour.
  const step = useCallback(
    (targetId: string) => {
      if (committed || animating.current) return
      if (!neighbors(currentId).includes(targetId)) return
      const from = byId(currentId)
      const to = byId(targetId)

      const reduced =
        typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
      if (reduced) {
        setFig([to.x, to.y])
        land(to)
        return
      }

      animating.current = true
      const start = performance.now()
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / HOP_MS)
        const f = easeInOut(t)
        const x = from.x + (to.x - from.x) * f
        const y = from.y + (to.y - from.y) * f - HOP * Math.sin(Math.PI * f)
        setFig([x, y])
        if (t < 1) {
          raf.current = requestAnimationFrame(tick)
        } else {
          setFig([to.x, to.y])
          animating.current = false
          land(to)
        }
      }
      raf.current = requestAnimationFrame(tick)
    },
    [committed, currentId, land],
  )

  // Accessible express route: the eye button enters its realm directly.
  const enterDirect = useCallback(
    (side: Side) => {
      if (committed) return
      const summit = byId(`${side}-4`)
      setCurrentId(summit.id)
      setFig([summit.x, summit.y])
      enter(side)
    },
    [committed, enter],
  )

  const steppable = committed ? [] : neighbors(currentId)
  const trail = useMemo(() => progress(currentId), [currentId])
  const litTrail = [...trail.map((n) => `${n.x},${n.y}`), `${fig[0]},${fig[1]}`].join(" ")
  const currentSide = byId(currentId).side

  const hint = (() => {
    if (opened) return opened === "mia" ? "crossing to MIA…" : "opening MEA…"
    if (currentId === "base") return last ? `last time, you opened ${last.toUpperCase()} — tap a stone to begin` : "tap a glowing stone to step onto the stairs"
    const node = byId(currentId)
    const step = Number(currentId.split("-")[1])
    if (step === 3) return `one more stone to ${(node.side as string).toUpperCase()} — or step back down`
    return `climbing ${(node.side as string).toUpperCase()} — keep tapping up, or step back down`
  })()

  return (
    <main
      style={worldStyle(world)}
      className="relative flex min-h-svh flex-col overflow-hidden bg-background text-foreground"
    >
      <style>{`
        @keyframes mm-bob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-2.5px) } }
        @keyframes mm-ring { 0% { opacity:.55; transform:scale(.85) } 70%,100% { opacity:0; transform:scale(1.5) } }
        @keyframes mm-pulse { 0%,100% { opacity:.4 } 50% { opacity:.9 } }
      `}</style>

      <WorldBackground ambience="astral" />

      <header className="relative z-10 flex items-center justify-between px-5 py-4 text-[10px] uppercase tracking-[0.22em] text-muted-foreground md:px-8">
        <a href="/" className="min-h-11 py-3 transition-colors hover:text-foreground">
          ← the mirrors
        </a>
        <span>{world.tagline}</span>
      </header>

      <section
        className={`relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-12 text-center transition-all duration-700 ${
          opened ? "scale-105 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        <p className="mv-rise mb-2 text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
          who are you talking to?
        </p>
        <h1 className="mv-rise mv-rise-2 mb-2 font-serif text-5xl tracking-tight md:text-7xl">MIA / MEA</h1>
        <p className="mv-rise mv-rise-2 mb-7 max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
          Tap the glowing stones to walk the traveller up — one stone at a time. Climb left to{" "}
          <span className="text-foreground">MIA</span>, who remembers, or right to{" "}
          <span className="text-foreground">MEA</span>, who helps you act. Step back down to switch stairs.
        </p>

        {/* The forking stairway. */}
        <div
          className="mv-rise mv-rise-3 relative w-[min(92vw,26rem)] select-none"
          style={{ aspectRatio: "300 / 260" }}
        >
          <svg viewBox="0 0 300 260" className="absolute inset-0 h-full w-full" aria-hidden="true">
            {/* faint dashed guides for both stairways */}
            {(["mia", "mea"] as const).map((side) => (
              <polyline
                key={side}
                points={[byId("base"), ...[1, 2, 3, 4].map((k) => byId(`${side}-${k}`))]
                  .map((n) => `${n.x},${n.y}`)
                  .join(" ")}
                fill="none"
                stroke="currentColor"
                strokeOpacity="0.14"
                strokeWidth="1"
                strokeDasharray="2 5"
                strokeLinecap="round"
              />
            ))}

            {/* the walked, glowing trail up the occupied side */}
            {currentId !== "base" && (
              <polyline
                points={litTrail}
                fill="none"
                stroke={glowFor(currentSide)}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: `drop-shadow(0 0 3px ${glowFor(currentSide)})` }}
              />
            )}

            {/* stones */}
            {NODES.map((node) => (
              <StepBlock
                key={node.id}
                node={node}
                glow={glowFor(node.side)}
                lit={trail.some((t) => t.id === node.id)}
                steppable={steppable.includes(node.id)}
                summit={Boolean(node.summit)}
              />
            ))}

            {/* the traveller — a small luminous figure; idle bob at the base */}
            <g
              style={{
                transform: `translate(${fig[0]}px, ${fig[1] - 9}px)`,
                opacity: opened ? 0 : 1,
                transition: opened ? "opacity 0.4s ease" : "none",
                filter: "drop-shadow(0 0 4px color-mix(in oklab, var(--foreground) 60%, white))",
              }}
            >
              <g style={{ animation: currentId === "base" && !committed ? "mm-bob 3.2s ease-in-out infinite" : "none" }}>
                <ellipse cx="0" cy="1" rx="7" ry="2.5" fill="#000000" opacity="0.3" />
                <path d="M -3.4 0 L 3.4 0 L 2.4 -11 L -2.4 -11 Z" fill="#f1f2f8" />
                <circle cx="0" cy="-14.5" r="3.3" fill="#f1f2f8" />
              </g>
            </g>
          </svg>

          {/* Tap targets for the stones you can step to (44px, real buttons). */}
          {steppable.map((id) => {
            const node = byId(id)
            const goingBack = trail.some((t) => t.id === id)
            const label = node.summit
              ? `Step onto the final stone and enter ${(node.side as string).toUpperCase()}`
              : goingBack
                ? id === "base"
                  ? "Step back down to the fork"
                  : "Step back down one stone"
                : `Step up toward ${(node.side as string).toUpperCase()}`
            const glow = glowFor(node.side)
            return (
              <button
                key={id}
                type="button"
                onClick={() => step(id)}
                aria-label={label}
                className="absolute z-20 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                style={{ left: pct(node.x, 300), top: pct(node.y, 260) }}
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-1 rounded-full border-2"
                  style={{ borderColor: glow, animation: "mm-ring 2.4s ease-out infinite" }}
                />
                <span
                  aria-hidden="true"
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: glow, boxShadow: `0 0 8px ${glow}`, animation: "mm-pulse 2.4s ease-in-out infinite" }}
                />
              </button>
            )
          })}

          {/* MIA eye — transparent PNG, embedded (no square field). */}
          <EyeButton
            side="mia"
            label="MIA"
            sub="remembers · the chat"
            x={byId("mia-4").x}
            glow={MIA_GLOW}
            dimmed={committed && opened !== "mia"}
            active={currentSide === "mia" || opened === "mia"}
            opened={opened === "mia"}
            disabled={committed}
            onChoose={() => enterDirect("mia")}
            src="/mia/mia-eye.png"
          />

          {/* MEA eye — the almond lens with a lowercase i in the iris. */}
          <EyeButton
            side="mea"
            label="MEA"
            sub="helps you act · the assistant"
            x={byId("mea-4").x}
            glow={MEA_GLOW}
            dimmed={committed && opened !== "mea"}
            active={currentSide === "mea" || opened === "mea"}
            opened={opened === "mea"}
            disabled={committed}
            onChoose={() => enterDirect("mea")}
            src="/mea/mea-eye.png"
          />
        </div>

        <p className="mv-rise mv-rise-3 mt-7 min-h-4 max-w-xs text-[10px] uppercase tracking-[0.22em] leading-relaxed text-muted-foreground/80">
          {hint}
        </p>
      </section>
    </main>
  )
}

// A single isometric stone. The summit stone (behind the eye) is larger; lit
// stones (already walked) and steppable stones (tappable now) read brighter.
function StepBlock({
  node,
  glow,
  lit,
  steppable,
  summit,
}: {
  node: StepNode
  glow: string
  lit: boolean
  steppable: boolean
  summit: boolean
}) {
  const w = summit ? 24 : 21
  const h = 8
  const depth = 12
  const topMix = summit ? 40 : lit ? 40 : steppable ? 34 : 24
  const x = node.x
  const y = node.y
  return (
    <g
      style={{
        opacity: lit || steppable || summit ? 1 : 0.72,
        transition: "opacity 0.4s ease",
      }}
    >
      <path
        d={`M ${x - w} ${y} L ${x} ${y + h} L ${x} ${y + h + depth} L ${x - w} ${y + depth} Z`}
        fill={`color-mix(in oklab, ${glow} 16%, #05060d)`}
      />
      <path
        d={`M ${x + w} ${y} L ${x} ${y + h} L ${x} ${y + h + depth} L ${x + w} ${y + depth} Z`}
        fill={`color-mix(in oklab, ${glow} 9%, #05060d)`}
      />
      <path
        d={`M ${x} ${y - h} L ${x + w} ${y} L ${x} ${y + h} L ${x - w} ${y} Z`}
        fill={`color-mix(in oklab, ${glow} ${topMix}%, #05060d)`}
        stroke={glow}
        strokeOpacity={summit ? 0.8 : lit || steppable ? 0.65 : 0.4}
        strokeWidth={summit ? 1 : 0.75}
      />
    </g>
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
  src,
}: {
  side: Side
  label: string
  sub: string
  x: number
  glow: string
  dimmed: boolean
  active: boolean
  opened: boolean
  disabled: boolean
  onChoose: () => void
  src: string
}) {
  return (
    <button
      type="button"
      onClick={onChoose}
      disabled={disabled}
      aria-label={side === "mia" ? "Enter MIA directly — the chat that remembers" : "Enter MEA directly — the executive assistant"}
      className="group absolute z-10 flex flex-col items-center gap-2 rounded-2xl p-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:cursor-default"
      style={{
        left: pct(x, 300),
        top: "-2%",
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
            opacity: active ? 0.7 : 0.26,
            transition: "opacity 0.6s ease",
          }}
        />
        <span className="relative grid w-[92%] place-items-center transition-transform duration-500 group-hover:scale-105">
          <img src={src || "/placeholder.svg"} alt="" className="pointer-events-none w-full max-w-none" />
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
