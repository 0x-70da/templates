import "server-only";
import { AppError } from "@/lib/errors";
import { getTestQuery } from "@/queries/test/getTest.query";
import type { Test } from "@/types/test.types";

export async function getTestService(id: string): Promise<Test> {
  assertValidId(id);
  const item = await fetchItem(id);
  return formatResponse(item);
}

function assertValidId(id: string): void {
  if (!id || id === "invalid") {
    throw new AppError("Invalid test ID", 400);
  }
}

async function fetchItem(id: string): Promise<{ id: string; name: string }> {
  const item = await getTestQuery(id);
  if (!item) {
    throw new AppError("Test item not found", 404);
  }
  return item;
}

function formatResponse(item: { id: string; name: string }): Test {
  return {
    id: item.id,
    test: item.name,
  };
}
