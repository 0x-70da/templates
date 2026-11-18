import type { NullToUndefined } from "@workspace/types";

export const nullToUndefined = <T extends Record<string, unknown>>(row: T) =>
  Object.fromEntries(
    Object.entries(row).map(([k, v]) => [k, v === null ? undefined : v]),
  ) as NullToUndefined<T>;
