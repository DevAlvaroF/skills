---
name: makerkit-matt-implement
description: "Implement a piece of work based on a spec or set of tickets."
disable-model-invocation: true
---

Implement the work described by the user in the spec or tickets.

Before writing code, read the root `AGENTS.md` and the nearest `AGENTS.md` to the code you're changing, so you inherit the vocabulary, conventions, and recorded decisions for that subtree. For anything touching Next.js, read the relevant doc under `apps/web/node_modules/next/dist/docs/` first: the vendored docs are the source of truth, not your training data.

Use /makerkit-matt-tdd where possible, at pre-agreed seams.

Run `pnpm typecheck` regularly and single test files regularly; run the full test suite once at the end.

Once the implementation is done, run the root `AGENTS.md` verification list in order:

1. `pnpm typecheck`
2. `pnpm lint:fix`
3. `pnpm format:fix`
4. /reviewer
5. /rls-review — only if the change touched RLS or the database schema: any policy, grant, `SECURITY DEFINER` function, view, migration, or file under `apps/web/supabase/`.

Then use /makerkit-matt-code-review to review the work.

Commit your work to the current branch.
