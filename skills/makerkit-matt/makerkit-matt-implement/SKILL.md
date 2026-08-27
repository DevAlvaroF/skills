---
name: makerkit-matt-implement
description: "Implement a piece of work based on a spec or set of tickets."
disable-model-invocation: true
---

Implement the work described by the user in the spec or tickets.

Before writing code, read the root `AGENTS.md` and the nearest `AGENTS.md` to the code you're changing, so you inherit
the vocabulary, conventions, and recorded decisions for that subtree. For anything touching Next.js, read the relevant
doc under `apps/web/node_modules/next/dist/docs/` first: the vendored docs are the source of truth, not your training
data.

Use /makerkit-matt-tdd where possible, at each ticket's pre-agreed seams (its `testSeams` field).

Run `pnpm typecheck` regularly and single test files regularly; run the full test suite once at the end.

Once the implementation is done, run the root `AGENTS.md` verification list in order:

1. `pnpm typecheck`
2. `pnpm lint:fix`
3. `pnpm format:fix`
4. /reviewer
5. /rls-review — only if the change touched RLS or the database schema: any policy, grant, `SECURITY DEFINER` function,
   view, migration, or file under `apps/web/supabase/`.

Then use /makerkit-matt-code-review to review the work.

## Advance or close the tickets

Updating the tickets you implemented is part of the job, not an optional extra. Once the implementing agent's review is
done and the suite is green, advance every ticket whose work landed
(`.scratch/<NN>-<feature-slug>/issues/<NN>-<slug>.json`; the directory and ticket numbers are independent): flip every
satisfied entry in `acceptanceCriteria` to `"done": true` and set `"status": "done-coding-awaiting-final-review"`. This
state means the implementation and this skill's own review are complete, but independent final review is still pending;
this skill must never set `done-final-review`. Rewrite the whole file as strict JSON, keeping every other field (`id`,
`slug`, `title`, `spec`, `whatToBuild`, `blockedBy`, `testSeams`) intact. Re-read each file after writing to confirm it
still parses.

If a ticket is only partly done, leave it open: tick only the criteria that are genuinely met and say which are
outstanding. Never tick a criterion you did not verify.

Then report which tickets you advanced or closed and which you left open, with a one-line reason for each one still
open.

Do not commit, stage, or push anything — the user commits manually.

Instead, finish by returning a suggested commit message for the work: a concise imperative subject line (≤72 chars) plus
a short body explaining the *why* when the change isn't self-evident. Match the repo's existing commit style (check
`git log`). Include the path of each implemented ticket JSON file, relative to the repository and beginning with
`.scratch/`. Also include the spec path from each ticket's `spec` field, if set and not `null` (dedupe if several
tickets share one). Include no tool or model attribution — no `Co-Authored-By` trailer, no "generated with" footer, no
emoji badge.
