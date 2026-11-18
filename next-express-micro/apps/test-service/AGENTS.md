# Test service rules

This is the reference service. Keep the standard domain folder layout and
protect domain routes with `requireAuth` after the internal-secret guard.
`test.created` is an example event; handlers must be idempotent and the
subscriber is intentionally only a logging demonstration.
