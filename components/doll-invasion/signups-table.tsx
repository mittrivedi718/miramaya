"use client"

import { useMemo, useState } from "react"
import { Check, Copy, Search } from "lucide-react"
import type { DollInvasionSignup } from "@/lib/doll-invasion"

function formatWhen(value: Date) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

/** Instagram handles arrive in many shapes; show a clean @handle and link out. */
function instagramHandle(raw: string) {
  const handle = raw
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/\/+$/, "")
    .replace(/^@/, "")
  return handle || null
}

export function SignupsTable({ signups }: { signups: DollInvasionSignup[] }) {
  const [query, setQuery] = useState("")
  const [copied, setCopied] = useState(false)

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return signups
    return signups.filter((row) =>
      [row.firstName, row.lastName, row.email, row.instagram, row.message]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(needle)),
    )
  }, [signups, query])

  async function copyEmails() {
    const list = filtered.map((row) => row.email).join(", ")
    if (!list) return
    await navigator.clipboard.writeText(list)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="min-h-svh bg-background px-5 py-10 text-foreground md:px-8 lg:px-12">
      <header className="flex flex-col gap-5 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.26em] text-muted-foreground">Doll Invasion 2026</p>
          <h1 className="mt-2 font-serif text-5xl tracking-tight md:text-6xl">Signups</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {signups.length === 0
              ? "No signups yet."
              : `${signups.length} ${signups.length === 1 ? "person has" : "people have"} asked for the drop link.`}
          </p>
        </div>
        <a href="/admin" className="text-[10px] uppercase tracking-[0.18em] underline underline-offset-4">
          Back to controls
        </a>
      </header>

      {signups.length > 0 && (
        <div className="flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative flex w-full items-center sm:max-w-xs">
            <Search aria-hidden className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
            <span className="sr-only">Search signups</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, email, handle"
              className="h-11 w-full border border-border bg-card pl-9 pr-3 text-base text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
            />
          </label>
          <button
            onClick={copyEmails}
            className="inline-flex h-11 items-center justify-center gap-2 border border-border px-4 text-[10px] uppercase tracking-[0.18em] hover:border-foreground"
          >
            {copied ? <Check aria-hidden className="h-4 w-4" /> : <Copy aria-hidden className="h-4 w-4" />}
            {copied ? "Copied" : `Copy ${filtered.length} email${filtered.length === 1 ? "" : "s"}`}
          </button>
        </div>
      )}

      {signups.length === 0 ? (
        <p className="border border-border bg-card px-5 py-14 text-center text-sm text-muted-foreground">
          Share the preview link and passphrase — signups will appear here the moment someone submits.
        </p>
      ) : filtered.length === 0 ? (
        <p className="border border-border bg-card px-5 py-14 text-center text-sm text-muted-foreground">
          Nothing matches “{query}”.
        </p>
      ) : (
        <ul className="grid gap-3 pb-12">
          {filtered.map((row) => {
            const name = [row.firstName, row.lastName].filter(Boolean).join(" ")
            const handle = row.instagram ? instagramHandle(row.instagram) : null
            return (
              <li key={row.id} className="border border-border bg-card p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h2 className="font-serif text-2xl">{name}</h2>
                  <time className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {formatWhen(row.createdAt)}
                  </time>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
                  <a href={`mailto:${row.email}`} className="underline underline-offset-4">
                    {row.email}
                  </a>
                  {handle && (
                    <a
                      href={`https://instagram.com/${handle}`}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-muted-foreground underline underline-offset-4"
                    >
                      @{handle}
                    </a>
                  )}
                  {!row.emailedAt && (
                    <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      Email not sent
                    </span>
                  )}
                </div>

                {row.message && (
                  <p className="mt-4 border-l border-border pl-4 text-sm leading-relaxed text-muted-foreground">
                    {row.message}
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
