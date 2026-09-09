import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { isRoomId, ROOM_MAP } from "@/lib/mea/rooms"
import { GardenView } from "@/components/mea/garden-view"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ room: string }>
}): Promise<Metadata> {
  const { room } = await params
  const name = isRoomId(room) ? ROOM_MAP[room].name : "Room"
  return { title: `Garden · ${name} · MEA` }
}

export default async function GardenPage({ params }: { params: Promise<{ room: string }> }) {
  const { room } = await params
  if (!isRoomId(room)) notFound()
  return <GardenView room={room} />
}
