import { describe, expect, it, vi } from "vitest";
import { testResolvers } from "@/resolvers/test.resolver";
import * as testService from "@/services/test/test.service";
import { GraphQLError } from "graphql";
import type { GraphQLContext } from "@/graphql/context";

vi.mock("@/services/test/test.service", () => ({
  getTestService: vi.fn(),
}));

describe("testResolvers", () => {
  it("resolves getTest query successfully", async () => {
    vi.mocked(testService.getTestService).mockResolvedValue({
      id: "1",
      test: "Hello, GraphQL!",
    });

    const result = await testResolvers.Query.getTest(
      {},
      { id: "1" },
      {} as GraphQLContext,
    );

    expect(result).toEqual({ id: "1", test: "Hello, GraphQL!" });
    expect(testService.getTestService).toHaveBeenCalledWith("1");
  });

  it("throws GraphQLError for invalid input", async () => {
    await expect(
      testResolvers.Query.getTest({}, { id: "" }, {} as GraphQLContext),
    ).rejects.toThrow(GraphQLError);
  });

  it("resolves health query", () => {
    expect(testResolvers.Query.health()).toBe("ok");
  });
});
