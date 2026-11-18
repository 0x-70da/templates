import { z } from "zod";

export const getTestInputSchema = z.object({
  id: z.string().trim().min(1, "Id is required").max(100, "Id is too long"),
});

export type GetTestInput = z.infer<typeof getTestInputSchema>;
