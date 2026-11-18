import { Module } from "@nestjs/common";
import { TestController } from "./test.controller";
import { TestService } from "./test.service";
import { TestQuery } from "./test.query";

@Module({
  controllers: [TestController],
  providers: [TestService, TestQuery],
  exports: [TestService],
})
export class TestModule {}
