export type NullToUndefined<T> = {
  [K in keyof T]: null extends T[K] ? Exclude<T[K], null> | undefined : T[K];
};

export const nullToUndefined = <T extends Record<string, unknown>>(row: T) =>
  Object.fromEntries(
    Object.entries(row).map(([k, v]) => [k, v === null ? undefined : v]),
  ) as NullToUndefined<T>;
