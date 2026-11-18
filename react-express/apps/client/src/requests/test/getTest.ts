import { get } from "@/lib/api";
import type { ApiResponse, Test } from "@workspace/types";

export async function getTest(signal?: AbortSignal): Promise<ApiResponse<Test>> {
  return get<ApiResponse<Test>>("/api/test", { signal });
}
