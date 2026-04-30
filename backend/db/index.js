import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";

const missingDatabaseConnection = () => {
  throw new Error("POSTGRES_URL is missing");
};

export const db = process.env.POSTGRES_URL
  ? drizzle(process.env.POSTGRES_URL)
  : new Proxy(
      {},
      {
        get: missingDatabaseConnection,
      },
    );
