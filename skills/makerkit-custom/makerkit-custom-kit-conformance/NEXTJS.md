# Next.js kits: the kit's way

The framework's rules, for any data layer; the data layer's own are in SUPABASE.md or BETTER-AUTH.md. Where the repo
differs, the repo wins: it is the version you'll merge with.

- **Server and client:** `import 'server-only'` in server modules other than `'use server'` files; never mix client
  and server imports in one entry point.
- **Actions** are the kit row's `next-safe-action` clients, extra checks composed with `.use()`, `useAction` on the
  client. Mutations only, never fetching. Revalidate or `redirect` in the action, never `router.refresh()` /
  `router.push()` after it; an action that catches errors rethrows when `isRedirectError(error)`, or the redirect is
  swallowed.
- **Fetching:** Server Components and page loaders, never an action.
- **Forms** with `react-hook-form` and the kit's `@kit/ui/form`; `next-intl` messages for every visible string.
- **Client config** is `NEXT_PUBLIC_*`; account mode is the row's flag, not an ad hoc toggle.
- **Deprecated:** `withI18n` and `react-i18next` (now `next-intl`).

## Kits

Each row holds the names that depend on the framework and the data layer together, and the kit version they were
checked at (§ Skill drift in SKILL.md).

- **Supabase** — checked at 4.2.2 · upstream `git@github.com:makerkit/next-supabase-saas-kit-turbo.git` (with
  `apps/native`: `expo-supabase-turbo-saas-kit`; both private) · docs `next-supabase-turbo` · actions
  `authActionClient`, `publicActionClient`, `captchaActionClient` from `@kit/next/safe-action`, `adminActionClient`
  only in admin features (`enhanceAction` is deprecated) · route handlers `enhanceRouteHandler` from
  `@kit/next/routes` · account mode `NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS*` · routes
  `app/[locale]/home/(user)/` personal, `app/[locale]/home/[account]/` team by slug, feature server code in
  `_lib/server/` · `packages/next/**` is upstream-owned · kit skills: architect, bug-hunt, bug-hunt-lite,
  playwright-e2e, postgres-expert, react-form-builder, reviewer, rls-review, server-action-builder, service-builder,
  verify-app
- **Drizzle** — checked at 2.3.2 · upstream `git@github.com:makerkit/next-drizzle-saas-kit-turbo.git` · docs
  `nextjs-drizzle` · actions `authenticatedActionClient`, `organizationActionClient`, `adminActionClient` from
  `@kit/action-middleware`, gates `withMinRole`, `withFeaturePermission`, `withAdminPermission`, never an inline
  `ctx.role === 'admin'` · account mode `NEXT_PUBLIC_ACCOUNT_MODE` · routes
  `app/[locale]/(internal)/<feature>/_lib/{actions,schemas,loaders}` · kit skills: architect, bug-hunt, bug-hunt-lite,
  drizzle-expert, frontend-design, playwright-e2e-expert, react-form-builder, reviewer, server-actions-expert,
  verify-app
- **Prisma** — not checked against a copy: as Drizzle, with docs `nextjs-prisma`; take the upstream from
  `git remote -v`.
