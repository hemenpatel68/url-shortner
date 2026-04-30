import "dotenv/config";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

const missingDatabaseConnection = () => {
  throw new Error("POSTGRES_URL is missing");
};

const getConnectionString = () => {
  const connectionUrl = new URL(process.env.POSTGRES_URL);

  for (const key of [...connectionUrl.searchParams.keys()]) {
    if (key.toLowerCase().startsWith("ssl")) {
      connectionUrl.searchParams.delete(key);
    }
  }

  return connectionUrl.toString();
};

const createDatabaseClient = () => {
  const connectionString = getConnectionString();

  const pool = new pg.Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
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
