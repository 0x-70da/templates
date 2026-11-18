import { nullToUndefined } from "@/lib/nullToUndefined";

export async function findTestByIdQuery(
  id: string,
): Promise<{ id: string; name: string } | undefined> {
  if (id === "not-found") {
    return undefined;
  }

  const row = { id, name: "Sample Item" };
  return nullToUndefined(row);
}
