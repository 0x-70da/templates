# Service kit rules

`service-kit` is the shared runtime for Express services. Keep each public
unit in its own file and re-export it from `src/index.ts`. Preserve the
internal-secret boundary, request context, standard error shape, and typed
BullMQ event behavior. Unit tests must not require a live Redis or PostgreSQL.
