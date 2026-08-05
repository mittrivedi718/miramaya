"use client"

import { useMemo, useState, useTransition } from "react"
import { Bird, Cloud, Eye, Flower2, Heart, KeyRound, Leaf, Moon, Mountain, Sparkle, Star, Sun, Syringe } from "lucide-react"
import { unlockPortal } from "@/app/portal-actions"
import { SYMBOLS } from "@/lib/portal-symbols"

const icons = { bird: Bird, star: Star, moon: Moon, eye: Eye, cloud: Cloud, key: KeyRound, leaf: Leaf, sun: Sun, mountain: Mountain, heart: Heart, flower: Flower2, needle: Syringe }

type PortalPuzzleProps = {
  handle: string
  symbols: string[]
  onUnlocked: () => void
  onCancel: () => void
}

export function PortalPuzzle({ handle, symbols, onUnlocked, onCancel }: PortalPuzzleProps) {
  const [presses, setPresses] = useState<string[]>([])
  const [message, setMessage] = useState("Touch the symbols in the order the guidebook keeps.")
  const [pending, startTransition] = useTransition()
  // Shuffle the grid so its layout never gives away the answer order.
  const shown = useMemo(() => {
    const copy = [...symbols]
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy
  }, [symbols])

  function press(symbol: string) {
    if (pending) return
    const next = [...presses, symbol]
    setPresses(next)
    if (next.length === 3) {
      startTransition(async () => {
        const result = await unlockPortal(handle, next)
        if (result.ok) {
          setMessage("The mirror remembers.")
          onUnlocked()
        } else {
          setPresses([])
          setMessage(result.message ?? "The mirror went still. Begin again.")
        }
      })
    }
  }

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/90 px-5 backdrop-blur-md">
      <section aria-labelledby="puzzle-title" className="w-full max-w-xl border border-border bg-card p-6 shadow-2xl md:p-10">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">A small remembering</p>
            <h2 id="puzzle-title" className="mt-3 font-serif text-4xl tracking-tight md:text-5xl">Speak with your hands.</h2>
          </div>
          <button type="button" onClick={onCancel} className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground underline underline-offset-4">Close</button>
        </div>

        <p aria-live="polite" className="mt-5 min-h-6 text-sm text-muted-foreground">{message}</p>
        <div className="my-6 flex gap-2" aria-label={`${presses.length} of 3 symbols entered`}>
          {[0, 1, 2].map((step) => <span key={step} className={`h-1 flex-1 ${step < presses.length ? "bg-accent" : "bg-muted"}`} />)}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {shown.map((symbolId) => {
            const symbol = SYMBOLS[symbolId as keyof typeof SYMBOLS]
            const Icon = symbol ? icons[symbol.glyph] : Sparkle
            return (
              <button
                key={symbolId}
                type="button"
                disabled={pending}
                onClick={() => press(symbolId)}
                className="flex aspect-square flex-col items-center justify-center gap-3 border border-border bg-background transition-transform active:scale-95 disabled:opacity-50"
                aria-label={symbol?.label ?? symbolId}
              >
                <Icon className="size-8" style={{ color: symbol?.color }} aria-hidden="true" />
                <span className="text-[10px] uppercase tracking-[0.14em]">{symbol?.label ?? symbolId}</span>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
