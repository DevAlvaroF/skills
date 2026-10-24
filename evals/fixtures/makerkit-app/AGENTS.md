# Makerkit SaaS Starter

## Monorepo Structure

| Directory                   | Purpose                           | Details                               |
| --------------------------- | --------------------------------- | ------------------------------------- |
| `apps/web`                  | Main Next.js app                  | See `apps/web/AGENTS.md`              |
| `apps/web/app/api/v1`       | The versioned API the mobile app calls | See `apps/web/app/api/v1/AGENTS.md` |
| `apps/native`               | Expo (React Native) app           | See `apps/native/AGENTS.md`           |
| `packages/mobile-ui`        | RN components (@kit/mobile-ui)    | See `packages/mobile-ui/AGENTS.md`    |

Dependencies are not installed in this checkout: neither app builds or runs here. `npm test` (`node:test`) runs the
server tests under `apps/web/test/`.

## Multi-Tenant Architecture

- **Team Accounts** (workspaces): shared workspaces with members and roles.
- Data links to accounts via `account_id`; RLS enforces access control.

## Key Patterns (Quick Reference)

| Pattern        | Import                                                       |
| -------------- | ------------------------------------------------------------ |
| Server Actions | `authActionClient` from `@kit/next/safe-action`              |
| Route Handlers | `enhanceRouteHandler` from `@kit/next/routes`                |
| Server Client  | `getSupabaseServerClient` from `@kit/supabase/server-client` |
| UI Components  | `@kit/ui/{component}`                                        |

## TypeScript

- Use the service pattern for server-side APIs: pure services with injected dependencies, tested directly.
- Never mix client/server imports.

## React

- Always use the `'use client'` directive for client components.
- Add `data-test` for E2E tests where appropriate.
- Prefer RSC for data fetching.

## Verification

After implementation, always run:

1. `npm test`
2. Run adversarial reviewer skill /reviewer
3. **If the change is user-visible** (UI, routes, server actions, auth, emails), prove it in the running app with
   /verify-app
4. If a skill is unavailable, continue with local `AGENTS.md`, source and tests.

- Run `/makerkit-custom-kit-conformance` on the change.

## Agent skills

### Issue tracker

Issues are JSON files under `.mysdd/features/`. See `.mysdd/issue-tracker.md` (issue schema, status lifecycle, and
commit message format).

### Domain docs

Glossary in `.mysdd/docs/CONTEXT.md`, decisions as scoped ADRs in `.mysdd/docs/adr/`. See `.mysdd/docs/agents/domain.md`.

### Project docs

Conventions live in a distribution of `AGENTS.md` files (root, per app/package, and deeper). Read every `AGENTS.md`
from the root down to each directory you touch, in order, plus every one those files route a concern you touch to: the
root is already loaded; read the rest directly, because not every agent loads nested files. Invoke the skills a nested
`AGENTS.md` names when writing code there, and run any verification it adds.
