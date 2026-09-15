---
name: makerkit-custom-implement
description: "Implement a piece of work based on a spec or set of issues."
disable-model-invocation: true
---

Implement the work described by the user in the spec or issues.

**Read `.mysdd/issue-tracker.md` before you write anything.** It is the contract: directory layout, feature and issue
numbering, the issue JSON shape, and the status lifecycle. This skill does not restate it. If the file is missing, stop
and tell the user to run `/makerkit-custom-setup-skills`.

Read each issue you're implementing first (`.mysdd/<NN>-<feature-slug>/issues/<NN>-<slug>.json`) and work from its
`whatToBuild`, `acceptanceCriteria`, `testBoundaries` and `spec`. If an issue's `codeCommit` already holds a SHA, it has
been implemented: any further change to it is a final-review fix round, which belongs to the final reviewer, not this
skill. Stop for that issue and tell the user.

## Ground yourself first

**Before writing any code**, read the project's own documentation:

- the nearest `AGENTS.md` to the area in question — the root file is already in your context via `CLAUDE.md` — plus the
  vendored Next.js docs for anything Next.js. Read these directly; they're small and targeted. Where they and this
  description differ, **follow the repo**.
- the `README.md` of each app or package **actually involved** (`apps/*/README.md`, `packages/*/README.md`) — what that
  piece is and how it fits. Read directly, and only for the pieces the feature touches.
- the Makerkit docs under `docs/` — **dispatch a sub-agent; never walk the tree in this context.** It holds 150+
  upstream Makerkit `.mdoc` files. Name the one or two topic directories the feature touches (`docs/billing`,
  `docs/security`, `docs/data-fetching`, …) and ask the sub-agent how the feature is *meant* to work. Don't block on
  it: start on whatever part of the implementation doesn't depend on its answer while it works.

Use /makerkit-custom-tdd where possible, at each issue's pre-agreed boundaries (its `testBoundaries` field). If
implementation surfaces a boundary the issue doesn't list — or shows a listed one doesn't hold — stop and agree it with
the user before writing the test, then add it to that issue's `testBoundaries` when you write the file back.

If you hand parts of the work to sub-agents, split it **before** dispatching any. Give each sub-agent a disjoint set of
files and the test boundaries it owns. Do anything several slices depend on in this context first. That includes a
shared type, a migration or RLS policy, or a contract two apps or packages both change. Two sub-agents never edit the
same file. Don't split any part that depends on the docs sub-agent's answer until that answer is in. If the work won't
split without overlapping files, don't force it: implement it here, one piece after another. The review, the commit and
advancing the issues stay in this context.

Once the implementation is done, run the following in order:

1. **Review the work against the spec** — run the review in [REVIEW.md](./REVIEW.md). This step belongs to this skill and sits *outside* the repo's
   verification list; run it whether or not the repo mentions anything like it.
2. **The repo's verification steps**, from the root `AGENTS.md` § Verification, in the order given there. If that
   section is renamed, missing, or differs from this description, **follow the repo** — and say out loud which list you
   actually ran. Where one of those steps is a whole-repo run — the full test suite, a build, a lint sweep — **run it
   through a sub-agent**: its output is mostly noise this context never needs. Ask the sub-agent to run the repo's exact
   command and report only the failures (test or rule name, file, and the assertion or error line) under 200 words, plus
   an overall pass/fail verdict. Fix any failures here, then send it back to re-run.
3. **Commit the work, then advance the issues** — in that order, per _Commit the work_ and _Advance or close the
   issues_ below. The commit comes first because the issue records its SHA.

## Commit the work

Once this skill's own review is done and the suite is green, commit the work. This is part of the job, not an optional
extra: the issue's `codeCommit` is what points the final reviewer at the change, and it can't be written until the
commit exists.

1. **Don't commit an issue you left partly done.** If the work isn't finished, say so, leave the issue open, and stop
   there for that issue — no partial commit.
2. **Scan the spec for secrets first.** Before committing anything that references a spec path, **read that spec and
   scan it for secret-shaped strings**: API keys and tokens, `sk-`/`ghp_`/`AKIA`-style prefixes, private key blocks,
   connection strings or URLs with embedded credentials, `.env`-style assignments of a secret-looking name, and pasted
   customer data or PII. If you find any, stop: do not commit, tell the user exactly what you found and where, and let
   them redact the spec first.
3. **Check the branch.** If `HEAD` is the repo's default branch, stop and ask the user before committing.
4. **Stage the implementation files only.** Never `git add .mysdd/` and never `git add -A`. Then read
   `git status --short` and confirm nothing unrelated was swept in.
5. **Build the message.** The header is always `CODE: `: this skill only ever makes the first-round commit, on an issue
   whose `codeCommit` is `null`. `CODE REVIEW FIXES: ` commits belong to the final reviewer. Write the message to the
   shape in `.mysdd/issue-tracker.md` § Commit message format.
   That file is the schema of record for the message the same way it is for the issue shape; this skill does not
   restate it.
6. **One issue, one commit.** With several issues in a run, commit them one at a time in dependency order. Only when
   the work genuinely cannot be separated: one commit carrying an `Issue:` trailer per issue, and the same SHA recorded
   on each of them.
7. **Never push, never amend, never rebase.** One commit forward, nothing rewritten.

## Advance or close the issues

Updating the issues you implemented is part of the job, not an optional extra. Run it **after** the commit, so the SHA
exists: `git rev-parse HEAD` gives you the full SHA of the commit you just made.

Then rewrite each committed issue **once** (`.mysdd/<NN>-<feature-slug>/issues/<NN>-<slug>.json`; the directory and
issue numbers are independent), carrying all four changes together: flip every satisfied entry in
`acceptanceCriteria` to `"done": true`, set `"status": "done-coding-awaiting-final-review"`, record the SHA in
`codeCommit`, and append one `comments` entry summarising the run: the verification you ran with its final
output (the pass/fail summary, not the full log), the review outcome, and anything left open. Never write `reviewCodeCommit`: only the final reviewer sets it. The
`done-coding-awaiting-final-review` state means the implementation and this skill's own review are complete, but
independent final review is still pending; this skill must never set `done-final-review`. Rewrite the whole file as
strict JSON, keeping every other field (`id`, `slug`, `title`, `spec`, `whatToBuild`, `blockedBy`, `covers`,
`reviewCodeCommit`, `comments`) intact — `comments` holds review history that exists nowhere else, so dropping or
emptying it loses it permanently, and dropping either commit field loses the only pointer from the issue to the code. `testBoundaries` is the one field you may change: add a boundary the user agreed during implementation, never
remove one. Re-read each file after writing to confirm it still parses.

If an issue is only partly done, leave it open: tick only the criteria that are genuinely met and say which are
outstanding. Never tick a criterion you did not verify.

Then report, per issue: the commit SHA and its subject line, which issues you advanced or closed, and which you left
open with a one-line reason for each. Where `.mysdd/` is **tracked** rather than gitignored, the issue file is now dirty
in the working tree and deliberately outside the commit — say so, and leave it to the user rather than amending the
commit to chase its own SHA.
