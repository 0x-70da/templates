# Gateway rules

The gateway verifies credentials, strips incoming identity headers, applies
policy, and proxies requests. It must not contain business logic or a database.
Keep route declarations in `src/services.registry.ts`; generator markers are
idempotent extension points.
