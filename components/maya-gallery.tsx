import Link from "next/link"
import { hasAlbumAccess } from "@/lib/album-access"
import { HELIX_ALBUM } from "@/lib/maya-album"
import { worldEntry } from "@/lib/world-entry-config"
import { worldStyle, type World } from "@/lib/worlds"
import { WorldBackground } from "./world-background"
import { WorldNav } from "./world-nav"

/**
 * The interior of maya: a small gallery of photography albums. For now there is
 * one album, "Interstellar Helix", which is itself locked behind a password.
 */
export async function MayaGallery({ world }: { world: World }) {
  const cfg = worldEntry(world.handle)
  const unlocked = await hasAlbumAccess(HELIX_ALBUM.slug)
  const cover = HELIX_ALBUM.photos[0]

  return (
    <main
      style={worldStyle(world)}
      className="relative flex min-h-svh flex-col overflow-hidden bg-background text-foreground"
    >
      <WorldBackground ambience={cfg.ambience} />
      <WorldNav world={world} />

      <section className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col px-5 pb-20 pt-10 md:px-8">
        <header className="mv-rise mb-12 max-w-2xl">
          <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            {world.name} — photography
          </p>
          <h1 className="font-serif text-5xl leading-[0.95] tracking-tight text-balance md:text-7xl">
            The refraction of light
          </h1>
          <p className="mt-5 max-w-lg text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
            One image, split and sent along a hundred angles. These are the albums where the light lands.
          </p>
        </header>

        <div className="mv-rise mv-rise-2 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Link
            href={`/store/maya/${HELIX_ALBUM.slug}`}
            className="group relative flex min-h-[22rem] flex-col justify-end overflow-hidden rounded-xl border border-border bg-card p-6 transition-transform duration-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground hover:-translate-y-1"
            aria-label={`Open the album ${HELIX_ALBUM.title}${unlocked ? "" : " — locked"}`}
          >
            {/* cover */}
            <img
              src={cover.src || "/placeholder.svg"}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full scale-105 object-cover opacity-45 transition-all duration-700 group-hover:scale-110 group-hover:opacity-60"
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: "linear-gradient(to top, var(--background) 8%, color-mix(in oklab, var(--background) 40%, transparent) 55%, transparent 100%)" }}
              aria-hidden="true"
            />

            <div className="relative">
              <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.24em]">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${
                    unlocked
                      ? "border-primary/40 text-[color:var(--primary)]"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  <LockGlyph open={unlocked} />
                  {unlocked ? "open" : "locked"}
                </span>
                <span className="text-muted-foreground">{HELIX_ALBUM.photos.length} frames</span>
              </div>
              <h2 className="font-serif text-3xl leading-tight tracking-tight md:text-4xl">{HELIX_ALBUM.title}</h2>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">{HELIX_ALBUM.kicker}</p>
            </div>
          </Link>

          {/* a quiet "more to come" tile so the single album doesn't feel lonely */}
          <div className="flex min-h-[22rem] items-center justify-center rounded-xl border border-dashed border-border/70 p-6 text-center">
            <p className="max-w-[16rem] text-pretty text-sm leading-relaxed text-muted-foreground">
              More albums are still developing. The light hasn&apos;t finished landing.
            </p>
          </div>
        </div>
      </section>

      <footer className="relative z-10 flex items-center justify-between px-5 py-6 text-[10px] uppercase tracking-[0.18em] text-muted-foreground md:px-8">
        <span>{world.name}</span>
        <span>refraction of light</span>
      </footer>
    </main>
  )
}

function LockGlyph({ open }: { open: boolean }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="10.5" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
      {open ? (
        <path d="M8 10.5V7a4 4 0 0 1 7.5-1.9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      ) : (
        <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      )}
    </svg>
  )
}
