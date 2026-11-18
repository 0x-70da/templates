import { TRPCError } from "@trpc/server";
import { findTestByIdQuery } from "@/queries/test/test.query";
import type { TestData } from "@/contracts/test.types";

export async function getTestService(id: string): Promise<TestData> {
  assertValidId(id);
  const item = await fetchItem(id);
  return formatResponse(item);
}

function assertValidId(id: string): void {
  if (!id || id === "invalid") {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid test ID" });
  }
}

async function fetchItem(id: string) {
  const item = await findTestByIdQuery(id);
  if (!item) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Test item not found" });
  }
  return item;
}

function formatResponse(item: { id: string; name: string }): TestData {
  return {
    id: item.id,
    message: `Hello, ${item.name}!`,
  };
}
