import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/index";
import { account, session, user, verification } from "@/db/auth-schema";
import { admin } from "better-auth/plugins";
import { bearer } from "better-auth/plugins/bearer";
import { jwt } from "better-auth/plugins/jwt";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: process.env.TRUSTED_ORIGINS?.split(",").map((origin) => origin.trim()),
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      session,
      account,
      verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    admin(),
    bearer(),
    jwt({
      jwt: {
        issuer: process.env.JWT_ISSUER,
        audience: process.env.JWT_AUDIENCE,
        expirationTime: process.env.JWT_EXPIRES_IN ?? "15m",
        definePayload: ({ user: sessionUser }) => ({
          role: sessionUser.role,
        }),
      },
      jwks: {
        keyPairConfig: { alg: "EdDSA" },
      },
    }),
  ],
});
