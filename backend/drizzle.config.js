import "dotenv/config";
import { defineConfig } from "drizzle-kit";

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

export default defineConfig({
  out: "./drizzle",
  schema: "./models/index.js",
  dialect: "postgresql",
  dbCredentials: getDatabaseConfig(),
});
