import DataLoader from "dataloader";
import { findTestByIdQuery } from "@/queries/test/test.query";

export function createTestDataLoader() {
  return new DataLoader<string, { id: string; name: string } | undefined>(
    async (ids: readonly string[]) => {
      const results = await Promise.all(ids.map((id) => findTestByIdQuery(id)));
      return results;
    },
  );
}
