# Issue tracker: Local Files

Specs for this repo live as markdown files in `.scratch/`; **tickets are JSON files**, so other software can read them without parsing prose.

## Conventions

- One feature per directory: `.scratch/<feature-slug>/`
- The spec is `.scratch/<feature-slug>/spec.md` (markdown: it is prose, not a ticket)
- Implementation issues are one JSON file per ticket at `.scratch/<feature-slug>/issues/<NN>-<slug>.json`, numbered from `01`, never a single combined tickets file
- Workflow state is the ticket's `status` field (see `triage-labels.md` for the canonical state strings)
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
  "whatToBuild": "The end-to-end behaviour this ticket makes work, from the user's perspective, not a layer-by-layer implementation list.",
  "blockedBy": ["<NN>-<slug>"],
  "acceptanceCriteria": [
    { "text": "Acceptance criterion 1", "done": false }
  ],
  "comments": [
    { "author": "<who>", "body": "<comment>" }
  ]
}
```

`blockedBy` holds the `<NN>-<slug>` id of each ticket that gates this one, and is `[]` when the ticket can start immediately. `comments` starts as `[]`.

The successful local implementation and review lifecycle is:

```text
ready-for-agent -> done-coding-awaiting-final-review -> done-final-review
```

`done-coding-awaiting-final-review` means coding, verification, and the implementing agent's own review are complete. Only the independent final reviewer sets `done-final-review`. If final review requires changes, return the ticket to `ready-for-agent` and append the findings to `comments`.

## When a skill says "publish to the issue tracker"

Create a new file under `.scratch/<feature-slug>/` (creating the directory if needed): a `.json` ticket under `issues/`, or a markdown file for a spec.

## When a skill says "fetch the relevant ticket"

Read the file at the referenced path and parse it as JSON. The user will normally pass the path or the ticket number directly.
