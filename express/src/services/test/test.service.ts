import { AppError } from "@/lib/errors";
import { findTestByIdQuery } from "@/queries/test/test.query";
import type { TestData } from "@/types/test.types";

export async function getTestService(id: string): Promise<TestData> {
  assertValidId(id);
  const item = await fetchItem(id);
  return formatResponse(item);
}

function assertValidId(id: string): void {
  if (!id || id === "invalid") {
    throw new AppError("Invalid test ID", 400);
  }
}

async function fetchItem(id: string) {
  const item = await findTestByIdQuery(id);
  if (!item) {
    throw new AppError("Test item not found", 404);
  }
  return item;
}

function formatResponse(item: { id: string; name: string }): TestData {
  return {
    id: item.id,
    message: `Hello, ${item.name}!`,
  };
}
