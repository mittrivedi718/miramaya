import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import { Cormorant_Garamond, Geist } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400", "500", "600", "700"],
})

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000"

const title = "From Here Studio · Art rooted in place"
const description =
  "From Here Studio — the artwork of Luna. Paintings, photographs, and moving pieces made in Seattle. Find her work at craft and trade shows around the city."

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: title, template: "%s · From Here Studio" },
  description,
  keywords: [
    "From Here Studio",
    "Luna",
    "Seattle artist",
    "art gallery",
    "craft shows",
    "trade shows",
    "handmade art",
    "paintings",
    "photography",
  ],
  applicationName: "From Here Studio",
  authors: [{ name: "From Here Studio" }],
  creator: "From Here Studio",
  icons: { icon: "/icon.svg", apple: "/apple-icon" },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "From Here Studio",
    title,
    description,
    url: siteUrl,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  generator: "v0.app",
}

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f4efe4",
  width: "device-width",
  initialScale: 1,
  userScalable: true,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`bg-background ${geist.variable} ${cormorant.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Toaster position="top-center" />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
