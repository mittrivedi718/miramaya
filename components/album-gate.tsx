"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { unlockAlbum } from "@/app/portal-actions"
import type { Album } from "@/lib/maya-album"
import { worldStyle, type World } from "@/lib/worlds"
import { WorldBackground } from "./world-background"

/**
 * The lock in front of a password-protected album. Shows the album's tagline,
 * then a single password field. The check happens server-side.
 */
export function AlbumGate({ world, album }: { world: World; album: Album }) {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [opening, setOpening] = useState(false)
  const [pending, startTransition] = useTransition()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (pending || opening) return
    setError(null)
    startTransition(async () => {
      const res = await unlockAlbum(album.slug, password)
      if (res.ok) {
        setOpening(true)
        window.setTimeout(() => router.refresh(), 900)
      } else {
        setError(res.message ?? "That key doesn't fit this lock.")
      }
    })
  }

  return (
    <main
      style={worldStyle(world)}
      className="relative flex min-h-svh flex-col overflow-hidden bg-background text-foreground"
    >
      <WorldBackground ambience="astral" />

      <div className="relative z-10 flex items-center justify-between px-5 py-4 text-[10px] uppercase tracking-[0.22em] text-muted-foreground md:px-8">
        <a href="/store/maya" className="transition-colors hover:text-foreground">
          ← {world.name}
        </a>
        <span>{album.kicker}</span>
      </div>

      <section className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-24 text-center">
        <p className="mv-rise mb-4 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          A locked album
        </p>
        <h1 className="mv-rise mb-8 font-serif text-5xl leading-[0.95] tracking-tight text-balance md:text-7xl">
          {album.title}
        </h1>

        <p className="mv-rise mv-rise-2 mb-12 max-w-md text-pretty font-serif text-xl leading-snug text-[color:var(--primary)] md:text-2xl">
          {album.tagline}
        </p>

        <form onSubmit={submit} className="mv-rise mv-rise-3 flex w-full max-w-xs flex-col items-center gap-3">
          <label htmlFor="album-password" className="sr-only">
            Album password
          </label>
          <input
            id="album-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="the key"
            disabled={opening}
            className="h-12 w-full rounded-lg border border-border bg-card/70 px-4 text-center text-base tracking-[0.2em] text-foreground outline-none backdrop-blur-sm transition-colors placeholder:text-muted-foreground/60 focus:border-[color:var(--primary)]"
          />
          <button
            type="submit"
            disabled={pending || opening || password.length === 0}
            className="h-12 w-full rounded-lg bg-[color:var(--primary)] text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--primary-foreground)] transition-opacity disabled:opacity-45"
          >
            {opening ? "unwinding…" : pending ? "…" : "unwind"}
          </button>
          <p aria-live="polite" className="h-4 text-[11px] uppercase tracking-[0.18em] text-destructive">
            {error}
          </p>
        </form>
      </section>

      {opening && (
        <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center bg-background/40 backdrop-blur-sm">
          <p className="animate-pulse text-[10px] uppercase tracking-[0.35em]">entering the helix</p>
        </div>
      )}
    </main>
  )
}
