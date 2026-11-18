import { describe, it, expect, beforeEach } from "vitest";
import { Test, type TestingModule } from "@nestjs/testing";
import { TestController } from "./test.controller";
import { TestService } from "./test.service";

describe("TestController", () => {
  let controller: TestController;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [TestController],
      providers: [
        {
          provide: TestService,
          useValue: {
            getTest: (id: string) => Promise.resolve({ id, message: `Sample test record ${id}` }),
          },
        },
      ],
    }).compile();

    controller = moduleRef.get<TestController>(TestController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should return wrapped test response", async () => {
    const response = await controller.getTest("123");
    expect(response).toEqual({
      success: true,
      message: "Test retrieved successfully",
      data: { id: "123", message: "Sample test record 123" },
    });
  });
});
