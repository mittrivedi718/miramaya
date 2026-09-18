import { bigint, boolean, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

export const portalSequences = pgTable("portal_sequences", {
  handle: text("handle").primaryKey(),
  symbolIds: jsonb("symbol_ids").$type<string[]>().notNull(),
  enabled: boolean("enabled").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

export const shareLinks = pgTable("share_links", {
  id: uuid("id").primaryKey().defaultRandom(),
  tokenHash: text("token_hash").notNull().unique(),
  handle: text("handle").notNull(),
  label: text("label"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  useCount: integer("use_count").notNull().default(0),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
})

export const consultations = pgTable("consultations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  placement: text("placement"),
  size: text("size"),
  idea: text("idea").notNull(),
  budget: text("budget"),
  availability: text("availability"),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

/** Lead capture from the private "Doll Invasion 2026" preview page. */
export const dollInvasionContacts = pgTable("doll_invasion_contacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name"),
  email: text("email").notNull(),
  instagram: text("instagram"),
  message: text("message"),
  source: text("source").notNull().default("Doll Invasion 2026"),
  emailedAt: timestamp("emailed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const shareLinkEvents = pgTable("share_link_events", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  shareLinkId: uuid("share_link_id").notNull(),
  eventType: text("event_type").notNull(),
  requestFingerprint: text("request_fingerprint"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

/**
 * Private, one-time full-site view links. Distinct from `shareLinks` (which grant
 * a single world's portal): a claimed link opens the whole site through the gate
 * for a fixed window. Status is DERIVED from these timestamps, never stored, so it
 * can never drift and needs no cron. See lib/private-view/status.ts.
 */
export const privateShareLinks = pgTable("private_share_links", {
  id: uuid("id").primaryKey().defaultRandom(),
  tokenHash: text("token_hash").notNull().unique(),
  // AES-256-GCM of the raw token, so an UNOPENED link can be re-copied in admin.
  // Nulled the moment it is claimed or revoked — after that the token is useless.
  tokenCiphertext: text("token_ciphertext"),
  label: text("label"),
  durationSeconds: integer("duration_seconds").notNull().default(1800),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  firstViewedAt: timestamp("first_viewed_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
})

export const privateViewSessions = pgTable("private_view_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  // UNIQUE: a link can never have two sessions, even under a race.
  linkId: uuid("link_id")
    .notNull()
    .unique()
    .references(() => privateShareLinks.id, { onDelete: "cascade" }),
  sessionTokenHash: text("session_token_hash").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
})
