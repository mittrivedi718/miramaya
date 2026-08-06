import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import { Cormorant_Garamond, Geist } from "next/font/google"
import { AdminStar } from "@/components/admin-star"
import { ThemeProvider } from "@/components/theme-provider"
import { WaterAmbience } from "@/components/water-ambience"
import "./globals.css"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  title: { default: "MiraMaya", template: "%s · MiraMaya" },
  description: "A gallery of mirrors. Each one a world with its own way of being entered — mira, maya, gaia, mia, and more.",
  icons: {
    icon: [
      { url: "/brand/favicon-cream.png", media: "(prefers-color-scheme: dark)" },
      { url: "/brand/favicon-ink.png", media: "(prefers-color-scheme: light)" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: { capable: true, title: "MiraMaya", statusBarStyle: "black-translucent" },
  generator: "v0.app",
}

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f1ea" },
    { media: "(prefers-color-scheme: dark)", color: "#080908" },
  ],
  width: "device-width",
  initialScale: 1,
  userScalable: true,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`bg-background ${geist.variable} ${cormorant.variable}`}
    >
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          {children}
          <WaterAmbience />
          <AdminStar />
        </ThemeProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
