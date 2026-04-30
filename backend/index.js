import "dotenv/config";
import express from "express";
import userRouter from "./routes/user.routes.js";
import urlRouter from "./routes/url.routes.js";
import { authenticationMiddleware } from "./middleware/auth.middleware.js";

const app = express();

app.use(express.json());
app.use(authenticationMiddleware);
app.use("/users", userRouter);
app.use(urlRouter);

const PORT = process.env.PORT ?? 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
