"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"

export function AdminLoginForm({ email }: { email: string }) {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [pending, startTransition] = useTransition()

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    startTransition(async () => {
      const result = await authClient.signIn.email({ email, password })
      if (result.error) {
        setError("The mirror does not recognize that password.")
        return
      }
      router.push("/admin")
      router.refresh()
    })
  }

  return (
    <form onSubmit={submit} className="mt-10 flex flex-col gap-5">
      <label className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">App name</span>
        <input value="miramaya" disabled className="h-12 border border-border bg-muted px-4 text-sm text-muted-foreground" />
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Password</span>
        <input autoFocus required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 border border-border bg-background px-4 text-sm outline-none focus:border-foreground" />
      </label>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <button disabled={pending} type="submit" className="h-12 bg-foreground px-5 text-[10px] uppercase tracking-[0.2em] text-background disabled:opacity-50">{pending ? "Listening…" : "Enter the control room"}</button>
    </form>
  )
}
