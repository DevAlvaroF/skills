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

Once the implementation is done, run the following in order:

1. **Review the work against the spec** — detailed below.
2. `pnpm typecheck`
3. `pnpm lint:fix`
4. `pnpm format:fix`
5. /reviewer
6. /rls-review — only if the change touched RLS or the database schema: any policy, grant, `SECURITY DEFINER` function,
   view, migration, or file under `apps/web/supabase/`.

## Step 1 in detail: review the work

Check the diff against the originating issue / spec: does the code faithfully implement it? Standards conformance
(AGENTS.md, code smells) is `/reviewer`'s job at step 5 — this step is spec-fidelity only.

The issue tracker should have been provided to you. If `agents-docs/issue-tracker.md` is missing, tell the user to run
`/makerkit-matt-setup-matt-pocock-skills`.

### Collect the diff

```bash
git diff HEAD
git status --short
```

If no uncommitted changes exist, review the last commit:

```bash
git show --stat HEAD
git show HEAD
```

### Process

#### 1. Identify the spec source

Look for the originating spec, in this order:

1. A `.scratch/<NN>-<feature-slug>/` path referenced in the commit messages (per this skill's convention of including
   the ticket and `spec.md` paths in its suggested commit message).
2. A path the user passed as an argument.
3. A spec file under `.scratch/` or `specs/` matching the branch name or feature. Do **not** treat `docs/` as a spec
   location: in this repo it holds upstream Makerkit product documentation (`.mdoc` files), not agent-authored specs.
4. If nothing is found, ask the user where the spec is. If they say there isn't one, the **Spec** sub-agent will skip
   and report "no spec available".

#### 2. Spawn the Spec sub-agent

Run this as a sub-agent so a large diff/spec doesn't pollute this skill's own context.

**Spec sub-agent prompt** should include:

- The diff (from _Collect the diff_ above).
- The path or fetched contents of the spec.
- The brief: "Report: (a) requirements the spec asked for that are missing or partial; (b) behaviour in the diff that
  wasn't asked for (scope creep); (c) requirements that look implemented but where the implementation looks wrong. Quote
  the spec line for each finding. Under 400 words."

If the spec is missing, skip the Spec sub-agent and note this in the final report.

#### 3. Report

Present the sub-agent's findings under a `## Spec` heading, verbatim or lightly cleaned.

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
