import "dotenv/config";
import { promisify } from "node:util";
import app from "./app.js";
import { pool } from "./db/index.js";

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const closeHttpServer = promisify(server.close.bind(server));

const gracefulShutdown = async (signal: string) => {
  console.log(`Received ${signal}. Gracefully shutting down...`);
  try {
    await closeHttpServer();
    console.log("HTTP server closed.");
    await pool.end();
    console.log("Database pool closed.");
    process.exit(0);
  } catch (err: unknown) {
    console.error("Error during graceful shutdown:", err);
    process.exit(1);
  }
};

process.on("SIGTERM", () => {
  void gracefulShutdown("SIGTERM");
});

process.on("SIGINT", () => {
  void gracefulShutdown("SIGINT");
});
