import { BrandMark } from "@/components/brand-mark"

export function SiteLogo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <BrandMark tone="aurora" className={compact ? "h-9" : "h-11"} />
      {!compact && (
        <span className="font-serif text-lg lowercase tracking-[0.2em] text-foreground">miramaya</span>
      )}
      <span className="sr-only">Miramaya home</span>
    </span>
  )
}
