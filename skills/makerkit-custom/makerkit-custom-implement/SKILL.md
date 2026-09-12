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
`whatToBuild`, `acceptanceCriteria`, `testBoundaries` and `spec`.

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

Once the implementation is done, run the following in order:

1. **Review the work against the spec** — detailed below. This step belongs to this skill and sits *outside* the repo's
   verification list; run it whether or not the repo mentions anything like it.
2. **The repo's verification steps**, from the root `AGENTS.md` § Verification, in the order given there. If that
   section is renamed, missing, or differs from this description, **follow the repo** — and say out loud which list you
   actually ran. Where one of those steps is a whole-repo run — the full test suite, a build, a lint sweep — **run it
   through a sub-agent**: its output is mostly noise this context never needs. Ask the sub-agent to run the repo's exact
   command and report only the failures (test or rule name, file, and the assertion or error line) under 200 words, plus
   an overall pass/fail verdict. Fix any failures here, then send it back to re-run.
3. **Commit the work, then advance the issues** — in that order, per _Commit the work_ and _Advance or close the
   issues_ below. The commit comes first because the issue records its SHA.

## Step 1 in detail: review the work

Check the diff against the originating issue / spec: does the code faithfully implement it? Standards conformance
(AGENTS.md, code smells) belongs to `/reviewer` in step 2 — this step is spec-fidelity only.

### Collect the diff

**Stay out of the full diff yourself.** The sub-agents below read it; in this context take only its shape:

```bash
git diff --stat HEAD
git status --short
```

If no uncommitted changes exist, the review target is the last commit instead:

```bash
git show --stat HEAD
```

Hand each sub-agent the *command* that reproduces the full diff — `git diff HEAD`, or `git show HEAD` when reviewing
the last commit — and let it run that itself. Never paste diff contents into a sub-agent prompt, and never read the
full diff into this context: it is the largest thing this skill touches, and doing both means paying for it twice.

### Process

#### 1. Identify the spec source

Look for the originating spec, in this order:

1. The `spec` field of the issue(s) you just implemented.
2. A path the user passed as an argument.
3. A spec file under `.mysdd/` matching the branch name or feature — never `docs/`, which is upstream Makerkit product
   documentation, not agent-authored specs.
4. If nothing is found, ask the user where the spec is. If they say there isn't one, the **Spec** sub-agent will skip
   and report "no spec available".

#### 2. Spawn the Spec sub-agent

Run this as a sub-agent so a large diff/spec doesn't pollute this skill's own context.

**Spec sub-agent prompt** should include:

- The diff command from _Collect the diff_ (the command, never the diff itself) and the commit list.
- The *path* to the spec. Pass the path only and let the sub-agent read it; don't read the spec into this context to
  paste it in.
- The brief: "Report: (a) requirements the spec asked for that are missing or partial; (b) behaviour in the diff that
  wasn't asked for (scope creep); (c) requirements that look implemented but where the implementation looks wrong. Quote
  the spec line for each finding. Under 400 words."

If the spec is missing, skip the Spec sub-agent and note this in the final report.

#### 3. Report

Present the sub-agent's findings under a `## Spec` heading, verbatim or lightly cleaned.

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
5. **Build the message.** Pick the header from the issue's `codeCommit` — `null` means `CODE: `, a SHA means
   `CODE REVIEW FIXES: `. Read `codeCommit`, never `status`: an issue coming back from final review keeps its
   `done-coding-awaiting-final-review` status, so the status can't tell you which round you're in. Write the message to
   the shape in `.mysdd/issue-tracker.md` § Commit message format.
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
issue numbers are independent), carrying all three changes together: flip every satisfied entry in
`acceptanceCriteria` to `"done": true`, set `"status": "done-coding-awaiting-final-review"`, and record the SHA — in
`codeCommit` when it was `null`, otherwise in `reviewCodeCommit`, overwriting whatever was there. The
`done-coding-awaiting-final-review` state means the implementation and this skill's own review are complete, but
independent final review is still pending; this skill must never set `done-final-review`. On a review-fix round the
issue is already in that state and stays there — re-asserting it changes nothing, and what records the round is
`reviewCodeCommit` plus the findings in `comments`, never a status move. Rewrite the whole file as
strict JSON, keeping every other field (`id`, `slug`, `title`, `spec`, `whatToBuild`, `blockedBy`, `covers`,
`codeCommit`, `reviewCodeCommit`, `comments`) intact — `comments` holds review history that exists nowhere else, so
dropping or emptying it loses it permanently, and dropping either commit field loses the only pointer from the issue to
the code. `testBoundaries` is the one field you may change: add a boundary the user agreed during implementation, never
remove one. Re-read each file after writing to confirm it still parses.

If an issue is only partly done, leave it open: tick only the criteria that are genuinely met and say which are
outstanding. Never tick a criterion you did not verify.

Then report, per issue: the commit SHA and its subject line, which issues you advanced or closed, and which you left
open with a one-line reason for each. Where `.mysdd/` is **tracked** rather than gitignored, the issue file is now dirty
in the working tree and deliberately outside the commit — say so, and leave it to the user rather than amending the
commit to chase its own SHA.
