// One versioned workspace document per owner, behind a small interface so the
// backing store can be swapped without touching the routes. Postgres is used when
// the project's database is configured; otherwise an in-memory map keeps the
// preview alive. Writes are compare-and-swap on `revision`.

import { makeSeedDocument } from "./seed"
import { workspaceDocument, type WorkspaceDocument } from "./schema"

// Imported lazily so a preview without a database never constructs the pool
// (which throws when PG env vars are absent) and falls back to memory cleanly.
async function getPool() {
  const mod = await import("@/lib/db")
  return mod.pool
}

export type Snapshot = { revision: number; document: WorkspaceDocument }

export type SaveResult =
  | { ok: true; snapshot: Snapshot }
  | { ok: false; conflict: true; snapshot: Snapshot }

export interface WorkspaceStore {
  load(owner: string): Promise<Snapshot>
  /** Save only if `expectedRevision` still matches; otherwise report a conflict. */
  save(owner: string, expectedRevision: number, next: WorkspaceDocument): Promise<SaveResult>
}

function normalize(raw: unknown): WorkspaceDocument {
  // Parse through Zod so an older or partial stored shape is repaired on read.
  const parsed = workspaceDocument.safeParse(raw)
  return parsed.success ? parsed.data : makeSeedDocument()
}

// ── Postgres implementation ────────────────────────────────────────────────
let ensured: Promise<void> | null = null
async function ensureTable(): Promise<void> {
  ensured ??= (async () => {
    const pool = await getPool()
    await pool.query(
      `CREATE TABLE IF NOT EXISTS mea_workspaces (
        owner text PRIMARY KEY,
        revision integer NOT NULL DEFAULT 0,
        document jsonb NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )`,
    )
  })()
  return ensured
}

class PostgresStore implements WorkspaceStore {
  async load(owner: string): Promise<Snapshot> {
    await ensureTable()
    const pool = await getPool()
    const { rows } = await pool.query<{ revision: number; document: unknown }>(
      `SELECT revision, document FROM mea_workspaces WHERE owner = $1`,
      [owner],
    )
    if (rows.length) {
      return { revision: rows[0].revision, document: normalize(rows[0].document) }
    }
    // First visit: seed and persist at revision 0.
    const document = makeSeedDocument()
    await pool.query(
      `INSERT INTO mea_workspaces (owner, revision, document) VALUES ($1, 0, $2)
       ON CONFLICT (owner) DO NOTHING`,
      [owner, document],
    )
    return { revision: 0, document }
  }

  async save(owner: string, expectedRevision: number, next: WorkspaceDocument): Promise<SaveResult> {
    await ensureTable()
    const pool = await getPool()
    const nextRevision = expectedRevision + 1
    const { rowCount } = await pool.query(
      `UPDATE mea_workspaces SET revision = $3, document = $4, updated_at = now()
       WHERE owner = $1 AND revision = $2`,
      [owner, expectedRevision, nextRevision, next],
    )
    if (rowCount === 1) {
      return { ok: true, snapshot: { revision: nextRevision, document: next } }
    }
    // CAS failed — return the current state so the UI can reconcile without overwriting.
    const current = await this.load(owner)
    return { ok: false, conflict: true, snapshot: current }
  }
}

// ── In-memory fallback (no database configured) ─────────────────────────────
class MemoryStore implements WorkspaceStore {
  private map = new Map<string, Snapshot>()
  async load(owner: string): Promise<Snapshot> {
    let snap = this.map.get(owner)
    if (!snap) {
      snap = { revision: 0, document: makeSeedDocument() }
      this.map.set(owner, snap)
    }
    return { revision: snap.revision, document: snap.document }
  }
  async save(owner: string, expectedRevision: number, next: WorkspaceDocument): Promise<SaveResult> {
    const snap = await this.load(owner)
    if (snap.revision !== expectedRevision) return { ok: false, conflict: true, snapshot: snap }
    const updated = { revision: expectedRevision + 1, document: next }
    this.map.set(owner, updated)
    return { ok: true, snapshot: updated }
  }
}

let singleton: WorkspaceStore | null = null
export function getStore(): WorkspaceStore {
  if (singleton) return singleton
  singleton = process.env.PGHOST ? new PostgresStore() : new MemoryStore()
  return singleton
}

export function loadWorkspace(owner: string): Promise<Snapshot> {
  return getStore().load(owner)
}

export function saveWorkspace(
  owner: string,
  expectedRevision: number,
  next: WorkspaceDocument,
): Promise<SaveResult> {
  return getStore().save(owner, expectedRevision, next)
}
