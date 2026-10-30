# Supabase kits: the data layer

For the Next.js and TanStack Start Supabase kits; actions or server functions, routes, the upstream and the kit's
skills are in the framework file's kit row. Where the repo differs, the repo wins: it is the version you'll merge with.

- **Data and auth:** `getSupabaseServerClient()` and `useSupabase()` enforce RLS, so trust it — a manual ownership
  check beside them duplicates the policy. `getSupabaseServerAdminClient()` bypasses RLS: only webhooks, admin work and
  background jobs, after explicit validation. Accounts through `createAccountsApi` / `createTeamAccountsApi`.
- **SQL helpers:** `has_role_on_account`, `has_permission`, `is_account_owner`, `is_team_member` and the rest exist;
  never recreate one. Row types from `Tables<'name'>`, never a hand-written copy.
- **Policies:** business rules via `definePolicy` in a registry (`@kit/policies`), never inline.
- **Other primitives:** `getLogger()` from `@kit/shared/logger`, never `console.log`; `getMailer()` with the email
  templates package; `@kit/ui/<name>` imports, no deep paths.
- **Schema workflow:** write `apps/web/supabase/schemas/NN-*.sql`, then the migration (`supabase:db:diff` or
  `migrations new`), then `supabase:web:typegen`. Every new table enables RLS; revoke from `anon`, `authenticated` and
  `service_role`, then grant `UPDATE` per column, never table-level. Never change schema in the hosted Studio, never
  hand-edit `database.types.ts`, never edit an applied migration.
- **Data ownership:** every tenant table carries an `account_id` to `accounts`, so personal and team accounts share one
  model.
- **Upstream-owned paths and their extension points:**
  - `packages/ui/src/shadcn/` → wrap and re-export in `packages/ui/src/makerkit/<name>.tsx`, or a companion token map;
  - `packages/features/**`, `packages/supabase/**` and the framework package the kit row names → compose from the app,
    don't patch.
- **Deprecated:** `asChild` and `@radix-ui/*` (now Base UI's `render`), `import { z } from 'zod'` (now `import * as z`).
