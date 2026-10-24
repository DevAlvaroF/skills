# Web app (Next.js)

Pages under `app/`, server-only services under `lib/server/`, their tests under `test/`.

- Business logic lives in services (`lib/server/*.service.js`) that take their database as a parameter, so tests pass
  an in-memory one. Pages and route handlers only call services.
- Pages are React Server Components; UI from `@kit/ui`.
- The `/api/v1` handlers have their own contract: `app/api/v1/AGENTS.md`.
- Tests: `node:test`, through each service's or handler's exports.
