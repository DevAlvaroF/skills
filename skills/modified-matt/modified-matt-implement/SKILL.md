---
name: modified-matt-implement
description: "Implement a piece of work based on a spec or set of issues."
disable-model-invocation: true
---

Implement the work described by the user in the spec or issues.

Use /modified-matt-tdd where possible, at each issue's pre-agreed seams (its `testSeams` field).

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

Once done, use /modified-matt-code-review to review the work.

## Advance or close the issues

Updating the issues you implemented is part of the job, not an optional extra. Once the implementing agent's review is
done and the suite is green, advance every issue whose work landed
(`.myprds/<NN>-<feature-slug>/issues/<NN>-<slug>.json`; the directory and issue numbers are independent): flip every
satisfied entry in `acceptanceCriteria` to `"done": true` and set `"status": "done-coding-awaiting-final-review"`. This
state means the implementation and this skill's own review are complete, but independent final review is still pending;
this skill must never set `done-final-review`. Rewrite the whole file as strict JSON, keeping every other field (`id`,
`slug`, `title`, `spec`, `whatToBuild`, `blockedBy`, `testSeams`, `covers`, `comments`) intact — `comments` holds review history
that exists nowhere else, so dropping or emptying it loses it permanently. Re-read each file after writing to confirm it
still parses.

If an issue is only partly done, leave it open: tick only the criteria that are genuinely met and say which are
outstanding. Never tick a criterion you did not verify.

Then report which issues you advanced or closed and which you left open, with a one-line reason for each one still
open.

Do not commit, stage, or push anything — the user commits manually.

Instead, finish by returning a suggested commit message for the work: a concise imperative subject line (≤72 chars) plus
a short body explaining the *why* when the change isn't self-evident. Match the repo's existing commit style (check
`git log`). Include the path of each implemented issue JSON file, relative to the repository and beginning with
`.myprds/`. Also include the spec path from each issue's `spec` field, if set and not `null` (dedupe if several
issues share one). Include no tool or model attribution — no `Co-Authored-By` trailer, no "generated with" footer, no
emoji badge.

Before suggesting a commit message that references a spec path, **read that spec and scan it for secret-shaped strings**:
API keys and tokens, `sk-`/`ghp_`/`AKIA`-style prefixes, private key blocks, connection strings or URLs with embedded
credentials, `.env`-style assignments of a secret-looking name, and pasted customer data or PII. If you find any, stop:
do not suggest the commit, tell the user exactly what you found and where, and let them redact the spec first.
