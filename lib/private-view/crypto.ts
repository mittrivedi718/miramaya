// Node-only. AES-256-GCM used to store a recoverable copy of an UNOPENED link's
// raw token, so the admin can re-copy the URL after creation. The ciphertext is
// nulled the instant the link is claimed or revoked, so this is only ever readable
// for links that have never been opened.
//
// Key: LINK_ENCRYPTION_KEY (32 bytes, base64) if provided; otherwise derived from
// BETTER_AUTH_SECRET so the feature works without adding a new secret. Provide the
// dedicated key in production if you prefer an independent key.

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto"

function encryptionKey(): Buffer {
  const configured = process.env.LINK_ENCRYPTION_KEY?.trim()
  if (configured) {
    const raw = Buffer.from(configured, "base64")
    if (raw.length === 32) return raw
  }
  return createHash("sha256").update(process.env.BETTER_AUTH_SECRET ?? "").digest()
}

function toB64Url(buf: Buffer): string {
  return buf.toString("base64url")
}

export function encryptToken(raw: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv)
  const ciphertext = Buffer.concat([cipher.update(raw, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${toB64Url(iv)}.${toB64Url(tag)}.${toB64Url(ciphertext)}`
}

export function decryptToken(payload: string | null | undefined): string | null {
  if (!payload) return null
  try {
    const [ivRaw, tagRaw, ctRaw] = payload.split(".")
    if (!ivRaw || !tagRaw || !ctRaw) return null
    const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(ivRaw, "base64url"))
    decipher.setAuthTag(Buffer.from(tagRaw, "base64url"))
    const plaintext = Buffer.concat([decipher.update(Buffer.from(ctRaw, "base64url")), decipher.final()])
    return plaintext.toString("utf8")
  } catch {
    return null
  }
}
