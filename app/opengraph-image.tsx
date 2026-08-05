import { ImageResponse } from "next/og"
import { readFileSync } from "node:fs"
import { join } from "node:path"

export const runtime = "nodejs"
export const alt = "From Here Studio — Art rooted in place. The artwork of Luna, made in Seattle."
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpengraphImage() {
  const logo = readFileSync(join(process.cwd(), "public/from-here-studio-logo.png"))
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 56,
        backgroundColor: "#f4efe4",
        padding: 64,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logoSrc} width={500} height={500} alt="" style={{ objectFit: "contain" }} />
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 520 }}>
        <div style={{ fontSize: 30, letterSpacing: 8, textTransform: "uppercase", color: "#726f5f" }}>
          From Here Studio
        </div>
        <div style={{ fontSize: 74, lineHeight: 1.05, color: "#2f3a2e", marginTop: 18, fontWeight: 600 }}>
          Art rooted in place
        </div>
        <div style={{ fontSize: 30, lineHeight: 1.4, color: "#4a5347", marginTop: 26 }}>
          The artwork of Luna — paintings, photography, and moving pieces made in Seattle.
        </div>
      </div>
    </div>,
    { ...size },
  )
}
