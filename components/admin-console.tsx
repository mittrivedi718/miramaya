"use client"

import { useMemo, useState, useTransition } from "react"
import { Check, Copy, Link2, RotateCcw } from "lucide-react"
import { createShareLink, revokeShareLink, updateSequence } from "@/app/admin/actions"
import { AdminGuidebook } from "@/components/admin-guidebook"
import { SYMBOLS } from "@/lib/portal-symbols"
import type { World } from "@/lib/worlds"

const symbolEntries = Object.entries(SYMBOLS)

type LinkRecord = { id: string; handle: string; label: string | null; expiresAt: Date | null; revokedAt: Date | null; useCount: number; createdAt: Date }

export function AdminConsole({ worlds, sequences, links, guidebookText }: { worlds: World[]; sequences: Record<string, string[]>; links: LinkRecord[]; guidebookText: string }) {
  const [active, setActive] = useState(worlds[0].handle)
  const [draft, setDraft] = useState<Record<string, string[]>>(sequences)
  const [label, setLabel] = useState("")
  const [days, setDays] = useState("30")
  const [freshUrl, setFreshUrl] = useState("")
  const [copied, setCopied] = useState(false)
  const [pending, startTransition] = useTransition()
  const world = worlds.find((item) => item.handle === active)!
  const activeLinks = useMemo(() => links.filter((link) => link.handle === active), [links, active])

  function choose(symbolId: string) {
    const current = draft[active] ?? []
    setDraft({ ...draft, [active]: current.includes(symbolId) ? current.filter((id) => id !== symbolId) : [...current, symbolId].slice(-3) })
  }

  return (
    <div className="grid min-h-svh bg-background text-foreground lg:grid-cols-[17rem_1fr]">
      <aside className="border-b border-border p-5 lg:border-b-0 lg:border-r lg:p-7">
        <p className="text-[10px] uppercase tracking-[0.26em] text-muted-foreground">miramaya controls</p>
        <h1 className="mt-3 font-serif text-4xl">Passages</h1>
        <nav className="mt-8 grid grid-cols-2 gap-2 lg:grid-cols-1" aria-label="Worlds">
          {worlds.map((item) => <button key={item.handle} onClick={() => setActive(item.handle)} className={`border px-4 py-3 text-left font-serif text-lg ${active === item.handle ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground"}`}>{item.name}</button>)}
        </nav>
        <form action="/" className="mt-8"><button formAction={async () => { const { signOutAdmin } = await import("@/app/admin/actions"); await signOutAdmin() }} className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground underline underline-offset-4">Sign out</button></form>
      </aside>

      <main className="p-5 md:p-8 lg:p-12">
        <header className="flex flex-col justify-between gap-4 border-b border-border pb-8 md:flex-row md:items-end">
          <div><p className="text-[10px] uppercase tracking-[0.26em] text-muted-foreground">{world.tagline}</p><h2 className="mt-2 font-serif text-6xl tracking-tight">{world.name}</h2></div>
          <a href={`/store/${world.handle}`} className="text-[10px] uppercase tracking-[0.18em] underline underline-offset-4">Preview store</a>
        </header>

        <div className="py-10">
          <AdminGuidebook text={guidebookText} />
        </div>

        <div className="grid gap-12 pb-10 xl:grid-cols-2">
          <section>
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Secret touch sequence</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Choose three different symbols. Their order is the order they appear below and the sentence you share.</p>
            <div className="mt-6 flex min-h-16 items-center gap-2 border-y border-border py-3">
              {(draft[active] ?? []).map((id, index) => <span key={id} className="border border-border bg-card px-3 py-2 text-xs"><span className="mr-2 text-muted-foreground">{index + 1}</span>{SYMBOLS[id as keyof typeof SYMBOLS]?.label}</span>)}
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {symbolEntries.map(([id, symbol]) => <button key={id} onClick={() => choose(id)} className={`min-h-16 border px-2 py-3 text-[10px] uppercase tracking-[0.08em] ${draft[active]?.includes(id) ? "border-foreground bg-foreground text-background" : "border-border bg-card"}`}><span className="mx-auto mb-2 block size-3 rounded-full" style={{ background: symbol.color }} />{symbol.label}</button>)}
            </div>
            <button disabled={pending || draft[active]?.length !== 3} onClick={() => startTransition(() => updateSequence(active, draft[active]))} className="mt-5 flex h-11 items-center gap-2 bg-foreground px-5 text-[10px] uppercase tracking-[0.18em] text-background disabled:opacity-40"><RotateCcw className="size-3" />Save sequence</button>
          </section>

          <section>
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Create a share door</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">A private URL bypasses the touch sequence. It can expire and can be revoked here.</p>
            <div className="mt-6 flex flex-col gap-3">
              <input value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Recipient or occasion" className="h-11 border border-border bg-card px-4 text-sm outline-none focus:border-foreground" />
              <select value={days} onChange={(event) => setDays(event.target.value)} className="h-11 border border-border bg-card px-4 text-sm"><option value="1">Expires in 1 day</option><option value="7">Expires in 7 days</option><option value="30">Expires in 30 days</option><option value="">Never expires</option></select>
              <button disabled={pending} onClick={() => startTransition(async () => setFreshUrl(await createShareLink(active, label, days ? Number(days) : null)))} className="flex h-11 items-center justify-center gap-2 bg-foreground px-5 text-[10px] uppercase tracking-[0.18em] text-background"><Link2 className="size-3" />Create private URL</button>
            </div>
            {freshUrl && <div className="mt-4 border border-accent bg-card p-4"><p className="break-all font-mono text-xs">{freshUrl}</p><button onClick={async () => { await navigator.clipboard.writeText(freshUrl); setCopied(true) }} className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] underline underline-offset-4">{copied ? <Check className="size-3" /> : <Copy className="size-3" />}{copied ? "Copied" : "Copy URL"}</button></div>}

            <div className="mt-8 flex flex-col gap-2">
              {activeLinks.length === 0 && <p className="border border-border p-4 text-sm text-muted-foreground">No share doors yet.</p>}
              {activeLinks.map((link) => <article key={link.id} className="flex items-center justify-between gap-4 border border-border bg-card p-4"><div><p className="text-sm">{link.label || "Untitled door"}</p><p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{link.useCount} uses · {link.revokedAt ? "revoked" : link.expiresAt ? `expires ${new Date(link.expiresAt).toLocaleDateString()}` : "no expiry"}</p></div>{!link.revokedAt && <button onClick={() => startTransition(() => revokeShareLink(link.id))} className="text-[10px] uppercase tracking-[0.14em] underline underline-offset-4">Revoke</button>}</article>)}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
