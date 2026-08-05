import { del, put } from "@vercel/blob"
import convert from "heic-convert"
import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin"

export const runtime = "nodejs"
// HEIC decoding of full-resolution iPhone photos can take a few seconds.
export const maxDuration = 60

function isHeicUrl(url: string): boolean {
  const path = url.split("?")[0].toLowerCase()
  return path.endsWith(".heic") || path.endsWith(".heif")
}

// Converts an already-uploaded HEIC/HEIF Blob to a browser-displayable JPEG.
// The browser uploads the original iPhone photo straight to Blob (no size
// limit), then calls this route with the resulting URL. We download it,
// transcode server-side, store the JPEG, delete the original, and return the
// new URL. Non-HEIC URLs pass through untouched.
export async function POST(request: NextRequest): Promise<NextResponse> {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let url: string
  try {
    ;({ url } = (await request.json()) as { url: string })
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "Missing url" }, { status: 400 })
  }

  if (!isHeicUrl(url)) {
    // Nothing to do — already a web-friendly format.
    return NextResponse.json({ url })
  }

  try {
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`Could not fetch uploaded file (${res.status})`)
    }
    const inputBuffer = Buffer.from(await res.arrayBuffer())
    const outputBuffer = await convert({ buffer: inputBuffer, format: "JPEG", quality: 0.92 })

    const newName =
      url.split("/").pop()?.split("?")[0].replace(/\.(heic|heif)$/i, ".jpg") ?? `artwork-${Date.now()}.jpg`
    const blob = await put(newName, Buffer.from(outputBuffer), {
      access: "public",
      addRandomSuffix: true,
      contentType: "image/jpeg",
    })

    // Remove the original HEIC so it does not linger in storage.
    await del(url).catch(() => {})

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error("[v0] HEIC conversion error:", error)
    return NextResponse.json({ error: "Could not convert image. Please try again." }, { status: 500 })
  }
}
