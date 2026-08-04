import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin"

export const runtime = "nodejs"

// Client-side upload flow: the browser uploads the file DIRECTLY to Vercel
// Blob (bypassing the ~4.5MB serverless request-body limit, which previously
// broke uploads of real photos and videos). This route only issues a
// short-lived, scoped upload token after verifying the artist is signed in.
export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // Only a signed-in admin may obtain an upload token.
        const admin = await requireAdmin()
        if (!admin) {
          throw new Error("Unauthorized")
        }
        return {
          // image/* covers HEIC, but list the iPhone types explicitly so an
          // upload is never rejected over MIME detection quirks on iOS.
          allowedContentTypes: ["image/*", "image/heic", "image/heif", "video/*"],
          addRandomSuffix: true,
          maximumSizeInBytes: 512 * 1024 * 1024, // 512MB ceiling for video clips
        }
      },
      // Metadata is written by a server action after the client receives the
      // URL, so nothing is needed here.
      onUploadCompleted: async () => {},
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    console.error("[v0] Upload token error:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}
