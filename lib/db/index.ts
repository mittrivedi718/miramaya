import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import { Signer } from "@aws-sdk/rds-signer"
import { awsCredentialsProvider } from "@vercel/functions/oidc"
import { attachDatabasePool } from "@vercel/functions"
import * as schema from "./schema"

// Amazon Aurora PostgreSQL on Vercel authenticates via IAM (OIDC federation),
// not a static password. The RDS Signer mints a short-lived auth token that is
// used as the connection password.
const signer = new Signer({
  credentials: awsCredentialsProvider({
    roleArn: process.env.AWS_ROLE_ARN!,
    clientConfig: { region: process.env.AWS_REGION },
  }),
  region: process.env.AWS_REGION!,
  hostname: process.env.PGHOST!,
  username: process.env.PGUSER || "postgres",
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
})

export const pool = new Pool({
  host: process.env.PGHOST,
  database: process.env.PGDATABASE || "postgres",
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
  user: process.env.PGUSER || "postgres",
  // The auth token can be cached by the driver for up to 15 minutes.
  password: () => signer.getAuthToken(),
  // IAM-authenticated connections require SSL/TLS.
  ssl: { rejectUnauthorized: false },
  max: 20,
})
attachDatabasePool(pool)

export const db = drizzle(pool, { schema })
