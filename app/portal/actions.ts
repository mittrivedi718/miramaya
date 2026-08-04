"use server"

import { del } from "@vercel/blob"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/admin"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { aboutPhotos, artworks, events } from "@/lib/db/schema"

async function adminOrThrow() {
  const admin = await requireAdmin()
  if (!admin) throw new Error("Unauthorized")
  return admin
}

function revalidateAll() {
  revalidatePath("/")
  revalidatePath("/portal")
}

async function safeDeleteBlob(url: string | null | undefined) {
  if (!url) return
  try {
    await del(url)
  } catch (error) {
    console.error("[v0] Failed to delete blob:", error)
  }
}

/* ----------------------------- Artwork ----------------------------- */

export async function addArtwork(input: {
  title: string
  description: string
  mediaType: "image" | "video"
  url: string
  posterUrl?: string | null
}) {
  await adminOrThrow()
  const title = input.title.trim()
  if (!title) throw new Error("A title is required")
  if (!input.url) throw new Error("A file is required")

  await db.insert(artworks).values({
    title: title.slice(0, 160),
    description: input.description.trim().slice(0, 1000) || null,
    mediaType: input.mediaType,
    url: input.url,
    posterUrl: input.posterUrl || null,
  })
  revalidateAll()
}

export async function updateArtwork(id: string, input: { title: string; description: string }) {
  await adminOrThrow()
  const title = input.title.trim()
  if (!title) throw new Error("A title is required")
  await db
    .update(artworks)
    .set({ title: title.slice(0, 160), description: input.description.trim().slice(0, 1000) || null })
    .where(eq(artworks.id, id))
  revalidateAll()
}

export async function deleteArtwork(id: string) {
  await adminOrThrow()
  const [row] = await db.select().from(artworks).where(eq(artworks.id, id)).limit(1)
  if (row) {
    await safeDeleteBlob(row.url)
    await safeDeleteBlob(row.posterUrl)
    await db.delete(artworks).where(eq(artworks.id, id))
  }
  revalidateAll()
}

/* --------------------------- About photos --------------------------- */

export async function addAboutPhoto(input: { url: string; caption: string }) {
  await adminOrThrow()
  if (!input.url) throw new Error("A photo is required")
  await db.insert(aboutPhotos).values({
    url: input.url,
    caption: input.caption.trim().slice(0, 240) || null,
  })
  revalidateAll()
}

export async function deleteAboutPhoto(id: string) {
  await adminOrThrow()
  const [row] = await db.select().from(aboutPhotos).where(eq(aboutPhotos.id, id)).limit(1)
  if (row) {
    await safeDeleteBlob(row.url)
    await db.delete(aboutPhotos).where(eq(aboutPhotos.id, id))
  }
  revalidateAll()
}

/* ------------------------------ Events ------------------------------ */

export async function saveEvent(input: {
  id?: string
  title: string
  venue: string
  location: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  url: string
  notes: string
}) {
  await adminOrThrow()
  const title = input.title.trim()
  if (!title) throw new Error("A show name is required")
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.startDate)) throw new Error("A valid start date is required")
  if (input.endDate && !/^\d{4}-\d{2}-\d{2}$/.test(input.endDate)) throw new Error("Invalid end date")

  const values = {
    title: title.slice(0, 160),
    venue: input.venue.trim().slice(0, 160) || null,
    location: input.location.trim().slice(0, 160) || null,
    startDate: input.startDate,
    endDate: input.endDate || null,
    startTime: input.startTime.trim().slice(0, 40) || null,
    endTime: input.endTime.trim().slice(0, 40) || null,
    url: input.url.trim().slice(0, 500) || null,
    notes: input.notes.trim().slice(0, 1000) || null,
  }

  if (input.id) {
    await db.update(events).set(values).where(eq(events.id, input.id))
  } else {
    await db.insert(events).values(values)
  }
  revalidateAll()
}

export async function deleteEvent(id: string) {
  await adminOrThrow()
  await db.delete(events).where(eq(events.id, id))
  revalidateAll()
}

/* ------------------------------ Auth ------------------------------- */

export async function signOutArtist() {
  await auth.api.signOut({ headers: await headers() })
  redirect("/")
}
