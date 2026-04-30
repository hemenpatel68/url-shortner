import "dotenv/config";
import cors from "cors";
import express from "express";
import userRouter from "./routes/user.routes.js";
import urlRouter from "./routes/url.routes.js";
import { authenticationMiddleware } from "./middleware/auth.middleware.js";

const app = express();
const corsOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  }),
);
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "URL shortener API is running",
    environment: process.env.VERCEL ? "vercel" : "server",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use(authenticationMiddleware);
app.use("/users", userRouter);
app.use(urlRouter);

app.use((error, req, res, next) => {
  console.error(error);

  res.status(500).json({
    message: error?.message ?? "Internal server error",
  });
});

export default app;
