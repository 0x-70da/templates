import { Controller, Get, Param, UsePipes, Inject } from "@nestjs/common";
import { TestService } from "./test.service";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { getTestInputSchema } from "@workspace/validation";
import type { Test } from "@workspace/types";

export interface TestResponse {
  success: boolean;
  message: string;
  data: Test;
}

@Controller("api/test")
export class TestController {
  constructor(@Inject(TestService) private readonly testService: TestService) {}

  @Get(":id")
  @UsePipes(new ZodValidationPipe(getTestInputSchema))
  async getTest(@Param("id") id: string): Promise<TestResponse> {
    const data = await this.testService.getTest(id);
    return {
      success: true,
      message: "Test retrieved successfully",
      data,
    };
  }
}
