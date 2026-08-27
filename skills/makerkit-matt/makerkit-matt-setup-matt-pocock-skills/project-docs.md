# Project Docs

How the engineering skills should consume this repo's own documentation when exploring the codebase.

This repo has no separate glossary file and no ADR directory. Conventions, vocabulary, and standing decisions live in a
**distribution of `AGENTS.md` files**: a root file that maps the monorepo, plus one per app and per package that owns
its subtree.

## Before exploring, read these

1. **Root `AGENTS.md`** — the monorepo map, the multi-tenant account model, the cross-cutting TypeScript / React /
   Next.js rules, and the verification steps every change must pass.
2. **The nearest `AGENTS.md` to the files you're touching.** Walk up from the file you're about to change to the closest
   ancestor that has one, and read it. It overrides and refines the root file for that subtree. When a change spans
   several packages, read each of their files.
3. **`apps/web/node_modules/next/dist/docs/`** before any Next.js work. The root `AGENTS.md` makes this mandatory:
   training data on Next.js is outdated, the vendored docs are the source of truth.

If a path you're working in has no `AGENTS.md` of its own, fall back to the nearest ancestor that does, and finally to
the root. **Proceed silently** — don't flag a missing file, and don't propose creating one upfront.

## Layout

> **PLACEHOLDER — REPLACE THIS BLOCK.** The tree below is not any real repo's layout. The setup skill must run the
> `find` below and write the actual paths it returns, each with a one-line note on what that subtree owns. If you are
> reading these `<>` placeholders in a generated `agents-docs/project-docs.md`, setup did not finish its job: run the
> `find` yourself and treat its output as the truth, not this block.

```
/
├── AGENTS.md                            ← <root: monorepo map + cross-cutting rules>
├── CLAUDE.md                            ← <present only if this repo has one>
├── agents-docs/                         ← generated agent config (this file, issue-tracker.md)
├── <app-dir>/
│   └── <app>/AGENTS.md                  ← <what this app owns>
└── <package-dir>/
    └── <package>/AGENTS.md              ← <what this package owns>
```

Re-Derive the list; never trust a remembered one or the one presented above, always confirm and iterate until filled in:

```sh
find . -name AGENTS.md -not -path '*/node_modules/*' | sort
```

Re-run it whenever the tree above looks stale — a path listed here that `find` doesn't return is wrong, and a path
`find` returns that isn't listed here is a file you're about to miss.

## Use the project's vocabulary

When your output names a project concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the
term as the relevant `AGENTS.md` uses it. The root file is authoritative for cross-cutting concepts such as the account
model, and each package file is authoritative for its own surface's symbols. (In a Makerkit repo expect roughly
**personal account**, **team account**, **member**, **role**, **permission** at the root, and `authActionClient`,
`enhanceRouteHandler`, `getSupabaseServerClient`, `@kit/ui/*` in the package files — examples to recognise, not the
list. Take the terms from the files.)

Prefer the existing term over a synonym. Don't say "workspace" where the docs say **team account**, "tenant" where they
say **account**, or "API route" where they say **route handler**.

If the concept you need isn't named anywhere in the `AGENTS.md` set, that's a signal: either you're inventing language
the project doesn't use (reconsider) or there's a real gap (note it for `/makerkit-matt-domain-modeling`, which records
new terms into the owning `AGENTS.md`).

## Flag conflicts with the docs

If your output contradicts a rule in an `AGENTS.md`, surface it explicitly rather than silently overriding:

> _`packages/next/AGENTS.md` says server actions go through `authActionClient`; this proposal bypasses it, which is
worth doing only because…_

The same applies to the root file's standing constraints — read them there. (In a Makerkit repo expect roughly: RLS as
the access-control mechanism, the admin client used sparingly with manual validation, no explicit return types, no
`any`, no client/server import mixing. Again: a recognition aid, not the list.) Contradicting one of these is a
decision, not an oversight — say so.

## Verification is part of the docs

The checks every change must pass are defined in the root `AGENTS.md` § Verification. **Read that section and run what
it says, in the order it says.** Expect roughly: typecheck, lint, format, an adversarial code review, plus a dedicated
RLS review for anything touching policies, grants, `SECURITY DEFINER` functions, views, migrations, or the database
directory. That description is a recognition aid so you can spot the section under a different heading — it is not the
list. If the section is renamed, missing, or differs, **follow the repo** and say which list you actually ran.

Treat that list as a hard requirement of any work these skills produce, not as advice — a ticket, spec, or refactor
proposal that can't pass it isn't done.

## Skills the repo publishes

An `AGENTS.md` may carry a `## Skills` section naming the specialist skills for its surface. **When you work on a
surface, invoke the skills its nearest `AGENTS.md` names.** They encode how this repo builds that surface — services,
server actions, forms, migrations, E2E tests — so they belong at implementation time, not at review time; a review can
flag that you built it the wrong way, but it can't give back the time.

Walk the same path you walk for the docs themselves: the nearest `AGENTS.md` first, then its ancestors. A surface whose
`AGENTS.md` has no `## Skills` section simply has none to invoke — that's not a gap to work around.
