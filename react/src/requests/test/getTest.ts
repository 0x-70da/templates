import { get } from "@/lib/api";
import type { Test } from "@/types/test.types";

export async function getTest(id: string): Promise<Test> {
  const response = await get<Test>(`/api/test/${id}`);
  if (!response.data) {
    throw new Error(response.message ?? "Failed to fetch test data");
  }
  return response.data;
}
