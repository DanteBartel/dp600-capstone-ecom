import { drizzle } from "drizzle-orm/neon-serverless";
import type { NeonDatabase } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "./schema";

type AppDb = NeonDatabase<typeof schema>;

let pool: Pool | undefined;
let realDb: AppDb | undefined;

function getDb(): AppDb {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  if (!realDb) {
    pool = new Pool({ connectionString });
    realDb = drizzle(pool, { schema });
  }
  return realDb;
}

/** Lazy singleton — avoids failing Next.js build when DATABASE_URL is absent at compile time. */
export const db = new Proxy({} as AppDb, {
  get(_target, prop, receiver) {
    const d = getDb();
    const value = Reflect.get(d, prop, receiver);
    if (typeof value === "function") {
      return value.bind(d);
    }
    return value;
  },
});
