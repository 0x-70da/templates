import { get } from "@/lib/api";
import type { TestData } from "@/contracts/test.types";

export async function getTest(id: string): Promise<TestData> {
  const response = await get<TestData>(`/api/test/${id}`);
  if (!response.data) {
    throw new Error(response.message ?? "Failed to fetch test data");
  }
  return response.data;
}
