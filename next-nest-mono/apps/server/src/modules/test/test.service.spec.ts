import { describe, it, expect, beforeEach } from "vitest";
import { Test, type TestingModule } from "@nestjs/testing";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { TestService } from "./test.service";
import { TestQuery } from "./test.query";

describe("TestService", () => {
  let service: TestService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        TestService,
        {
          provide: TestQuery,
          useValue: {
            findTestById: (id: string) => {
              if (id === "not-found") return Promise.resolve(undefined);
              return Promise.resolve({ id, name: `Test Item ${id}` });
            },
          },
        },
      ],
    }).compile();

    service = moduleRef.get<TestService>(TestService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should return formatted test item when id is valid", async () => {
    const result = await service.getTest("123");
    expect(result).toEqual({ id: "123", test: "Test Item 123" });
  });

  it("should throw BadRequestException when id is invalid", async () => {
    await expect(service.getTest("invalid")).rejects.toThrow(BadRequestException);
  });

  it("should throw NotFoundException when item does not exist", async () => {
    await expect(service.getTest("not-found")).rejects.toThrow(NotFoundException);
  });
});
