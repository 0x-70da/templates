export type EventMap = {
  "test.created": {
    id: string;
    createdAt: string;
  };
};

export const eventSubscribers = {
  "test.created": ["test"],
} as const satisfies Record<keyof EventMap, readonly string[]>;
