import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/index";
import { account, jwks, session, user, verification } from "@/db/auth-schema";
import { admin } from "better-auth/plugins";
import { bearer } from "better-auth/plugins/bearer";
import { jwt } from "better-auth/plugins/jwt";
import { env } from "@/env";

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
      jwks,
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
        issuer: env.JWT_ISSUER,
        audience: env.JWT_AUDIENCE,
        expirationTime: env.JWT_EXPIRES_IN ?? "15m",
        definePayload: ({ user: sessionUser }) => ({
          role: sessionUser.role ?? "user",
        }),
      },
      jwks: {
        keyPairConfig: { alg: "EdDSA", crv: "Ed25519" },
      },
    }),
  ],
});
