"use server"

import { sql } from "drizzle-orm"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { buildViewerValue, VIEWER_COOKIE, VIEWER_EXP_COOKIE } from "@/lib/private-view/cookies"
import { generateToken, isWellFormedToken, sha256Hex } from "@/lib/private-view/tokens"

/**
 * Claim a private view link. Only ever runs on an intentional same-origin POST
 * (server actions enforce that), so preview crawlers hitting the GET never start
 * the timer.
 *
 * The claim is a SINGLE atomic statement: the UPDATE only matches an unopened,
 * un-revoked link, and Postgres row locking means that of two simultaneous claims
 * the loser's `first_viewed_at is null` predicate fails after the winner commits,
 * returning zero rows. The UNIQUE link_id on sessions is a second guard.
 */
export async function claimPrivateView(formData: FormData): Promise<void> {
  const token = String(formData.get("token") ?? "")
  if (!isWellFormedToken(token)) redirect(`/view/${encodeURIComponent(token)}`)

  const linkTokenHash = await sha256Hex(token)
  const sessionToken = generateToken()
  const sessionTokenHash = await sha256Hex(sessionToken)

  const result = await db.execute(sql`
    with claimed as (
      update private_share_links
         set first_viewed_at = now(),
             expires_at      = now() + make_interval(secs => duration_seconds),
             token_ciphertext = null
       where token_hash = ${linkTokenHash}
         and first_viewed_at is null
         and revoked_at is null
      returning id, expires_at
    )
    insert into private_view_sessions (link_id, session_token_hash, expires_at)
    select id, ${sessionTokenHash}, expires_at from claimed
    returning link_id, expires_at
  `)

  const rows = (result as unknown as { rows?: Array<{ expires_at: string | Date }> }).rows ?? []
  if (rows.length === 0) {
    // Already claimed (or revoked/expired between GET and POST) → let the GET page
    // render the correct Already Viewed / Ended screen.
    redirect(`/view/${token}`)
  }

  const expiresAt = new Date(rows[0].expires_at)
  const expiresAtMs = expiresAt.getTime()
  const value = await buildViewerValue(sessionToken, expiresAtMs)

  const jar = await cookies()
  jar.set(VIEWER_COOKIE, value, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  })
  jar.set(VIEWER_EXP_COOKIE, String(expiresAtMs), {
    httpOnly: false,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  })

  redirect("/")
}
