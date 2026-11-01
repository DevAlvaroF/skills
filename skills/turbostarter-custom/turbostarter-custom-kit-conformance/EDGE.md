# Edge kit: the kit's way

One TanStack Start app on Cloudflare Workers, not a monorepo: app code under `src/`, `@/*` its only alias, Drizzle on
D1, Better Auth, Stripe, Paraglide, Kumo, Vite+ (`vp`). The root `AGENTS.md` is long and mostly right — read it
first. Where the repo differs, the repo wins: it is the version you'll merge with.

- **Layers:** infra in `src/lib/`, one product capability end-to-end in `src/modules/<feature>/`, and `src/routes/`
  a thin URL map that composes modules — no business logic in routes, no new top-level service folders, no `index.ts`
  barrels under `src/modules/`. File suffixes carry the boundary, `src/modules/billing/` being the reference:
  `*.functions.ts` (`createServerFn`), `*.queries.ts` (`queryOptions`/`mutationOptions`), `*.server.ts` (D1, secrets,
  bindings; never imported by client code).
- **Server work from app UI** is a `createServerFn` guarded by `enforceAuth`, `enforceAdmin` or `enforcePlan` from
  `src/lib/auth/middleware.ts`, with a Zod validator. `src/routes/api/` (`server.handlers`) is for third-party
  callbacks and protocol endpoints — webhooks, auth, AI streaming, storage — never a parallel REST layer for the app.
  The `/admin` route guard is navigation only: every admin server function carries `enforceAdmin` itself.
- **Tenancy:** none — no organizations. Data is the user's, scoped by `context.user` from the middleware, never by an
  ID the client sent; paid features check `enforcePlan` on the server. Admin user mutations go through
  `authClient.admin.*`.
- **Schema workflow:** app tables in their own `src/db/schema/<name>.ts`, exported from `index.ts`; `auth.ts` is
  written by `pnpm db:generate` from `src/lib/auth/server.ts`, which then runs `drizzle-kit generate` into `drizzle/`.
  Apply with `pnpm db:migrate --local`; never edit an applied migration.
- **Two `env`s:** typed secrets from `env.config.ts` (imported relatively, with `.ts`); Cloudflare bindings from
  `cloudflare:workers` (`env.DB`, `KV`, `UPLOADS`, `QUEUE`, `FLAGS`, `AI`, `EMAIL`), declared in `wrangler.jsonc` and
  typed by `vp run cf-typegen`. A binding ID in `env.config.ts` is wrong.
- **Other primitives:** Kumo components imported by subpath (`@cloudflare/kumo/components/<name>`), never the package
  root; Paraglide messages (`@/lib/i18n/messages.js`) for every visible string — `react/jsx-no-literals` is a lint
  error — with keys in `messages/{en,es}.json`; `log`/`withRequestId` from `src/lib/log.ts`, no Sentry or APM;
  flags via `src/lib/flags.ts` (Flagship), never KV; async work via `src/lib/queue/`; email via `src/lib/email/`;
  Stripe only through `src/lib/billing/`; link targets from `src/config/paths.ts`.
- **Workers rules:** no Node-only APIs; KV is not durable state; Workers-runtime tests are `*.worker.test.ts`.
- **Upstream-owned:** every path the upstream tree holds, `src/lib/**` above all; a new `src/modules/<feature>/` or
  route is the app's own. `src/config/**`, `messages/**`, `src/content/**` and `wrangler.jsonc` `vars` are meant to be
  edited.
- **Generated:** `src/db/schema/auth.ts`, `src/routeTree.gen.ts`, `src/lib/i18n/`, `worker-configuration.d.ts`,
  `.content-collections/`, applied migrations under `drizzle/`.

## Kit

- **Edge** — checked at 2026-10-31 (`e3e6709`) · upstream `git@github.com:turbostarter/edge.git` (private) · docs base
  `edge/docs` · kit skills: create-auth, kumo-design, start-core, tanstack, tanstack-router, tanstack-start,
  vercel-react-best-practices, web-design-guidelines · kit agents: code-reviewer
