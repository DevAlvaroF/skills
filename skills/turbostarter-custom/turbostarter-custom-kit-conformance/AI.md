# AI kit: the kit's way

A pnpm and Turborepo monorepo shaped like Core's — `apps/web` (Next.js), `apps/mobile` (Expo), `@workspace/*`
packages, Hono under `/api`, Drizzle on Postgres — with AI capabilities as packages and no organizations, billing or
admin. Where the repo differs, the repo wins: it is the version you'll merge with. Combined with Core, read AI-CORE.md
as well.

- **Users are anonymous by default.** Better Auth's anonymous plugin gives every visitor a session on first load, so
  history and credits belong to that `userId`; scope every AI table by it, taken from the route's `c.var.user`, never
  from an ID the client sent. Upgrading an anonymous user to an account is not in this kit.
- **Credits are the metering:** a per-user ledger (`packages/db/src/schema/customer.ts`,
  `packages/ai/core/src/credits/`). A route that spends model calls charges through `deductCredits` from
  `packages/api/src/middleware.ts` — it deducts before the handler runs and refunds a failed start — never by calling
  the ledger after the model returns, and never by skipping the charge. `GET /api/ai/credits` returns the balance.
- **Capabilities are packages:** `packages/ai/<name>/` (`@workspace/ai-chat`, `-image`, `-rag`, `-tts`, `-voice`),
  public functions in `src/api.ts`, schemas and types beside it, server-only credit and model middleware in
  `@workspace/ai/server` (`packages/ai/core/src/server.ts`). A new capability is a new package of that shape, not a
  folder under `packages/ai/src/modules/`, which does not exist whatever older docs say.
- **Providers:** chosen in each package's provider file — chat `src/models/provider.ts` (AI Gateway by default),
  image and RAG `src/provider.ts`, TTS `src/client.ts`; chat tools register in `packages/ai/chat/src/tools/index.ts`,
  web-search backends as strategies under `tools/web-search/providers/strategies/`. Never a provider SDK from a route
  or a component.
- **API:** routes in `packages/api/src/modules/ai/*.ts`, mounted in `modules/ai/router.ts` under `/api/ai/<name>`,
  guarded by `enforceAuth`, `validate` and `deductCredits`, rate-limited by the kit's `rateLimiter`. Apps call them
  through the typed client.
- **Schema workflow:** as Core — `packages/db/src/schema/<name>.ts` added to the `schema` object with its `prefix`
  helper in `index.ts`, then `db:generate` and `db:migrate`; never edit an applied migration. RAG needs pgvector.
- **Pages:** `apps/web/src/app/[locale]/(apps)/<capability>/`, UI in `apps/web/src/modules/<capability>/`; mobile
  screens under `apps/mobile/src/app/(apps)/<capability>/` (see `/turbostarter-custom-mobile-app`).
- **Accounts, organizations, subscriptions or admin** are not built by hand here: the kit's answer is
  `https://www.turbostarter.dev/ai/docs/integrate-core-kit.md` — port Core's packages into this repo, or follow the
  AI recipe in a Core repo — and then the repo is AI + Core.
- **Upstream-owned:** `packages/**` and `tooling/**`. `apps/**` is the starting point; config and translations are
  meant to be edited.

## Kit

- **AI** — checked at 2026-10-29 (`4af89d9`) · upstream `git@github.com:turbostarter/ai.git` (private) · docs base
  `ai/docs` · kit skills: as Core's row · kit agents: code-reviewer
