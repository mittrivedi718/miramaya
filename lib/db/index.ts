import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import { Signer } from "@aws-sdk/rds-signer"
import { awsCredentialsProvider } from "@vercel/functions/oidc"
import { attachDatabasePool } from "@vercel/functions"
import * as schema from "./schema"

function required(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

const region = required("AWS_REGION")
const host = required("PGHOST")
const port = Number(process.env.PGPORT) || 5432
const user = process.env.PGUSER || "postgres"

const signer = new Signer({
  credentials: awsCredentialsProvider({
    roleArn: required("AWS_ROLE_ARN"),
    clientConfig: { region },
  }),
  region,
  hostname: host,
  username: user,
  port,
})

export const pool = new Pool({
  host,
  database: process.env.PGDATABASE || "postgres",
  port,
  user,
  // The IAM auth token acts as the connection password (valid ~15 min).
  password: () => signer.getAuthToken(),
  ssl: { rejectUnauthorized: false },
  max: 20,
})
attachDatabasePool(pool)

export const db = drizzle(pool, { schema })
