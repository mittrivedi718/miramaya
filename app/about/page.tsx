import type { Metadata } from "next"
import Link from "next/link"
import { BrandMark } from "@/components/brand-mark"
import { LivingDocument } from "@/components/living-document"
import { LiveStamp } from "@/components/live-stamp"
import { ThemeToggle } from "@/components/theme-toggle"

export const metadata: Metadata = {
  title: "About",
  description: "MiraMaya, still being written. A house of mirrors by Meet Mit.",
}

export default function AboutPage() {
  return (
    <main className="relative min-h-svh bg-background px-5 py-10 text-foreground md:px-8 md:py-14">
      <header className="mx-auto flex max-w-3xl items-center justify-between">
        <Link href="/" className="transition-opacity hover:opacity-80" aria-label="Return to the gallery">
          <BrandMark tone="aurora" className="h-9" />
        </Link>
        <ThemeToggle />
      </header>

      <article className="mx-auto mt-14 max-w-3xl md:mt-20">
        {/* Manuscript header: a file that is open and unsaved. */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            about/miramaya.txt — draft
          </p>
          <LiveStamp prefix="writing" />
        </div>

        <div className="mt-10 grid gap-10 md:grid-cols-[1fr_auto] md:gap-14">
          <LivingDocument />

          {/* Code-style margin notes: the essence, annotated. */}
          <aside className="border-t border-border pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-1">
            <ul className="flex flex-col gap-4 font-mono text-[11px] leading-relaxed text-muted-foreground">
              <li>{"// status: work in progress"}</li>
              <li>{"// author: Meet Mit"}</li>
              <li>{"// mirrors: 5"}</li>
              <li>{"// finished: false"}</li>
              <li className="text-accent">{"/* revisit — this grows */"}</li>
            </ul>
          </aside>
        </div>

        <footer className="mt-16 flex flex-col gap-6 border-t border-border pt-8 md:mt-24">
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground text-pretty">
            Nothing here is final. Consider this the first draft of a place that keeps being written.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href="/"
              className="text-[10px] uppercase tracking-[0.2em] underline underline-offset-4 hover:opacity-80"
            >
              Enter the gallery
            </Link>
            <Link
              href="/store/marked-by-mit#book"
              className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Book with Mit
            </Link>
          </div>
        </footer>
      </article>
    </main>
  )
}
