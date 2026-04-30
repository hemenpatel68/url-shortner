import "dotenv/config";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

const missingDatabaseConnection = () => {
  throw new Error("POSTGRES_URL is missing");
};

const getConnectionString = () => {
  const connectionUrl = new URL(process.env.POSTGRES_URL);

  connectionUrl.searchParams.delete("sslmode");
  connectionUrl.searchParams.delete("sslcert");
  connectionUrl.searchParams.delete("sslkey");
  connectionUrl.searchParams.delete("sslrootcert");

  return connectionUrl.toString();
};

const createDatabaseClient = () => {
  const pool = new pg.Pool({
    connectionString: getConnectionString(),
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
