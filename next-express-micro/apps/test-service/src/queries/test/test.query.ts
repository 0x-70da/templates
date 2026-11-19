import { nullToUndefined } from "@workspace/service-kit";

export async function findTestByIdQuery(
  id: string,
): Promise<{ id: string; name: string } | undefined> {
  if (id === "not-found") {
    return undefined;
  }

  const row = { id, name: `Test Item ${id}` };
  return nullToUndefined(row);
}
