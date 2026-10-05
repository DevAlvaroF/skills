# Prisma and Drizzle kits: the kit's way

Both run Better Auth with organizations and differ only in their schema workflow. Where the repo differs, the repo
wins: it is the version you'll merge with.

- **Actions** come from `@kit/action-middleware`: `authenticatedActionClient`, `organizationActionClient`,
  `adminActionClient`. Permission checks compose as `.use(withFeaturePermission(…))` or `withMinRole(…)`, never an
  inline `ctx.role === 'admin'`. An action that catches errors rethrows when `isRedirectError(error)`, or the redirect
  is swallowed.
- **Authorization lives in the app, not the database:** there is no RLS, so every tenant query filters by
  `organizationId`, taken from the session context, never from an ID the client sent. Drizzle builds that context
  with `createOrgAuthContext`. Sessions come from `@kit/better-auth/context`.
- **Roles and permissions** are defined only in `packages/rbac/src/rbac.config.ts`; a role list or permission map
  elsewhere re-implements it.
- **Policies:** business rules via `definePolicy` in a registry (`@kit/policies`), never inline.
- **Other primitives:** the kit's logger, never `console.log`; the kit's mailer and email templates; i18n messages for
  every visible string; `@kit/ui/<name>` imports, no deep paths. `packages/ui/src/shadcn/` is upstream-owned: extend in
  `packages/ui/src/makerkit/`.
- **Prisma schema workflow:** edit `schema.prisma`, then `prisma:generate` and `prisma:migrate`; production runs
  `migrate deploy`. Never edit an applied migration. Every `organizationId` foreign key is non-null, indexed and
  cascades on delete.
- **Drizzle schema workflow:** app tables go in `schema.ts`, never in the Better Auth-generated `core.ts`, which the
  next generation overwrites. Run `drizzle:generate` then `drizzle:migrate`; never `push` in production; commit the
  `meta/` folder and never delete an applied migration, because the journal depends on both.
- **Layout:** feature code under `app/…/(internal)/<feature>/_lib/{actions,schemas,loaders}`.
- **Account mode** is `NEXT_PUBLIC_ACCOUNT_MODE`, not an ad hoc toggle; feature flags read the kit's `featuresFlag`
  export.
- **Deprecated:** whatever the kit's `AGENTS.md` and changelog mark so; check the version in the root `package.json`
  against the docs before calling an API deprecated.
