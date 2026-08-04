"use client"

import { useEffect, useState } from "react"
import { Moon, Menu, X } from "lucide-react"

const LINKS = [
  { href: "#gallery", label: "Gallery" },
  { href: "#about", label: "About Luna" },
  { href: "#shows", label: "Upcoming Shows" },
]

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-colors ${
        scrolled ? "border-border bg-background/90 backdrop-blur-md" : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-8">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Moon className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-serif text-xl font-semibold tracking-tight text-foreground">From Here Studio</span>
            <span className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Art rooted in place</span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground underline-offset-8 transition-colors hover:text-foreground hover:underline"
            >
              {link.label}
            </a>
          ))}
          <a
            href="/portal"
            className="rounded-full border border-border px-4 py-1.5 text-xs uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-secondary"
          >
            Artist Login
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-border bg-background px-5 py-4 md:hidden" aria-label="Mobile">
          <ul className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-3 text-sm text-foreground hover:bg-secondary"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href="/portal"
                onClick={() => setOpen(false)}
                className="mt-1 block rounded-md bg-primary px-3 py-3 text-center text-xs uppercase tracking-[0.18em] text-primary-foreground"
              >
                Artist Login
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}
