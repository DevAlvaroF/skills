---
name: mod-matt-implement
description: "Implement a piece of work based on a spec or set of tickets."
disable-model-invocation: true
---

Implement the work described by the user in the spec or tickets.

Use /mod-matt-tdd where possible, at pre-agreed seams.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

Once done, use /mod-matt-code-review to review the work.

Do not commit, stage, or push anything — the user commits manually.

Instead, finish by returning a suggested commit message for the work: a concise imperative subject line (≤72 chars) plus a short body explaining the *why* when the change isn't self-evident. Match the repo's existing commit style (check `git log`). Include no tool or model attribution — no `Co-Authored-By` trailer, no "generated with" footer, no emoji badge.
