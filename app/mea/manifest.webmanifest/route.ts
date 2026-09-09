import { NextResponse } from "next/server"

// MEA's own installable manifest, separate from the site-wide manifest so the
// home-screen app opens straight into MEA in standalone mode.
export function GET() {
  return NextResponse.json({
    name: "MEA",
    short_name: "MEA",
    description: "Mit's Executive Assistant.",
    id: "/mea",
    start_url: "/mea",
    scope: "/mea",
    display: "standalone",
    background_color: "#14181F",
    theme_color: "#14181F",
    icons: [
      { src: "/mea/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/mea/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  })
}
