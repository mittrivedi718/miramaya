import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { isRoomId, ROOM_MAP } from "@/lib/mea/rooms"
import { RoomView } from "@/components/mea/room-view"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ room: string }>
}): Promise<Metadata> {
  const { room } = await params
  const name = isRoomId(room) ? ROOM_MAP[room].name : "Room"
  return { title: `${name} · MEA` }
}

export default async function RoomPage({ params }: { params: Promise<{ room: string }> }) {
  const { room } = await params
  if (!isRoomId(room)) notFound()
  return <RoomView room={room} />
}
