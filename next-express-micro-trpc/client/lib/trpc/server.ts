import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@/contracts/trpc.types";

export const trpcCaller = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/trpc`,
    }),
  ],
});
