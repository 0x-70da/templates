import { z } from "zod";

export const testSchema = z.object({
  test: z
    .string()
    .trim()
    .min(1, "Test is required")
    .max(100, "Test must be less than 100 characters"),
});

export type TestInput = z.infer<typeof testSchema>;
