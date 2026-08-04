import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { ArtistLoginForm } from "@/components/artist-login-form"
import { ensureAdminAccount, requireAdmin } from "@/lib/admin"

export const dynamic = "force-dynamic"

export const metadata: Metadata = { title: "Artist Login" }

export default async function PortalLoginPage() {
  const admin = await requireAdmin()
  if (admin) redirect("/portal")
  const email = await ensureAdminAccount()

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-5 py-10 text-foreground">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-8 md:p-10">
        <img
          src="/from-here-studio-logo.png"
          alt="From Here Studio"
          className="mx-auto h-44 w-44 rounded-2xl border border-border/70 object-cover"
        />
        <p className="mt-2 text-center text-[11px] uppercase tracking-[0.28em] text-muted-foreground">From Here Studio</p>
        <h1 className="mt-3 text-center font-serif text-4xl font-semibold leading-none tracking-tight">Artist Studio</h1>
        <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground">
          Welcome back, Jackie. Sign in to add artwork, update Luna&apos;s photos, and manage upcoming shows.
        </p>
        <ArtistLoginForm email={email} />
        <a
          href="/"
          className="mt-7 block text-center text-[11px] uppercase tracking-[0.18em] text-muted-foreground underline underline-offset-4"
        >
          Back to the gallery
        </a>
      </section>
    </main>
  )
}
