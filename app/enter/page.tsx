import type { Metadata } from "next"
import { BrandMark } from "@/components/brand-mark"
import { LiveStamp } from "@/components/live-stamp"
import { ThemeToggle } from "@/components/theme-toggle"
import { sanitizeReturnPath } from "@/lib/site-gate"
import { UnlockForm } from "./unlock-form"

export const metadata: Metadata = {
  title: "Enter",
  description: "A private passage.",
  robots: { index: false, follow: false },
}

export default async function EnterPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>
}) {
  const { from } = await searchParams
  const returnPath = sanitizeReturnPath(from)

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center gap-12 bg-background px-6 py-16 text-foreground">
      <div className="absolute right-5 top-5 md:right-8 md:top-8">
        <ThemeToggle />
      </div>
      <div className="flex flex-col items-center gap-6 text-center">
        <BrandMark tone="aurora" title="MiraMaya" className="h-20 drop-shadow-[0_0_30px_color-mix(in_oklab,var(--brand-lavender)_35%,transparent)]" />
        <div className="flex flex-col gap-3">
          <h1 className="font-serif text-4xl tracking-[-0.03em] text-balance md:text-5xl">MiraMaya</h1>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground text-pretty">
            This is a private preview, still being written. Enter the passphrase to step inside.
          </p>
          <p className="mt-1 font-mono text-[10px] leading-relaxed text-muted-foreground/70">
            {"// draft — a house of mirrors in progress"}
          </p>
        </div>
      </div>

      <UnlockForm from={returnPath} />

      <div className="flex flex-col items-center gap-2">
        <LiveStamp prefix="composing" />
        <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">By invitation only</p>
      </div>
    </main>
  )
}
