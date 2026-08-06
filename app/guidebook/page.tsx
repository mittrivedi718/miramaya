import type { Metadata } from "next"
import Link from "next/link"
import { BrandMark } from "@/components/brand-mark"
import { hasGuidebookAccess } from "@/lib/guidebook"
import { worldEntry } from "@/lib/world-entry-config"
import { WORLDS } from "@/lib/worlds"
import { GuideForm } from "./guide-form"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "The Guidebook",
  robots: { index: false, follow: false },
}

export default async function GuidebookPage() {
  const unlocked = await hasGuidebookAccess()

  if (!unlocked) {
    return (
      <main className="relative flex min-h-svh flex-col items-center justify-center gap-8 bg-background px-6 py-16 text-foreground">
        <div className="flex flex-col items-center gap-6 text-center">
          <BrandMark tone="aurora" title="Miramaya" className="h-16" />
          <div className="flex flex-col gap-3">
            <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">The white star</p>
            <h1 className="font-serif text-4xl leading-none tracking-tight md:text-5xl">The Guidebook</h1>
            <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">
              Every passage asks for one small act of attention. This book holds the answers — the gesture that opens
              each mirror. It is only for the keeper.
            </p>
          </div>
          <div className="w-full max-w-sm">
            <GuideForm />
          </div>
          <Link
            href="/"
            className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground underline underline-offset-4"
          >
            Return to the gallery
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-svh bg-background px-5 py-16 text-foreground md:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="flex flex-col items-center gap-5 text-center">
          <BrandMark tone="aurora" title="Miramaya" className="h-14" />
          <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">The keeper&apos;s guidebook</p>
          <h1 className="font-serif text-5xl leading-none tracking-tight md:text-6xl">How to enter each mirror</h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            There is one rule of entry, worn four ways: each keeper asks for a small act of attention. Give the gesture
            written here, and the mirror opens.
          </p>
        </header>

        <ol className="mt-14 flex flex-col gap-4">
          {WORLDS.map((world, index) => {
            const cfg = worldEntry(world.handle)
            return (
              <li key={world.handle} className="border border-border bg-card p-5 md:p-7">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h2 className="font-serif text-3xl tracking-tight">{world.name}</h2>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Passage {String(index + 1).padStart(2, "0")} · {world.tagline}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{cfg.rule}</p>
              </li>
            )
          })}
        </ol>

        <div className="mt-14 flex flex-col items-center gap-4 border-t border-border pt-10 text-center">
          <p className="text-sm text-muted-foreground">
            The keeper may also share private doors from the studio.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/admin" className="text-[11px] uppercase tracking-[0.18em] underline underline-offset-4">
              The studio
            </Link>
            <Link
              href="/"
              className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground underline underline-offset-4"
            >
              The gallery
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
