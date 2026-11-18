import { Module, Global } from "@nestjs/common";
import { db } from "../db/index";

export const DRIZZLE_DB = "DRIZZLE_DB";
export type DrizzleDb = typeof db;

const dbProvider = {
  provide: DRIZZLE_DB,
  useValue: db,
};

@Global()
@Module({
  providers: [dbProvider],
  exports: [DRIZZLE_DB],
})
export class DatabaseModule {}
