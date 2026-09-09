"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { DoorOpen, Eye, PenLine, ScrollText, Layers, AudioLines } from "lucide-react"

const SURFACES = [
  { href: "/mea", label: "Threshold", icon: Eye, exact: true },
  { href: "/mea/doors", label: "Doors", icon: DoorOpen, exact: false },
  { href: "/mea/hands", label: "Hands", icon: PenLine, exact: true },
  { href: "/mea/vault", label: "Vault", icon: Layers, exact: true },
  { href: "/mea/voice", label: "Voice", icon: AudioLines, exact: true },
  { href: "/mea/ledger", label: "Ledger", icon: ScrollText, exact: true },
] as const

function isActive(pathname: string, href: string, exact: boolean) {
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(href + "/")
}

export function BottomTabs() {
  const pathname = usePathname()
  return (
    <nav
      aria-label="MEA surfaces"
      className="mea-tabbar fixed inset-x-0 bottom-0 z-40 lg:hidden"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between gap-1 px-2 pt-1.5">
        {SURFACES.map((s) => {
          const active = isActive(pathname, s.href, s.exact)
          const Icon = s.icon
          return (
            <li key={s.href} className="flex-1">
              <Link
                href={s.href}
                aria-current={active ? "page" : undefined}
                className="mea-tab flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-xl py-1.5 text-[10px]"
                data-active={active}
              >
                <Icon size={20} strokeWidth={active ? 2 : 1.5} aria-hidden />
                <span className="leading-none">{s.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export function LeftRail() {
  const pathname = usePathname()
  return (
    <nav
      aria-label="MEA surfaces"
      className="mea-rail hidden w-56 shrink-0 flex-col gap-1 border-r px-3 py-6 lg:flex"
    >
      <div className="mb-6 flex items-center gap-2 px-2">
        <span className="mea-eye-mark" aria-hidden />
        <span className="font-display text-lg tracking-tight text-[var(--mea-silver)]">MEA</span>
      </div>
      {SURFACES.map((s) => {
        const active = isActive(pathname, s.href, s.exact)
        const Icon = s.icon
        return (
          <Link
            key={s.href}
            href={s.href}
            aria-current={active ? "page" : undefined}
            className="mea-rail-link flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm"
            data-active={active}
          >
            <Icon size={18} strokeWidth={active ? 2 : 1.5} aria-hidden />
            <span>{s.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
