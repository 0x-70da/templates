import { AppError } from "../../lib/errors.js";
import { findTestByIdQuery } from "../../queries/test/test.query.js";
import type { Test } from "@workspace/types";

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
  const item = await findTestByIdQuery(id);
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
