---
name: mod-matt-implement
description: "Implement a piece of work based on a spec or set of tickets."
disable-model-invocation: true
---

Implement the work described by the user in the spec or tickets.

Use /mod-matt-tdd where possible, at pre-agreed seams.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

Once done, use /mod-matt-code-review to review the work.

## Advance or close the tickets

Updating the tickets you implemented is part of the job, not an optional extra. Once the implementing agent's review is
done and the suite is green, advance or close every ticket whose work landed. **How** depends on the tracker
`/mod-matt-setup-matt-pocock-skills` configured:

- **Local files** (`.scratch/<NN>-<feature-slug>/tickets/<NN>-<slug>.json`; the directory and ticket numbers are independent) → for each implemented ticket, flip every
  satisfied entry in `acceptanceCriteria` to `"done": true` and set
  `"status": "done-coding-awaiting-final-review"`. This state means the implementation and this skill's own review are
  complete, but independent final review is still pending; this skill must never set `done-final-review`. Rewrite the
  whole file as strict JSON, keeping every other field (`id`, `slug`, `title`, `whatToBuild`, `blockedBy`) intact. Re-read
  each file after writing to confirm it still parses.
- **A real issue tracker (GitHub, Linear, …)** → close each implemented issue (`gh issue close <N>` or the tracker's
  equivalent), tick the acceptance-criteria checkboxes in the body, and leave a one-paragraph comment saying what
  landed. Do NOT close or modify the parent issue.

If a ticket is only partly done, leave it open: tick only the criteria that are genuinely met and say which are
outstanding. Never tick a criterion you did not verify.

Then report which tickets you advanced or closed and which you left open, with a one-line reason for each one still
open.

Do not commit, stage, or push anything — the user commits manually.

Instead, finish by returning a suggested commit message for the work: a concise imperative subject line (≤72 chars) plus
a short body explaining the *why* when the change isn't self-evident. Match the repo's existing commit style (check
`git log`). Include the path of each implemented ticket JSON file and the feature's `spec.md` file path, each relative
to the repository and beginning with `.scratch/`. Include no tool or model attribution — no `Co-Authored-By` trailer, no
"generated with" footer, no emoji badge.
