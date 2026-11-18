"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { testSchema, type TestInput } from "@/validation/test.validation";

export async function createTestAction(input: TestInput): Promise<{ success: boolean }> {
  const parsed = testSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  // Perform database insert or service operation here
  revalidatePath("/test");
  return { success: true };
}
