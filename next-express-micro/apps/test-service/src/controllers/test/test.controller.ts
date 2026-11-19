import type { Request, Response } from "express";
import { error, success } from "@workspace/service-kit";
import { getTestService } from "@/services/test/test.service";
import { testSchema } from "@workspace/validation";

export async function getTestController(req: Request, res: Response): Promise<void> {
  const param = req.params.id ?? req.query.id;
  const parsed = testSchema.safeParse({ test: param });

  if (!parsed.success) {
    error(res, parsed.error.issues[0]?.message ?? "Validation failed", parsed.error, 400);
    return;
  }

  const result = await getTestService(parsed.data.test);
  success(res, "Test fetched successfully", result);
}
