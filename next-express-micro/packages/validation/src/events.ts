import type { EventMap } from "@workspace/types";
import { z } from "zod";

export const eventSchemas = {
  "test.created": z.object({
    id: z.string().min(1),
    createdAt: z.iso.datetime(),
  }),
} satisfies {
  [K in keyof EventMap]: z.ZodType<EventMap[K]>;
};
