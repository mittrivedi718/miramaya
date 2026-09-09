"use client"

import { useState } from "react"
import { Sun, Moon, CircleDot, Sparkles } from "lucide-react"
import type { Palette } from "@/lib/mea/rooms"
import { useMea } from "./provider"

const OPTIONS: { value: Palette; label: string; icon: typeof Sun }[] = [
  { value: "miramire", label: "Miramire", icon: CircleDot },
  { value: "daylight", label: "Daylight", icon: Sun },
  { value: "obsidian", label: "Obsidian", icon: Moon },
  { value: "auto", label: "Follow the light", icon: Sparkles },
]

export function PaletteControl() {
  const { palette, resolvedPalette, setPalette } = useMea()
  const [open, setOpen] = useState(false)
  const active = OPTIONS.find((o) => o.value === palette) ?? OPTIONS[0]
  const ActiveIcon = active.icon

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Palette: ${active.label}${palette === "auto" ? `, currently ${resolvedPalette}` : ""}`}
        className="mea-ghost-btn flex min-h-[44px] items-center gap-2 rounded-full px-3 text-xs"
      >
        <ActiveIcon size={16} aria-hidden />
        <span className="hidden sm:inline">{active.label}</span>
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            className="mea-menu absolute right-0 z-50 mt-2 w-52 rounded-2xl p-1.5"
          >
            {OPTIONS.map((o) => {
              const Icon = o.icon
              const selected = o.value === palette
              return (
                <button
                  key={o.value}
                  type="button"
                  role="menuitemradio"
                  aria-checked={selected}
                  onClick={() => {
                    setPalette(o.value)
                    setOpen(false)
                  }}
                  className="mea-menu-item flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm"
                  data-selected={selected}
                >
                  <Icon size={16} aria-hidden />
                  <span className="flex-1">{o.label}</span>
                  {o.value === "auto" && palette === "auto" ? (
                    <span className="text-[10px] text-[var(--mea-dim)]">{resolvedPalette}</span>
                  ) : null}
                </button>
              )
            })}
          </div>
        </>
      ) : null}
    </div>
  )
}
