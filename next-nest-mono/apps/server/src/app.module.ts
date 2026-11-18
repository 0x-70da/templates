import { Module } from "@nestjs/common";
import { DatabaseModule } from "./database/database.module";
import { HealthModule } from "./health/health.module";
import { AuthModule } from "./modules/auth/auth.module";
import { TestModule } from "./modules/test/test.module";

@Module({
  imports: [DatabaseModule, HealthModule, AuthModule, TestModule],
})
export class AppModule {}
