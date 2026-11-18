import { router, createCallerFactory } from "@/trpc/init";
import { testRouter } from "./test.router";

export const appRouter = router({
  test: testRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
