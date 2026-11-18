"use server";

import "server-only";
import { getTestService } from "@/services/test/getTest.service";
import { testSchema } from "@/validation/test.validation";
import type { Test } from "@/types/test.types";

export async function getTestAction(id: string): Promise<Test> {
  const parsed = testSchema.safeParse({ test: id });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid ID");
  }

  return getTestService(parsed.data.test);
}
