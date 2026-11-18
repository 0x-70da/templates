import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/contracts/trpc.types";

export const trpc = createTRPCReact<AppRouter>();
