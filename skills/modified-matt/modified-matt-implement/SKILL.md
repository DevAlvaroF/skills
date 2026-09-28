---
name: modified-matt-implement
description: "Implement, verify, commit and advance one or more issues from the project's issue tracker. Use when an issue under .mysdd/features/ is ready-for-agent and the user asks to implement it."
disable-model-invocation: true
---

Implement the work described by the user in the spec or issues.

**Read `.mysdd/issue-tracker.md` before you write anything.** It is the contract: directory layout, feature and issue
numbering, the issue JSON shape, and the status lifecycle. This skill does not restate it. If the file is missing, stop
and tell the user to run `/modified-matt-setup-skills`.

Read each issue you're implementing first (`.mysdd/features/<NN>-<feature-slug>/issues/<NN>-<slug>.json`) and work
from its `whatToBuild`, `acceptanceCriteria`, `testBoundaries` and `spec`. If an issue's `codeCommit` already holds a
SHA, it has been implemented: any further change to it is a final-review fix round. That belongs to phase 2 of
`/modified-matt-final-review`, the coder's triage of the review in a fresh session, not to this skill: stop for that
issue and tell the user. Run the tracker's ignore probe (`.mysdd/issue-tracker.md` § Ignore policy) with the issue
paths as targets before you start; if it reports an unresolved state, list the paths and stop until the user resolves
them.

Read the glossary and the binding ADRs for the paths you touch, per `.mysdd/docs/agents/domain.md`. ADRs are binding.

Use /modified-matt-tdd where possible, at each issue's pre-agreed boundaries (its `testBoundaries` field). If
implementation surfaces a boundary the issue doesn't list — or shows a listed one doesn't hold — stop and agree it with
the user before writing the test, then add it to that issue's `testBoundaries` when you write the file back.

**A recorded decision the code can't honour is a stop.** When the work can't be done without contradicting a binding
ADR, ask the user; never bend the code around the decision, and never rewrite the ADR unilaterally. If the user agrees
to change it, supersede it per `modified-matt-domain-modeling`'s rules. The ADR files that changed go into this
issue's commit.

If you hand parts of the work to sub-agents, split it **before** dispatching any. Give each sub-agent a disjoint set of
files and the test boundaries it owns. Do anything several slices depend on (a shared type, a schema, a contract two
slices both change) in this context first. Two sub-agents never edit the same file. If the work won't split without
overlapping files, don't force it: implement it here, one piece after another. The review, the commit and advancing the
issues stay in this context.

Run typechecking regularly and single test files regularly — those are short, and you need their output in hand to
drive the next cycle. Run the **full test suite once at the end, through a sub-agent**: suite output is mostly
passing-test noise and stack traces this context never needs. Ask it to run the suite and report only the failures —
test name, file, and the assertion or error line for each — under 200 words, plus an overall pass/fail verdict. Fix any
failures here, then send it back to re-run.

Once the implementation is done, run the review in [REVIEW.md](./REVIEW.md) on the work yourself. That
review belongs to this skill: run it before committing or advancing any issue, whether or not the repo documents
anything like it. Then commit the work and advance the issues, in that order — the commit comes first because the issue
records its SHA.

## Commit the work

Once this skill's own review is done and the suite is green, commit the work. This is part of the job, not an optional
extra: the issue's `codeCommit` is what points the final review at the change, and it can't be written until the
commit exists.

1. **Don't commit an issue you left partly done.** If the work isn't finished, say so, leave the issue open, and stop
   there for that issue — no partial commit.
2. **Scan the spec for secrets first.** Before committing anything that references a spec path, **read that spec and
   scan it for secret-shaped strings**: API keys and tokens, `sk-`/`ghp_`/`AKIA`-style prefixes, private key blocks,
   connection strings or URLs with embedded credentials, `.env`-style assignments of a secret-looking name, and pasted
   customer data or PII. If you find any, stop: do not commit, tell the user exactly what you found and where, and let
   them redact the spec first.
3. **Check the branch.** If `HEAD` is the repo's default branch, stop and ask the user before committing.
4. **Stage the implementation files**, plus the ADR file(s) the user agreed to change for this issue, each by path.
   Never `git add .mysdd/` and never `git add -A`. Then read `git status --short` and confirm nothing unrelated was
   swept in.
5. **Build the message.** The header is always `CODE: `: this skill only ever makes the first-round commit, on an issue
   whose `codeCommit` is `null`. `CODE REVIEW FIXES: ` commits belong to the final-review skill's phase 2. Write the
   message to the shape in `.mysdd/issue-tracker.md` § Commit message format.
   That file is the schema of record for the message the same way it is for the issue shape; this skill does not
   restate it.
6. **One issue, one commit.** With several issues in a run, commit them one at a time in dependency order. Only when
   the work genuinely cannot be separated: one commit carrying an `Issue:` trailer per issue, and the same SHA recorded
   on each of them.
7. **Capture each commit's SHA as it lands.** Straight after each commit, before the next one, read its full
   40-character SHA and confirm its subject and `Issue:` trailer(s) are the ones you wrote. Keep an explicit
   issue → SHA mapping for the run: by the time the issues are updated, `HEAD` names only the last commit, so reading
   it then would give every earlier issue the wrong SHA.
8. **Never push, never amend, never rebase.** One commit forward, nothing rewritten.

## Advance the issues

Updating the issues you implemented is part of the job, not an optional extra. Run it **after** the commits, so the
SHAs exist, and take each issue's SHA from the mapping _Commit the work_ step 7 kept — never from `HEAD` at update
time.

Re-run the ignore probe on the issue paths first. If it now reports an unresolved state, write nothing: report the
commit's full SHA and the paths, and leave the issue to the user. Then rewrite each committed issue **once**
(`.mysdd/features/<NN>-<feature-slug>/issues/<NN>-<slug>.json`; the directory and issue numbers are independent),
carrying all four changes together: flip every satisfied entry in
`acceptanceCriteria` to `"done": true`, set `"status": "done-coding-awaiting-final-review"`, record that issue's own SHA
from the mapping in `codeCommit`, and append one `comments` entry summarising the run — the implementation record in
`.mysdd/issue-tracker.md` § Comment records: the verification you ran with its final output (the pass/fail summary, not
the full log), the review outcome, anything left open, and any ADR the user agreed to supersede, with its replacement,
by number and title — the final review accepts that change, and lets it outrank the spec, only on this record. The same
entry carries a `Deviations and tradeoffs:` part: each place the work deviates from the issue or the spec, and each
deliberate tradeoff you made, with its reason — or `Deviations and tradeoffs: None.` when there were none. The coder
who later triages the review reads it to weigh each finding. Record only what this run decided; never reconstruct an
earlier run's reasoning as fact. Never write `reviewCodeCommit` or `reviewHistoryCommit`: only the final-review skill
sets them, `reviewCodeCommit` in phase 2 and `reviewHistoryCommit` in phase 1 after it commits its review record. The
`done-coding-awaiting-final-review` state means the implementation and this skill's own review are complete, but
independent final review is still pending; this skill must never set `done-final-review`. Rewrite the whole file as
strict JSON, keeping every other field (`id`, `slug`, `title`, `spec`, `whatToBuild`, `blockedBy`, `covers`,
`reviewCodeCommit`, `reviewHistoryCommit`, `comments`) intact, both review fields carried over verbatim — `comments`
holds review history that exists nowhere else, so dropping or emptying it loses it permanently, and dropping a commit
field loses the only pointer from the issue to that commit. `testBoundaries` is the one field you may change: add a
boundary the user agreed during implementation, never remove one. Re-read each file after writing to confirm it still
parses. If writing the issue fails after the commit succeeded, report the commit's full SHA and the error instead of
committing again.

If an issue is only partly done, leave it open: tick only the criteria that are genuinely met and say which are
outstanding. Never tick a criterion you did not verify.

Then report, per issue: the commit SHA and its subject line (the issue → SHA mapping), which issues you advanced, and
which you left open with a one-line reason for each. In **committed** mode the issue file is now dirty in the working
tree and deliberately outside the commit — say so, and leave it to the user rather than amending the commit to chase its
own SHA. In local mode it is ignored and stays out of every commit.
