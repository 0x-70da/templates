import DataLoader from "dataloader";
import { findTestByIdQuery } from "@/queries/test/test.query";

export function createTestDataLoader() {
  return new DataLoader<string, { id: string; name: string } | undefined>(
    async (ids: readonly string[]) => {
      // In production, run batch query: WHERE id IN (...ids)
      const results = await Promise.all(ids.map((id) => findTestByIdQuery(id)));
      return results;
    },
  );
}
