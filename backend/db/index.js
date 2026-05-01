import "dotenv/config";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

const missingDatabaseConnection = () => {
  throw new Error("POSTGRES_URL is missing");
};

const getDatabaseConfig = () => {
  const connectionUrl = new URL(process.env.POSTGRES_URL);

  return {
    host: connectionUrl.hostname,
    port: connectionUrl.port ? Number(connectionUrl.port) : 5432,
    database: connectionUrl.pathname.slice(1),
    user: decodeURIComponent(connectionUrl.username),
    password: decodeURIComponent(connectionUrl.password),
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  };
};

const createDatabaseClient = () => {
  const pool = new pg.Pool(getDatabaseConfig());

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
