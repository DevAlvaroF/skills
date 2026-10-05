# Supabase kit: the kit's way

Names as of kit v3/v4. Where the repo differs, the repo wins: it is the version you'll merge with.

- **Actions:** `authActionClient`, `publicActionClient`, `captchaActionClient` from `@kit/next/safe-action`, extra
  checks composed with `.use()`; `useAction` on the client. `adminActionClient` only in admin features. Mutations only,
  never fetching.
- **Route handlers:** `enhanceRouteHandler` from `@kit/next/routes`.
- **Data and auth:** `getSupabaseServerClient()` and `useSupabase()` enforce RLS, so trust it — a manual ownership
  check beside them duplicates the policy. `getSupabaseServerAdminClient()` bypasses RLS: only webhooks, admin work and
  background jobs, after explicit validation. Accounts through `createAccountsApi` / `createTeamAccountsApi`.
- **SQL helpers:** `has_role_on_account`, `has_permission`, `is_account_owner`, `is_team_member` and the rest exist;
  never recreate one. Row types from `Tables<'name'>`, never a hand-written copy.
- **Policies:** business rules via `definePolicy` in a registry (`@kit/policies`), never inline.
- **Other primitives:** `getLogger()` from `@kit/shared/logger`, never `console.log`; `getMailer()` with the email
  templates package; `Trans` and `next-intl` messages for every visible string; `@kit/ui/<name>` imports, no deep
  paths; forms with `react-hook-form` and the kit's `Form` components.
- **Schema workflow:** write `apps/web/supabase/schemas/NN-*.sql`, then the migration (`supabase:db:diff` or
  `migrations new`), then `supabase:web:typegen`. Every new table enables RLS; revoke from `anon`, `authenticated` and
  `service_role`, then grant `UPDATE` per column, never table-level. Never change schema in the hosted Studio, never
  hand-edit `database.types.ts`, never edit an applied migration.
- **Data ownership:** every tenant table carries an `account_id` to `accounts`, so personal and team accounts share one
  model.
- **Upstream-owned paths and their extension points:**
  - `packages/ui/src/shadcn/` → wrap and re-export in `packages/ui/src/makerkit/<name>.tsx`, or a companion token map;
  - `packages/features/**`, `packages/supabase/**`, `packages/next/**` → compose from the app, don't patch;
  - `apps/web/config/*.ts`, the navigation configs and `apps/web/i18n/messages` are meant to be edited: no finding.
- **Deprecated:** `enhanceAction` (now the safe-action clients), `withI18n` and `react-i18next` (now `next-intl`),
  `asChild` and `@radix-ui/*` (now Base UI's `render`), `import { z } from 'zod'` (now `import * as z`),
  `router.refresh()` / `router.push()` after an action (revalidate or redirect in the action).
- **Routes:** `app/[locale]/home/(user)/` for the personal account, `app/[locale]/home/[account]/` for a team, keyed by
  slug; feature server code under a `_lib/server/` beside the route.
