import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import { Cormorant_Garamond, Geist } from "next/font/google"
import { AdminStar } from "@/components/admin-star"
import "./globals.css"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  title: { default: "Miramaya", template: "%s · Miramaya" },
  description: "Five portals. Five collections. Objects from mira, maya, gaia, mirabelle, and marked by Mit.",
  icons: {
    icon: [
      { url: "/brand/favicon-cream.png", media: "(prefers-color-scheme: dark)" },
      { url: "/brand/favicon-ink.png", media: "(prefers-color-scheme: light)" },
    ],
    apple: "/brand/favicon-cream.png",
  },
  generator: "v0.app",
}

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#080908",
  width: "device-width",
  initialScale: 1,
  userScalable: true,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`bg-background ${geist.variable} ${cormorant.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <AdminStar />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
