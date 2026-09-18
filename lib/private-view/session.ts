// Node-only, database-authoritative viewer-session validation. Used by the Node
// heartbeat route and the read-only gateway page. The database clock (now()) makes
// every expiry decision — never the client or app clock.

import { and, eq, isNull, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import { privateShareLinks, privateViewSessions } from "@/lib/db/schema"
import { sha256Hex } from "./tokens"

export type ViewerSession =
  | { ok: true; expiresAt: Date; linkId: string }
  | { ok: false }

export async function validateViewerSession(sessionToken: string | undefined): Promise<ViewerSession> {
  if (!sessionToken || !/^[A-Za-z0-9_-]{43}$/.test(sessionToken)) return { ok: false }

  const hash = await sha256Hex(sessionToken)
  const [row] = await db
    .select({ expiresAt: privateViewSessions.expiresAt, linkId: privateViewSessions.linkId })
    .from(privateViewSessions)
    .innerJoin(privateShareLinks, eq(privateShareLinks.id, privateViewSessions.linkId))
    .where(
      and(
        eq(privateViewSessions.sessionTokenHash, hash),
        isNull(privateShareLinks.revokedAt),
        sql`${privateViewSessions.expiresAt} > now()`,
      ),
    )
    .limit(1)

  return row ? { ok: true, expiresAt: row.expiresAt, linkId: row.linkId } : { ok: false }
}
