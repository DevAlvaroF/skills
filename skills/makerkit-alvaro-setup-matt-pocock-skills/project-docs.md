# Project Docs

How the engineering skills should consume this repo's own documentation when exploring the codebase.

This repo has no separate glossary file and no ADR directory. Conventions, vocabulary, and standing decisions live in a **distribution of `AGENTS.md` files**: a root file that maps the monorepo, plus one per app and per package that owns its subtree.

## Before exploring, read these

1. **Root `AGENTS.md`** — the monorepo map, the multi-tenant account model, the cross-cutting TypeScript / React / Next.js rules, and the verification steps every change must pass.
2. **The nearest `AGENTS.md` to the files you're touching.** Walk up from the file you're about to change to the closest ancestor that has one, and read it. It overrides and refines the root file for that subtree. When a change spans several packages, read each of their files.
3. **`apps/web/node_modules/next/dist/docs/`** before any Next.js work. The root `AGENTS.md` makes this mandatory: training data on Next.js is outdated, the vendored docs are the source of truth.

If a path you're working in has no `AGENTS.md` of its own, fall back to the nearest ancestor that does, and finally to the root. **Proceed silently** — don't flag a missing file, and don't propose creating one upfront.

## Layout

```
/
├── AGENTS.md                            ← monorepo map + cross-cutting rules
├── CLAUDE.md                            ← imports the root AGENTS.md; not a separate document
├── agents-docs/                         ← generated agent config (this file, issue-tracker.md, triage-labels.md)
├── apps/
│   ├── web/AGENTS.md                    ← main Next.js app
│   │   ├── app/[locale]/admin/AGENTS.md ← admin surface
│   │   └── supabase/AGENTS.md           ← schemas, migrations, RLS
│   └── e2e/AGENTS.md                    ← Playwright E2E tests
└── packages/
    ├── analytics/AGENTS.md
    ├── email-templates/AGENTS.md
    ├── features/AGENTS.md
    ├── mailers/AGENTS.md
    ├── mcp-server/AGENTS.md
    ├── next/AGENTS.md
    ├── policies/AGENTS.md
    ├── supabase/AGENTS.md
    └── ui/AGENTS.md
```

Re-derive this list rather than trusting it if it looks stale:

```sh
find . -name AGENTS.md -not -path '*/node_modules/*' | sort
```

## Use the project's vocabulary

When your output names a project concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as the relevant `AGENTS.md` uses it. The root file is authoritative for the account model — **personal account**, **team account**, **member**, **role**, **permission** — and each package file is authoritative for its own surface (`authActionClient`, `enhanceRouteHandler`, `getSupabaseServerClient`, `@kit/ui/*`, and so on).

Prefer the existing term over a synonym. Don't say "workspace" where the docs say **team account**, "tenant" where they say **account**, or "API route" where they say **route handler**.

If the concept you need isn't named anywhere in the `AGENTS.md` set, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/makerkit-alvaro-matt-domain-modeling`, which records new terms into the owning `AGENTS.md`).

## Flag conflicts with the docs

If your output contradicts a rule in an `AGENTS.md`, surface it explicitly rather than silently overriding:

> _`packages/next/AGENTS.md` says server actions go through `authActionClient`; this proposal bypasses it, which is worth doing only because…_

The same applies to the root file's standing constraints: RLS as the access-control mechanism, `getSupabaseServerAdminClient` used sparingly with manual validation, no explicit return types, no `any`, no client/server import mixing. Contradicting one of these is a decision, not an oversight — say so.

## Verification is part of the docs

The root `AGENTS.md` defines the checks every change must pass (`pnpm typecheck`, `pnpm lint:fix`, `pnpm format:fix`, `/reviewer`, and `/rls-review` for anything touching RLS, schema, or `apps/web/supabase/`). Treat that list as a hard requirement of any work these skills produce, not as advice — a ticket, spec, or refactor proposal that can't pass it isn't done.
