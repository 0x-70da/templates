import { router, publicProcedure } from "@/trpc/init";
import { getTestInputSchema } from "@/contracts/test.validation";
import { getTestService } from "@/services/test/test.service";

export const testRouter = router({
  getTest: publicProcedure.input(getTestInputSchema).query(async ({ input }) => {
    return getTestService(input.id);
  }),
});
