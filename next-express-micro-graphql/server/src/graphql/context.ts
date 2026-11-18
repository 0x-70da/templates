import { auth } from "@/lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import { createTestDataLoader } from "./dataloaders/test.dataloader";
import type { Request, Response } from "express";

export async function buildGraphQLContext(req: Request, res: Response) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  return {
    req,
    res,
    user: session?.user ?? null,
    session: session?.session ?? null,
    loaders: {
      test: createTestDataLoader(),
    },
  };
}

export type GraphQLContext = Awaited<ReturnType<typeof buildGraphQLContext>>;
