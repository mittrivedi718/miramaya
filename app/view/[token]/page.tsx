import type { Metadata } from "next"
import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { privateShareLinks } from "@/lib/db/schema"
import { verifyViewerValue, VIEWER_COOKIE } from "@/lib/private-view/cookies"
import { validateViewerSession } from "@/lib/private-view/session"
import { deriveStatus } from "@/lib/private-view/status"
import { isWellFormedToken, sha256Hex } from "@/lib/private-view/tokens"
import { AlreadyViewedScreen, EndedScreen, ViewLabel, ViewScreen } from "../_components/view-screen"
import { claimPrivateView } from "./actions"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Private View · Meet Mit",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
  openGraph: { title: "Meet Mit — Private View", description: "A private view." },
  twitter: { card: "summary", title: "Meet Mit — Private View", description: "A private view." },
}

const IN_APP_BROWSER = /(Instagram|FBAN|FBAV|LinkedInApp|Snapchat)/i

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

export default async function ViewTokenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  // 1. Malformed → Ended (reveal nothing, no DB call).
  if (!isWellFormedToken(token)) return <EndedScreen />

  // 2. Look up by hash. SELECT only — a GET never writes.
  const tokenHash = await sha256Hex(token)
  const [link] = await db
    .select({
      id: privateShareLinks.id,
      durationSeconds: privateShareLinks.durationSeconds,
      firstViewedAt: privateShareLinks.firstViewedAt,
      expiresAt: privateShareLinks.expiresAt,
      revokedAt: privateShareLinks.revokedAt,
    })
    .from(privateShareLinks)
    .where(eq(privateShareLinks.tokenHash, tokenHash))
    .limit(1)

  // 3. Not found / revoked / expired → identical Ended screen (reveal nothing).
  if (!link) return <EndedScreen />
  const status = deriveStatus(link)
  if (status === "REVOKED" || status === "EXPIRED") return <EndedScreen />

  // 4. Claimed and ACTIVE: this browser's own session → into the site; otherwise
  //    it was opened elsewhere.
  if (status === "ACTIVE") {
    const jar = await cookies()
    const verified = await verifyViewerValue(jar.get(VIEWER_COOKIE)?.value)
    if (verified.ok) {
      const session = await validateViewerSession(verified.sessionToken)
      if (session.ok && session.linkId === link.id) redirect("/")
    }
    return <AlreadyViewedScreen />
  }

  // 5. UNOPENED → render the gateway. Plain form, works without client JS.
  const userAgent = (await headers()).get("user-agent") ?? ""
  const inAppBrowser = IN_APP_BROWSER.test(userAgent)

  return (
    <ViewScreen>
      <div className="flex flex-col items-center gap-3">
        <ViewLabel>Meet Mit</ViewLabel>
        <ViewLabel>Private View</ViewLabel>
      </div>

      <p className="font-mono text-4xl tabular-nums tracking-[0.1em] text-foreground">
        {formatDuration(link.durationSeconds)}
      </p>

      <p className="max-w-xs text-sm leading-relaxed text-muted-foreground text-pretty">
        This link provides temporary access to the private portfolio.
      </p>

      <form action={claimPrivateView} className="flex w-full flex-col items-center gap-4">
        <input type="hidden" name="token" value={token} />
        <button
          type="submit"
          className="flex min-h-[44px] w-full items-center justify-center gap-2 bg-primary px-5 py-4 text-[11px] uppercase tracking-[0.24em] text-primary-foreground transition-opacity hover:opacity-85"
        >
          Enter Private View <span aria-hidden="true">→</span>
        </button>
        {inAppBrowser && (
          <p className="text-[11px] leading-relaxed text-muted-foreground/80 text-pretty">
            For the best experience, open in Safari before entering.
          </p>
        )}
      </form>
    </ViewScreen>
  )
}
