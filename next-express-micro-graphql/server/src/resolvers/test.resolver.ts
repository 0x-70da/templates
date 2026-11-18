import { getTestService } from "@/services/test/test.service";
import { getTestInputSchema } from "@/contracts/test.validation";
import { GraphQLError } from "graphql";
import type { GraphQLContext } from "@/graphql/context";

export const testResolvers = {
  Query: {
    getTest: async (
      _parent: unknown,
      args: { id: string },
      _context: GraphQLContext,
    ) => {
      const parsed = getTestInputSchema.safeParse({ id: args.id });
      if (!parsed.success) {
        throw new GraphQLError(parsed.error.issues[0]?.message ?? "Invalid input", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
      return getTestService(parsed.data.id);
    },
    health: () => "ok",
  },
};
