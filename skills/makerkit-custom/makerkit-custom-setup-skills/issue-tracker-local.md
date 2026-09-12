# Issue tracker: Local Files

This file is the schema of record for the spec, issues, and implement skills. Those skills read the generated
`.mysdd/issue-tracker.md` rather than carrying their own copy — so a schema change starts here.

Specs for this repo live as markdown files in `.mysdd/`; **issues are JSON files**, so other software can read them
without parsing prose.

## Conventions

- One feature per directory: `.mysdd/<NN>-<feature-slug>/`, where `NN` is a two-digit feature sequence number; start at
  `01` and increment the highest existing number for each new feature
- The spec is `.mysdd/<NN>-<feature-slug>/spec.md` (markdown: it is prose, not an issue)
- Each implementation issue is one JSON file at `.mysdd/<NN>-<feature-slug>/issues/<NN>-<slug>.json`, never a single
  combined issues file. The feature directory and issue filenames use independent `NN` sequences; issue numbering starts
  at `01` and increments the highest existing number in that feature's `issues/` directory (including `issues/archive/`).
  An issue's `id` and filename are **immutable once created**: never renumber an existing issue and never reuse a
  retired number — the number is an address that `blockedBy` references depend on, not a position in the running order.
- Workflow state is the issue's `status` field (see the lifecycle below for the canonical state strings)
- Comments and conversation history append to the issue's `comments` array, oldest first
- Every file under `issues/` is strict JSON: no comments, no trailing commas, every field present. Parse it, mutate the
  object, write the whole file back; never append loose text to an issue file

## Issue shape

Implementation issues (written by the issues skill):

```json
{
  "id": "<NN>",
  "slug": "<slug>",
  "title": "<Issue title>",
  "status": "ready-for-agent",
  "spec": ".mysdd/<NN>-<feature-slug>/spec.md",
  "whatToBuild": "The end-to-end behaviour this issue makes work, from the user's perspective, not a layer-by-layer implementation list.",
  "blockedBy": [
    "<NN>"
  ],
  "testBoundaries": [
    "<boundary description>"
  ],
  "covers": [
    "US-003"
  ],
  "codeCommit": null,
  "reviewCodeCommit": null,
  "acceptanceCriteria": [
    {
      "text": "Acceptance criterion 1",
      "done": false
    }
  ],
  "comments": [
    {
      "author": "<who>",
      "body": "<comment>"
    }
  ]
}
```

`spec` is the path to the spec this issue was broken out of, relative to the repository root and beginning with
`.mysdd/`; `null` when there is no spec (issues drafted straight from a plan or conversation). `blockedBy` holds the `id`
of each issue that gates this one, and is `[]` when the issue can start immediately. `testBoundaries` lists the public
boundaries this issue's tests hit, confirmed with the user when the issue was drafted; `[]` when the issue has no
dedicated tests. `covers` lists the `US-NNN` IDs from the spec's User Stories that this issue satisfies; `[]` when the
issue satisfies no story directly, and always `[]` when `spec` is `null`. `codeCommit` is the full SHA of the commit
that implemented the issue, and `reviewCodeCommit` the full SHA of the commit that applied the final reviewer's
findings; both are single strings or `null`, and both start as `null`. Neither is ever set by hand: the implement skill
writes them when it commits, and every other skill carries them over verbatim. A further round of review fixes
overwrites `reviewCodeCommit` — the superseded SHA stays reachable through git history and the `comments` trail.
`comments` starts as `[]`.

The successful local implementation and review lifecycle is:

```text
ready-for-agent -> done-coding-awaiting-final-review -> done-final-review
```

`done-coding-awaiting-final-review` means coding, verification, and the implementing agent's own review are complete.
Only the independent final reviewer sets `done-final-review`. If final review requires changes, the issue stays at
`done-coding-awaiting-final-review` — do not return it to `ready-for-agent`. Append the findings to `comments`, fix
the issues found, and produce the `CODE REVIEW FIXES:` commit: the issue already carries a `codeCommit`, so that
round records its SHA in `reviewCodeCommit` instead. A fix round is visible through `reviewCodeCommit` and the `comments`
trail, never through a status change.

## Commit message format

Every commit an implement skill makes for an issue uses this shape:

```text
CODE: <imperative subject>

<one to three lines on the why, when the change isn't self-evident>

Issue: .mysdd/<NN>-<feature-slug>/issues/<NN>-<slug>.json
Spec: .mysdd/<NN>-<feature-slug>/spec.md
```

- The header prefix is one of exactly two literals: `CODE: ` or `CODE REVIEW FIXES: `. Nothing else. Pick it from the
  issue's `codeCommit`: `null` means this is the first implementation round, so `CODE: `; a SHA means the issue has
  already been implemented and committed and final review has since asked for changes, so `CODE REVIEW FIXES: `. The
  header follows `codeCommit`, never `status` — a fix round leaves the status where it is.
- The whole subject line, prefix included, is ≤72 characters.
- One `Issue:` trailer per issue in the commit, repo-root-relative and beginning `.mysdd/`.
- A `Spec:` trailer only when the issue's `spec` is not `null`, deduped when several issues in one commit share a spec.
- No tool or model attribution — no `Co-Authored-By` trailer, no "generated with" footer, no emoji badge. The message
  must read the same whichever agent, or human, produced it.

A first-round commit:

```text
CODE: Gate workspace switching behind the seat check

A member without an active seat could still switch into a workspace via the
URL. The guard now runs before the loader resolves.

Issue: .mysdd/03-workspace-seats/issues/02-seat-guard.json
Spec: .mysdd/03-workspace-seats/spec.md
```

A commit applying final-review findings on the same issue:

```text
CODE REVIEW FIXES: Seat guard — handle the revoked-seat race

Issue: .mysdd/03-workspace-seats/issues/02-seat-guard.json
Spec: .mysdd/03-workspace-seats/spec.md
```

## When a skill says "publish to the issue tracker"

Create a new file under `.mysdd/<NN>-<feature-slug>/` (creating the directory if needed): a `.json` issue under
`issues/`, or a markdown file for a spec.

## When a skill says "fetch the relevant issue"

Read the file at the referenced path and parse it as JSON. The user will normally pass the path or the issue number
directly.
