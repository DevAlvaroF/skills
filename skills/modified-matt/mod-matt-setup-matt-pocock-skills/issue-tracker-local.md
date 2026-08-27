# Issue tracker: Local Files

Specs for this repo live as markdown files in `.scratch/`; **tickets are JSON files**, so other software can read them without parsing prose.

## Conventions

- One feature per directory: `.scratch/<NN>-<feature-slug>/`, where `NN` is a two-digit feature sequence number; start at `01` and increment the highest existing number for each new feature
- The spec is `.scratch/<NN>-<feature-slug>/spec.md` (markdown: it is prose, not a ticket)
- Implementation issues are one JSON file per ticket at `.scratch/<NN>-<feature-slug>/issues/<NN>-<slug>.json`, never a single combined tickets file. The feature directory and ticket filenames use independent `NN` sequences; ticket numbering starts at `01` and increments the highest existing number in that feature's `issues/` directory (including `issues/archive/`). A ticket's `id` and filename are **immutable once created**: never renumber an existing ticket and never reuse a retired number — the number is an address that `blockedBy` references depend on, not a position in the running order.
- Workflow state is the ticket's `status` field (see the lifecycle below for the canonical state strings)
- Comments and conversation history append to the ticket's `comments` array, oldest first
- Every file under `issues/` is strict JSON: no comments, no trailing commas, every field present. Parse it, mutate the object, write the whole file back; never append loose text to a ticket file

## Ticket shape

Implementation tickets (written by `/mod-matt-to-tickets`):

```json
{
  "id": "<NN>",
  "slug": "<slug>",
  "title": "<Ticket title>",
  "status": "ready-for-agent",
  "spec": ".scratch/<NN>-<feature-slug>/spec.md",
  "whatToBuild": "The end-to-end behaviour this ticket makes work, from the user's perspective, not a layer-by-layer implementation list.",
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

`spec` is the path to the spec this ticket was broken out of, relative to the repository root and beginning with `.scratch/`; `null` when there is no spec (tickets drafted straight from a plan or conversation). `blockedBy` holds the `id` of each ticket that gates this one, and is `[]` when the ticket can start immediately. `testSeams` lists the public boundaries this ticket's tests hit, confirmed with the user when the ticket was drafted; `[]` when the ticket has no dedicated tests. `covers` lists the `US-NNN` IDs from the spec's User Stories that this ticket satisfies; `[]` when the ticket satisfies no story directly, and always `[]` when `spec` is `null`. `comments` starts as `[]`.

The successful local implementation and review lifecycle is:

```text
ready-for-agent -> done-coding-awaiting-final-review -> done-final-review
```

`done-coding-awaiting-final-review` means coding, verification, and the implementing agent's own review are complete. Only the independent final reviewer sets `done-final-review`. If final review requires changes, return the ticket to `ready-for-agent` and append the findings to `comments`.

## When a skill says "publish to the issue tracker"

Create a new file under `.scratch/<NN>-<feature-slug>/` (creating the directory if needed): a `.json` ticket under `issues/`, or a markdown file for a spec.

## When a skill says "fetch the relevant ticket"

Read the file at the referenced path and parse it as JSON. The user will normally pass the path or the ticket number directly.
