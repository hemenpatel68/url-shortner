import "dotenv/config";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

const missingDatabaseConnection = () => {
  throw new Error("POSTGRES_URL is missing");
};

const createDatabaseClient = () => {
  const pool = new pg.Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : undefined,
  });

  return drizzle(pool);
};

export const db = process.env.POSTGRES_URL
  ? createDatabaseClient()
  : new Proxy(
      {},
      {
        get: missingDatabaseConnection,
      },
    );
