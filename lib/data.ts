import { asc, desc } from "drizzle-orm"
import { db } from "@/lib/db"
import { aboutPhotos, artworks, events } from "@/lib/db/schema"

export type Artwork = typeof artworks.$inferSelect
export type AboutPhoto = typeof aboutPhotos.$inferSelect
export type ShowEvent = typeof events.$inferSelect

export async function getArtworks(): Promise<Artwork[]> {
  return db.select().from(artworks).orderBy(asc(artworks.sortOrder), desc(artworks.createdAt))
}

export async function getAboutPhotos(): Promise<AboutPhoto[]> {
  return db.select().from(aboutPhotos).orderBy(asc(aboutPhotos.sortOrder), desc(aboutPhotos.createdAt))
}

export async function getEvents(): Promise<ShowEvent[]> {
  return db.select().from(events).orderBy(asc(events.startDate))
}

// Upcoming events only (end date, or start date, is today or later).
export async function getUpcomingEvents(): Promise<ShowEvent[]> {
  const all = await getEvents()
  const today = new Date().toISOString().slice(0, 10)
  return all.filter((e) => (e.endDate ?? e.startDate) >= today)
}
