import "server-only";
import { nullToUndefined } from "@/lib/nullToUndefined";

export async function getTestQuery(id: string): Promise<{ id: string; name: string } | undefined> {
  if (id === "not-found") {
    return undefined;
  }

  const row = { id, name: `Item ${id}` };
  return nullToUndefined(row);
}
