import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL is missing");
}
export const db = drizzle(process.env.POSTGRES_URL);
