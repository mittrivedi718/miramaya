import { ImageResponse } from "next/og"
import { readFileSync } from "node:fs"
import { join } from "node:path"

export const runtime = "nodejs"
export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
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
        backgroundColor: "#f4efe4",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logoSrc} width={180} height={180} alt="" style={{ objectFit: "cover" }} />
    </div>,
    { ...size },
  )
}
