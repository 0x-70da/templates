# Service kit rules

`service-kit` is the shared runtime for Express services. Keep each public
unit in its own file and re-export it from `src/index.ts`. Preserve the
internal-secret boundary, request context, standard error shape. Unit tests must not require a live PostgreSQL
