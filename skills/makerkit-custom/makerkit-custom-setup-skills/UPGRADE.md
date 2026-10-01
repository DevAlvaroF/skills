# Upgrading an existing setup

Read the section for each thing step 1 found. Show every change as a per-file delta and get the user's answer before
writing: a local Feature file has no Git history, so there is no undo.

## The tracker, to contract 6

Contract 6 readers read the tracker whole, so the new file is the seed with the project's own sections after it — not
the old file patched. This covers a tracker at any lower contract, and one with no `Tracker contract:` line at all,
which predates contracts. A contract above 6 means this skill is older than the tracker: stop and have the user run
`npx skills update -p`.

A section is the project's own, and kept in its original order, when the old `Every operation also reads:` line named
it, or its heading is neither in the seed nor one of these retired seed headings:

- `## Contents`
- `## Conventions`
- `## Ignore policy`
- `## Ticket shape`
- `## Commit message format`
- `## Committing a Spec and its Issues`
- `## Recording a final review`
- `## Committing additional plans`
- `## Closing an issue`
- `## When a skill says "publish to the issue tracker"`
- `## When a skill says "fetch the relevant issue"`
- `## When a skill says "fetch the relevant ticket"`
- `## Wayfinding operations`

Every other section is replaced. When a replaced section holds text no seed had — the user's own edit — show it and
ask whether to keep it as a section of its own, under a heading no seed uses, so the next upgrade keeps it too.

Set `Tracker contract: 6` last, so an upgrade stopped halfway never claims a contract the file doesn't hold. Then the
file must hold exactly one `Tracker contract:` line, directly under the title, and keep its line endings. Report the
contract before (or none) and after, and each section kept and dropped.

## Issue files

Check every issue under `.mysdd/features/` against the seed's § Issue shape and list the drift per file:

- **Missing fields**: backfill `spec` to the Feature's `spec.md` (`null` when there is none), the three commit fields
  to `null` — never guess a SHA — and the rest to `[]`.
- **`testSeams`**: the old name of `testBoundaries`; rename the key and keep the array.
- **Unknown `status`**: list it and ask; never guess a mapping.
- **Shape violations**: a combined issues file, issues outside `issues/`, a shared `id`. Offer to split a combined
  file under the ids it already carries; never assign new ones.
- **Specs without `US-NNN` ids**: offer to number the User Stories in order, only while no issue in that Feature has a
  non-empty `covers`.
- **Misnamed Feature directories**: report and leave alone, since each issue's `spec` points at the path.

Never change live state while migrating: `status`, `acceptanceCriteria[].done`, `comments` and the commit fields hold
work that exists nowhere else. Write each issue back whole as strict JSON. A backfilled `covers` stays `[]`; tell the
user `/makerkit-custom-to-issues` maps stories to issues properly.

## Legacy `## Vocabulary` and `## Decisions`

An earlier version kept terms and decisions in these sections of an `AGENTS.md`; they now live in `.mysdd/docs/`,
where every skill looks. Load `makerkit-custom-domain-modeling` for the formats and propose, per entry: a term →
`.mysdd/docs/CONTEXT.md`; a decision → an ADR scoped to that `AGENTS.md`'s directory (no `scope` for the root file); a
superseded decision → an ADR whose `status` says so. Flag any entry naming an issue, a `US-NNN`, a spec or a Feature
path for the user to reword; never rewrite one silently. Remove a moved section from its `AGENTS.md` only once its new
home is written and not ignored: a decision never leaves a tracked file for an ignored one.
