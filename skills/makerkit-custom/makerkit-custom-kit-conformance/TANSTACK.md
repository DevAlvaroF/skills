# TanStack Start kits: the kit's way

The framework's rules, for any data layer; the data layer's own are in SUPABASE.md or BETTER-AUTH.md. Where the repo
differs, the repo wins: it is the version you'll merge with.

- **Server and client:** server-only modules are named `*.server.ts`, as the kit's `AGENTS.md` says.
  `import 'server-only'` is Next.js's mechanism, absent from one kit and a runtime stub in the other, so it is not the
  kit's way. Never mix client and server imports in one entry point.
- **Server functions:** a literal `createServerFn(...)` at the definition site, never behind a factory, which hides it
  from the compiler and ships the handler to the browser. Auth comes from the kit row's middleware tuple,
  `.middleware(tuple)` from `@kit/function-middleware/functions`, with gates spread in from
  `@kit/function-middleware/server`; then `.validator(ZodSchema)` and `.handler()`. A session check inside the handler
  duplicates the tuple and skips its error middleware. They live in `{feature}.functions.ts`, exports suffixed
  `Function`, called with `useServerFn` and TanStack Query.
- **Fetching:** route `loader`s that call server functions, read with `Route.useLoaderData()`; there are no Server
  Components. Control flow throws `redirect` / `notFound` from `@tanstack/react-router`.
- **Routes** are files under `apps/web/src/routes/`; `routeTree.gen.ts` is generated, never edited. API routes are
  `createFileRoute(...)({ server: { handlers } })`.
- **Forms** with `@tanstack/react-form` and `@kit/ui/field`; `Trans` from `@kit/ui/trans` (`use-intl`) for every
  visible string; internal links locale-aware as `apps/web/AGENTS.md` says.
- **Client config** is `VITE_*` through `import.meta.env`; account mode is `VITE_ACCOUNT_MODE`.

## Kits

Each row holds the names that depend on the framework and the data layer together, and the kit version they were
checked at (§ Skill drift in SKILL.md). `packages/function-middleware/**` is upstream-owned in both.

- **Supabase** — checked at 1.2.1 · upstream `git@github.com:makerkit/tanstack-supabase-saas-kit-turbo.git` (private)
  · docs `tanstack-supabase` · tuples `authFunctionMiddleware`, `teamAccountFunctionMiddleware` (its gates need a uuid
  `accountId` in the validator), `adminFunctionMiddleware` · gates `withMinRole`, `withFeaturePermission` · app server
  code in `apps/web/src/lib/server/` · kit skills: architect, bug-hunt, bug-hunt-lite, playwright-e2e,
  postgres-expert, react-form-builder, reviewer, rls-review, service-builder, verify-app
- **Drizzle** — checked at 1.3.1 · upstream `git@github.com:makerkit/tanstack-drizzle-saas-kit-turbo.git` (private)
  · docs `tanstack-drizzle` · tuples `authFunctionMiddleware`, `organizationFunctionMiddleware`,
  `adminFunctionMiddleware` with `withAdminPermission` · gates `withMinRole`, `withFeaturePermission` · kit skills:
  architect, bug-hunt, bug-hunt-lite, drizzle-expert, frontend-design, playwright-e2e-expert, react-form-builder,
  reviewer, verify-app
