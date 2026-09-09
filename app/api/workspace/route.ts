import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin"
import { applyCommand } from "@/lib/mea/reducer"
import { postBody } from "@/lib/mea/schema"
import { getStore } from "@/lib/mea/store"

// The owner is derived server-side from the authenticated admin session.
// A client can never assert who it is.
async function owner(): Promise<string | null> {
  const admin = await requireAdmin()
  return admin?.id ?? null
}

export async function GET() {
  const id = await owner()
  if (!id) return NextResponse.json({ error: "Not signed in." }, { status: 401 })
  const snapshot = await getStore().load(id)
  return NextResponse.json(snapshot)
}

export async function POST(request: Request) {
  const id = await owner()
  if (!id) return NextResponse.json({ error: "Not signed in." }, { status: 401 })

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
