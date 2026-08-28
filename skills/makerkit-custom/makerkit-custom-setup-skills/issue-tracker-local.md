# Issue tracker: Local Files

This file is the schema of record for the spec, issues, and implement skills. Those skills read the generated `.myprds/issue-tracker.md` rather than carrying their own copy — so a schema change starts here.

Specs for this repo live as markdown files in `.myprds/`; **issues are JSON files**, so other software can read them without parsing prose.

## Conventions

- One feature per directory: `.myprds/<NN>-<feature-slug>/`, where `NN` is a two-digit feature sequence number; start at `01` and increment the highest existing number for each new feature
- The spec is `.myprds/<NN>-<feature-slug>/spec.md` (markdown: it is prose, not an issue)
- Each implementation issue is one JSON file at `.myprds/<NN>-<feature-slug>/issues/<NN>-<slug>.json`, never a single combined issues file. The feature directory and issue filenames use independent `NN` sequences; issue numbering starts at `01` and increments the highest existing number in that feature's `issues/` directory (including `issues/archive/`). An issue's `id` and filename are **immutable once created**: never renumber an existing issue and never reuse a retired number — the number is an address that `blockedBy` references depend on, not a position in the running order.
- Workflow state is the issue's `status` field (see the lifecycle below for the canonical state strings)
- Comments and conversation history append to the issue's `comments` array, oldest first
- Every file under `issues/` is strict JSON: no comments, no trailing commas, every field present. Parse it, mutate the object, write the whole file back; never append loose text to an issue file

## Issue shape

Implementation issues (written by the issues skill):

```json
{
  "id": "<NN>",
  "slug": "<slug>",
  "title": "<Issue title>",
  "status": "ready-for-agent",
  "spec": ".myprds/<NN>-<feature-slug>/spec.md",
  "whatToBuild": "The end-to-end behaviour this issue makes work, from the user's perspective, not a layer-by-layer implementation list.",
  "blockedBy": ["<NN>"],
  "testSeams": ["<seam description>"],
  "covers": ["US-003"],
  "acceptanceCriteria": [
    { "text": "Acceptance criterion 1", "done": false }
  ],
  "comments": [
    { "author": "<who>", "body": "<comment>" }
  ]
}
```

`spec` is the path to the spec this issue was broken out of, relative to the repository root and beginning with `.myprds/`; `null` when there is no spec (issues drafted straight from a plan or conversation). `blockedBy` holds the `id` of each issue that gates this one, and is `[]` when the issue can start immediately. `testSeams` lists the public boundaries this issue's tests hit, confirmed with the user when the issue was drafted; `[]` when the issue has no dedicated tests. `covers` lists the `US-NNN` IDs from the spec's User Stories that this issue satisfies; `[]` when the issue satisfies no story directly, and always `[]` when `spec` is `null`. `comments` starts as `[]`.

The successful local implementation and review lifecycle is:

```text
ready-for-agent -> done-coding-awaiting-final-review -> done-final-review
```

`done-coding-awaiting-final-review` means coding, verification, and the implementing agent's own review are complete. Only the independent final reviewer sets `done-final-review`. If final review requires changes, return the issue to `ready-for-agent` and append the findings to `comments`.

## When a skill says "publish to the issue tracker"

Create a new file under `.myprds/<NN>-<feature-slug>/` (creating the directory if needed): a `.json` issue under `issues/`, or a markdown file for a spec.

## When a skill says "fetch the relevant issue"

Read the file at the referenced path and parse it as JSON. The user will normally pass the path or the issue number directly.
