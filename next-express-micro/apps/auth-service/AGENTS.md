# Auth service rules

This service owns Better Auth, users, sessions, its JWKS table, and its
database. Mount Better Auth before `express.json()` through `createApp`'s
`beforeBody` hook. Its public origin is configured with `BETTER_AUTH_URL` and
`TRUSTED_ORIGINS`; internal requests still require `x-internal-secret`.
