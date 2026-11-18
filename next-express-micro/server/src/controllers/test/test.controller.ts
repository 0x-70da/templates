import type { Request, Response } from "express";
import { error, success } from "@/lib/response";
import { getTestService } from "@/services/test/test.service";
import { getTestInputSchema } from "@/validation/test.validation";

export async function getTestController(req: Request, res: Response): Promise<void> {
  const parsed = getTestInputSchema.safeParse({ id: req.params.id ?? req.query.id });

  if (!parsed.success) {
    error(res, parsed.error.issues[0]?.message ?? "Validation failed", parsed.error, 400);
    return;
  }

  const result = await getTestService(parsed.data.id);
  success(res, "Test fetched successfully", result);
}
