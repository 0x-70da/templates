import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { auth } from "@/lib/auth";
import { fromNodeHeaders } from "better-auth/node";

export async function createContext({ req, res }: CreateExpressContextOptions) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  return {
    req,
    res,
    user: session?.user ?? null,
    session: session?.session ?? null,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
