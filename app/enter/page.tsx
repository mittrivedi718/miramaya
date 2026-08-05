import type { Metadata } from "next"
import { BrandMark } from "@/components/brand-mark"
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
    <main className="flex min-h-svh flex-col items-center justify-center gap-12 bg-background px-6 py-16 text-foreground">
      <div className="flex flex-col items-center gap-6 text-center">
        <BrandMark tone="aurora" title="Miramaya" className="h-20 drop-shadow-[0_0_30px_color-mix(in_oklab,var(--brand-lavender)_35%,transparent)]" />
        <div className="flex flex-col gap-3">
          <h1 className="font-serif text-4xl tracking-[-0.03em] text-balance md:text-5xl">Miramaya</h1>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground text-pretty">
            This is a private preview. Enter the passphrase to step inside.
          </p>
        </div>
      </div>

      <UnlockForm from={returnPath} />

      <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">By invitation only</p>
    </main>
  )
}
