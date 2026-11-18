import { Controller, Get, Inject } from "@nestjs/common";
import { sql } from "drizzle-orm";
import { DRIZZLE_DB, type DrizzleDb } from "../database/database.module";

@Controller("health")
export class HealthController {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDb) {}

  @Get()
  async check() {
    try {
      await this.db.execute(sql`SELECT 1`);
      return {
        status: "ok",
        database: "connected",
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        status: "ok",
        database: "disconnected",
        timestamp: new Date().toISOString(),
      };
    }
  }
}
