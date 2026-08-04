"use client"

import { useCallback, useEffect, useState } from "react"
import { Play, X } from "lucide-react"
import type { Artwork } from "@/lib/data"

export function Gallery({ artworks }: { artworks: Artwork[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const active = activeIndex === null ? null : artworks[activeIndex]

  const close = useCallback(() => setActiveIndex(null), [])
  const next = useCallback(() => setActiveIndex((i) => (i === null ? i : (i + 1) % artworks.length)), [artworks.length])
  const prev = useCallback(
    () => setActiveIndex((i) => (i === null ? i : (i - 1 + artworks.length) % artworks.length)),
    [artworks.length],
  )

  useEffect(() => {
    if (activeIndex === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
      if (e.key === "ArrowRight") next()
      if (e.key === "ArrowLeft") prev()
    }
    window.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [activeIndex, close, next, prev])

  if (artworks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card/50 px-6 py-20 text-center">
        <p className="font-serif text-2xl text-foreground">The walls are still bare</p>
        <p className="mx-auto mt-3 max-w-md text-pretty text-muted-foreground">
          Luna is busy in the studio. New paintings, photographs, and films will be hung here soon.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {artworks.map((art, index) => (
          <button
            key={art.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            className="group relative flex aspect-[4/5] w-full overflow-hidden rounded-lg border border-border bg-card text-left"
          >
            {art.mediaType === "video" ? (
              <>
                {art.posterUrl ? (
                  <img
                    src={art.posterUrl || "/placeholder.svg"}
                    alt={art.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <video
                    src={art.url}
                    muted
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                )}
                <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-background/85 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-foreground backdrop-blur">
                  <Play className="h-3 w-3 fill-current" aria-hidden="true" />
                  Film
                </span>
              </>
            ) : (
              <img
                src={art.url || "/placeholder.svg"}
                alt={art.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            )}

            <span className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-background/90 to-transparent p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <span className="block font-serif text-lg leading-tight text-foreground">{art.title}</span>
              {art.description && (
                <span className="mt-0.5 line-clamp-1 block text-sm text-muted-foreground">{art.description}</span>
              )}
            </span>
          </button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-card text-foreground shadow-lg"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <div
            className="flex max-h-[90svh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex min-h-0 flex-1 items-center justify-center bg-secondary">
              {active.mediaType === "video" ? (
                <video
                  key={active.id}
                  src={active.url}
                  poster={active.posterUrl ?? undefined}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[70svh] w-full object-contain"
                />
              ) : (
                <img
                  key={active.id}
                  src={active.url || "/placeholder.svg"}
                  alt={active.title}
                  className="max-h-[70svh] w-full object-contain"
                />
              )}
            </div>
            <div className="flex items-start justify-between gap-4 p-5">
              <div>
                <h3 className="font-serif text-2xl leading-tight text-foreground">{active.title}</h3>
                {active.description && (
                  <p className="mt-1.5 text-pretty leading-relaxed text-muted-foreground">{active.description}</p>
                )}
              </div>
              {artworks.length > 1 && (
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={prev}
                    className="rounded-full border border-border px-3 py-2 text-xs uppercase tracking-[0.14em] text-foreground hover:bg-secondary"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    className="rounded-full border border-border px-3 py-2 text-xs uppercase tracking-[0.14em] text-foreground hover:bg-secondary"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
