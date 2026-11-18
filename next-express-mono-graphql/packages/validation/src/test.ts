import { z } from "zod";

export const testSchema = z.object({
  test: z.string().min(1, "Test is required").max(100, "Test must be less than 100 characters"),
});

export const getTestInputSchema = z.object({
  id: z.string().trim().min(1, "Id is required").max(100, "Id is too long"),
});

export type TestInput = z.infer<typeof testSchema>;
export type GetTestInput = z.infer<typeof getTestInputSchema>;
