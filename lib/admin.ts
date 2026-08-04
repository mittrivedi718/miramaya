import { and, eq, ne } from "drizzle-orm"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { user } from "@/lib/db/schema"

// Jackie's studio login. The email is not sensitive (it is shown on the login
// screen), so it lives here as the single source of truth. The password is the
// agreed placeholder and can be changed here anytime.
export const ARTIST_EMAIL = "jackie@guth.art"
export const ARTIST_NAME = "Jackie"
const ARTIST_PASSWORD = "bernie"

export async function ensureAdminAccount() {
  // Remove any leftover accounts that are not the studio owner so a stale
  // login can never linger. Cascades clean up their sessions/accounts.
  await db.delete(user).where(ne(user.email, ARTIST_EMAIL))

  const [existing] = await db.select({ id: user.id }).from(user).where(eq(user.email, ARTIST_EMAIL)).limit(1)
  if (!existing) {
    try {
      await auth.api.signUpEmail({ body: { email: ARTIST_EMAIL, password: ARTIST_PASSWORD, name: ARTIST_NAME } })
    } catch (error) {
      console.error("[v0] Failed to create artist account:", error)
    }
  }
  return ARTIST_EMAIL
}

export async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return null

  if (session.user.email.toLowerCase() !== ARTIST_EMAIL) return null

  const [admin] = await db
    .select({ id: user.id, email: user.email, name: user.name })
    .from(user)
    .where(and(eq(user.id, session.user.id), eq(user.email, ARTIST_EMAIL)))
    .limit(1)

  return admin ?? null
}
