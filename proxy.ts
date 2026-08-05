import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { GATE_COOKIE, gateToken, isGateEnabled } from "@/lib/site-gate"

// Paths that must always be reachable, even when the view gate is locked:
// - /enter          the unlock page itself
// - /api/auth       owner login (Better Auth) must keep working
const ALWAYS_ALLOW = ["/enter", "/api/auth"]

export async function proxy(request: NextRequest) {
  // If no view password has been set yet, the site stays open. This prevents
  // ever locking the owner out during setup. The gate turns on automatically
  // the moment SITE_GATE_PASSWORD is configured.
  if (!isGateEnabled()) return NextResponse.next()

  const { pathname } = request.nextUrl

  // Allow the unlock page, auth endpoints, and any static file (has a dot,
  // e.g. .svg / .png / .ico) so the unlock screen can render its assets.
  if (ALWAYS_ALLOW.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next()
  }
  if (pathname.includes(".")) return NextResponse.next()

  const cookie = request.cookies.get(GATE_COOKIE)?.value
  const expected = await gateToken()
  if (cookie && cookie === expected) return NextResponse.next()

  const url = request.nextUrl.clone()
  url.pathname = "/enter"
  url.search = ""
  url.searchParams.set("from", pathname)
  return NextResponse.redirect(url)
}

export const config = {
  // Run on everything except Next's internal asset routes.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
