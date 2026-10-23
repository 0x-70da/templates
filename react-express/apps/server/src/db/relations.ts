import { defineRelations } from "drizzle-orm";

import * as schema from "./schema.js";
import * as authSchema from "./auth-schema.js";

export const relations = defineRelations({ ...schema, ...authSchema }, (r) => ({
  user: {
    // One user has many sessions
    sessions: r.many.session(),
    // One user has many accounts (credentials / OAuth providers)
    accounts: r.many.account(),
  },
  session: {
    // A session belongs to one user
    user: r.one.user({
      from: r.session.userId,
      to: r.user.id,
    }),
  },
  account: {
    // An account belongs to one user
    user: r.one.user({
      from: r.account.userId,
      to: r.user.id,
    }),
  },
}));
