import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";

import { schema } from "@/db/schema";

export type AppDb = DrizzleD1Database<typeof schema>;

export const createDb = (database: D1Database) => {
  return drizzle(database, { schema });
};

export const newId = () => crypto.randomUUID();
