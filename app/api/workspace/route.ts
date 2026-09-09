import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { applyCommand } from "@/lib/mea/reducer"
import { postBody } from "@/lib/mea/schema"
import { getStore } from "@/lib/mea/store"
import { MEA_OWNER_ID } from "@/lib/mea/owner"
import { GATE_COOKIE, gateToken, isGateEnabled, safeEqual } from "@/lib/site-gate"

// MEA is single-user and sits behind the site-wide view gate (proxy.ts). We
// re-check that gate here as defense in depth, so a direct API call without the
// access cookie fails closed. The owner is a fixed server-side constant — a
// client can never assert who it is.
async function allowed(): Promise<boolean> {
  if (!isGateEnabled()) return true // gate not configured yet → the site is open
  const cookie = (await cookies()).get(GATE_COOKIE)?.value
  return Boolean(cookie) && safeEqual(cookie as string, await gateToken())
}

export async function GET() {
  if (!(await allowed())) return NextResponse.json({ error: "Locked." }, { status: 401 })
  const snapshot = await getStore().load(MEA_OWNER_ID)
  return NextResponse.json(snapshot)
}

export async function POST(request: Request) {
  if (!(await allowed())) return NextResponse.json({ error: "Locked." }, { status: 401 })
  const id = MEA_OWNER_ID

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 })
  }

  const parsed = postBody.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: "That command didn't validate.", issues: parsed.error.issues }, { status: 400 })
  }

  const store = getStore()
  const current = await store.load(id)

  // Compare-and-swap on revision: a stale client is told the truth, not overwritten.
  if (parsed.data.revision !== current.revision) {
    return NextResponse.json(
      { error: "Your view was out of date. Here is the current state.", conflict: true, ...current },
      { status: 409 },
    )
  }

  const result = applyCommand(current.document, parsed.data.command)
  if (!result.ok) {
    return NextResponse.json({ error: result.error, missing: result.missing }, { status: 422 })
  }

  const saved = await store.save(id, current.revision, result.doc)
  if (!saved.ok) {
    return NextResponse.json(
      { error: "Someone else saved first. Here is the current state.", conflict: true, ...saved.snapshot },
      { status: 409 },
    )
  }

  return NextResponse.json({ ...saved.snapshot, note: result.note, resultId: result.resultId })
}
