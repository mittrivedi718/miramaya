import { redirect } from "next/navigation"
import { AdminLoginForm } from "@/components/admin-login-form"
import { ensureAdminAccount, requireAdmin } from "@/lib/admin"

export const dynamic = "force-dynamic"

export default async function AdminLoginPage() {
  const admin = await requireAdmin()
  if (admin) redirect("/admin")
  const email = await ensureAdminAccount()

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-5 text-foreground">
      <section className="w-full max-w-md border border-border bg-card p-7 md:p-10">
        <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">The white star</p>
        <h1 className="mt-4 font-serif text-5xl leading-none tracking-tight">miramaya</h1>
        <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">A quiet room for arranging passages, changing sequences, and sharing private doors.</p>
        <AdminLoginForm email={email} />
        <a href="/" className="mt-7 block text-center text-[10px] uppercase tracking-[0.18em] text-muted-foreground underline underline-offset-4">Return to the gallery</a>
      </section>
    </main>
  )
}
