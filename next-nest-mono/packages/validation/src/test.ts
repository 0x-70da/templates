import { z } from "zod";

export const testSchema = z.object({
  test: z.string().min(1, "Test is required").max(100, "Test must be less than 100 characters"),
});

export type TestInput = z.infer<typeof testSchema>;

export const getTestInputSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

export type GetTestInput = z.infer<typeof getTestInputSchema>;
