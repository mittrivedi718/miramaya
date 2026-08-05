import { upload } from "@vercel/blob/client"

// iPhones save photos as HEIC/HEIF by default — Jackie's primary upload source.
// Browsers can't display HEIC, so those files must be transcoded to JPEG. We do
// this server-side (reliable for full-resolution photos) rather than in the
// browser, which is slow and memory-heavy on mobile Safari.
function isHeic(file: File): boolean {
  const name = file.name.toLowerCase()
  return (
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    name.endsWith(".heic") ||
    name.endsWith(".heif")
  )
}

// Uploads a file DIRECTLY from the browser to Vercel Blob using a scoped token
// issued by /api/upload. This bypasses the serverless function body-size limit,
// so full-resolution photos and videos upload reliably. HEIC/HEIF images are
// then transcoded to JPEG on the server so they render in the gallery.
// Returns the public URL.
export async function uploadFile(file: File): Promise<string> {
  try {
    const result = await upload(file.name, file, {
      access: "public",
      handleUploadUrl: "/api/upload",
      contentType: file.type || undefined,
      // Split large files into parallel parts for reliable video uploads.
      multipart: file.size > 15 * 1024 * 1024,
    })

    if (!isHeic(file)) {
      return result.url
    }

    // Ask the server to transcode the HEIC/HEIF we just uploaded into JPEG.
    const res = await fetch("/api/process-image", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url: result.url }),
    })
    if (!res.ok) {
      const { error } = (await res.json().catch(() => ({}))) as { error?: string }
      throw new Error(error || "Could not process the iPhone photo. Please try again.")
    }
    const { url } = (await res.json()) as { url: string }
    return url
  } catch (error) {
    throw new Error((error as Error)?.message || "Upload failed. Please try again.")
  }
}
