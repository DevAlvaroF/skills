---
name: makerkit-matt-implement
description: "Implement a piece of work based on a spec or set of tickets."
disable-model-invocation: true
---

Implement the work described by the user in the spec or tickets.

Before writing code, read `agents-docs/project-docs.md` and follow the doc-consumption rules it sets out. Expect roughly:
the root `AGENTS.md`, then the nearest `AGENTS.md` to the code you're changing, plus the vendored Next.js docs before any
Next.js work. Where that file and this description differ, **follow the repo**. If it doesn't exist — setup hasn't been
run — read the root and nearest `AGENTS.md` directly and tell the user to run `/makerkit-matt-setup-matt-pocock-skills`.

**If the nearest `AGENTS.md` has a `## Skills` section, invoke the skills it names while writing that surface's code.**
They encode how this repo builds services, server actions, forms, migrations and E2E tests; that's a decision made at
implementation time, not something the review steps below can retrofit.

Use /makerkit-matt-tdd where possible, at each ticket's pre-agreed seams (its `testSeams` field).

Run `pnpm typecheck` regularly, and run the tests covering what you just touched rather than saving them all for the
end; run the full suite once before verification. The repo owns the commands — `apps/e2e/AGENTS.md` § Running Tests for
Playwright and `apps/web/supabase/AGENTS.md` § Commands for the database. Expect roughly `pnpm test` for the full suite,
`pnpm --filter web-e2e exec playwright test <name> --workers=1` for a single E2E file, and `pnpm supabase:web:test` for
pgTAP. If a section is renamed, missing, or differs, **follow the repo** and say which command you ran.

Once the implementation is done, run the following in order:

1. **Review the work against the spec** — detailed below. This step belongs to this skill and sits *outside* the repo's
   verification list; run it whether or not the repo mentions anything like it.
2. **The repo's verification steps**, from the root `AGENTS.md` § Verification, in the order given there. Expect roughly:
   typecheck, lint, format, `/reviewer`, plus `/rls-review` for anything touching RLS, the database schema, or
   `apps/web/supabase/`. If that section is renamed, missing, or differs from this description, **follow the repo** —
   and say out loud which list you actually ran.

## Step 1 in detail: review the work

Check the diff against the originating issue / spec: does the code faithfully implement it? Standards conformance
(AGENTS.md, code smells) belongs to `/reviewer` in step 2 — this step is spec-fidelity only.

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
`slug`, `title`, `spec`, `whatToBuild`, `blockedBy`, `testSeams`, `covers`, `comments`) intact — `comments` holds review history
that exists nowhere else, so dropping or emptying it loses it permanently. Re-read each file after writing to confirm it
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

Before suggesting a commit message that references a spec path, **read that spec and scan it for secret-shaped strings**:
API keys and tokens, `sk-`/`ghp_`/`AKIA`-style prefixes, private key blocks, connection strings or URLs with embedded
credentials, `.env`-style assignments of a secret-looking name, and pasted customer data or PII. If you find any, stop:
do not suggest the commit, tell the user exactly what you found and where, and let them redact the spec first.
