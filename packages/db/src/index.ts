// packages/db/src/index.ts
// TiDB Serverless HTTP Driver — Vercel Edge Runtime compatible (no TCP)
import { connect } from "@tidbcloud/serverless";
import { drizzle } from "drizzle-orm/tidb-serverless";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("[packages/db] DATABASE_URL is not set. Check .env.local");
}

// HTTP connection — works on both Docker (via TiDB proxy) and TiDB Serverless Cloud
// Local: mysql://root:root@127.0.0.1:4000/s2s_finance (TiDB Serverless local CLI or tcp2http proxy)
// Cloud: mysql://username:password@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/s2s_finance
const connection = connect({ url: process.env.DATABASE_URL });

export const db = drizzle(connection, {
  schema,
  logger: process.env.NODE_ENV === "development",
});

export * from "./schema";
export type { Transaction, NewTransaction } from "./schema";
export type { User, NewUser } from "./schema";
export type { Goal, NewGoal } from "./schema";
export type { BillPayment, NewBillPayment } from "./schema";
export type { CashWallet } from "./schema";
