import { initTRPC } from "@trpc/server";
import { getTestInputSchema } from "./test.validation";
import type { TestData } from "./test.types";

const t = initTRPC.create();

export const contractRouter = t.router({
  test: t.router({
    getTest: t.procedure.input(getTestInputSchema).query((): Promise<TestData> => {
      throw new Error("Contract stub");
    }),
  }),
});

export type AppRouter = typeof contractRouter;
