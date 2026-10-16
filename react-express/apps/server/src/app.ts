import express from "express";
import cors from "cors";
import router from "./routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";

const app: express.Application = express();

app.use(
  cors({
    origin: "*",
  }),
);

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

app.use("/api", router);

app.use(errorHandler);

export default app;
