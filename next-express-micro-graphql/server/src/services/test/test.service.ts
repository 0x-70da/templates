import { GraphQLError } from "graphql";
import { findTestByIdQuery } from "@/queries/test/test.query";
import type { TestData } from "@/contracts/test.types";

export async function getTestService(id: string): Promise<TestData> {
  assertValidId(id);
  const item = await fetchItem(id);
  return formatResponse(item);
}

function assertValidId(id: string): void {
  if (!id || id === "invalid") {
    throw new GraphQLError("Invalid test ID", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }
}

async function fetchItem(id: string) {
  const item = await findTestByIdQuery(id);
  if (!item) {
    throw new GraphQLError("Test item not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }
  return item;
}

function formatResponse(item: { id: string; name: string }): TestData {
  return {
    id: item.id,
    test: `Hello, ${item.name}!`,
  };
}
