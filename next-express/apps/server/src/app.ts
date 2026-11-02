import express from "express";
import cors from "cors";
import router from "./routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import { notFoundHandler } from "./middlewares/notFound.middleware.js";

const app: express.Application = express();
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

app.use("/api", router);

app.use(errorHandler);

app.use(notFoundHandler);

export default app;
