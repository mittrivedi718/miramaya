// Per-album password lock (a second lock, inside a world).
//
// Same shape as the site-wide view gate: the password is never stored in the
// browser. We set a signed HMAC token derived from a server secret, so a visitor
// cannot forge access. Each album gets its own cookie keyed by slug.

import { cookies } from "next/headers"
import { safeEqual } from "@/lib/site-gate"

const COOKIE_PREFIX = "mm_album_"
const ALBUM_MESSAGE = "miramaya-album-access-v1"

// The accepted passwords per album slug. Kept server-side only.
const ALBUM_PASSWORDS: Record<string, string[]> = {
  helix: ["helixunwind"],
}

export function acceptedAlbumPasswords(slug: string): string[] {
  return ALBUM_PASSWORDS[slug] ?? []
}

function base64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

async function albumToken(slug: string): Promise<string> {
  const secret = process.env.BETTER_AUTH_SECRET ?? "miramaya-album-fallback-secret"
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${ALBUM_MESSAGE}:${slug}`))
  return base64Url(signature)
}

export async function hasAlbumAccess(slug: string): Promise<boolean> {
  const jar = await cookies()
  const token = jar.get(`${COOKIE_PREFIX}${slug}`)?.value
  if (!token) return false
  return safeEqual(token, await albumToken(slug))
}

export async function grantAlbumAccess(slug: string): Promise<void> {
  const jar = await cookies()
  jar.set(`${COOKIE_PREFIX}${slug}`, await albumToken(slug), {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  })
}
