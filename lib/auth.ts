import { betterAuth } from "better-auth"
import { pool } from "@/lib/db"

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL:
    process.env.BETTER_AUTH_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.V0_RUNTIME_URL),
  emailAndPassword: { enabled: true, autoSignIn: true, minPasswordLength: 4 },
  trustedOrigins: [
    "http://localhost:3000",
    // v0 / Vercel preview + production hosts (wildcards cover the rotating
    // sandbox preview domains like https://sb-xxxx.vercel.run).
    "https://*.vercel.run",
    "https://*.vercel.app",
    ...(process.env.V0_RUNTIME_URL ? [process.env.V0_RUNTIME_URL] : []),
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
    ...(process.env.VERCEL_PROJECT_PRODUCTION_URL ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`] : []),
  ],
  session: { expiresIn: 60 * 60 * 8, updateAge: 60 * 60 },
  ...(process.env.NODE_ENV === "development"
    ? { advanced: { defaultCookieAttributes: { sameSite: "none" as const, secure: true } } }
    : {}),
})
