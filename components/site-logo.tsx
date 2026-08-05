import Image from "next/image"

export function SiteLogo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <span className={`relative overflow-hidden rounded-sm bg-card ${compact ? "h-11 w-10" : "h-14 w-12"}`}>
        <Image src="/miramaya-mark.svg" alt="" fill priority className="object-cover" sizes="48px" />
      </span>
      {!compact && <span className="font-serif text-lg tracking-tight">miramaya</span>}
      <span className="sr-only">Miramaya home</span>
    </span>
  )
}
