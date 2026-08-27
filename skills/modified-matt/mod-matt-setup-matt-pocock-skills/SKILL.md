---
name: mod-matt-setup-matt-pocock-skills
description: "Configure this repo for the engineering skills: set up its issue tracker and domain doc layout. Run once before first use of the other engineering skills."
disable-model-invocation: true
---

# Setup Matt Pocock's Skills

Scaffold the per-repo configuration that the engineering skills assume:

- **Issue tracker**: local JSON ticket files under `.scratch/`
- **Domain docs**: where `CONTEXT.md` and ADRs live, and the consumer rules for reading them

This is a prompt-driven skill, not a deterministic script. Explore, present what you found, confirm with the user, then write.

## Process

### 1. Explore

Look at the current repo to understand its starting state. Read whatever exists; don't assume:

- `AGENTS.md` and `CLAUDE.md` at the repo root: does either exist? Is there already an `## Agent skills` section in either?
- `CONTEXT.md` and `CONTEXT-MAP.md` at the repo root
- `agents-docs/adr/` and any `src/*/agents-docs/adr/` directories
- `agents-docs/*.md`: does this skill's prior output already exist?
- `.scratch/`: existing feature directories, their `spec.md` files, and every JSON file under `issues/`. If any exist this is an upgrade rather than a first run, so read enough of them to answer Section C
- Monorepo signals: a `pnpm-workspace.yaml`, a `workspaces` field in `package.json`, or a populated `packages/*` with its own `src/`. These are present only in a genuinely large multi-package repo; their absence means single-context, which is almost every repo.

### 2. Present findings and ask

Summarise what's present and what's missing. Then take the sections in order. One section, one answer, then the next.

Lead each section with the recommended answer so the user can accept it in a word. Give a one-line explainer only when the choice genuinely branches; skip the section entirely when exploration already settled it (Section B when there's no monorepo).

**Section A: Issue tracker.** These skills track work as local JSON ticket files under `.scratch/<NN>-<feature-slug>/issues/`, where `NN` is a two-digit feature sequence number, with specs as markdown alongside them. This is fixed — there's no tracker choice to make, so skip straight to writing `agents-docs/issue-tracker.md` from the local template without asking.

**Section B: Domain docs.** Default to **single-context** (one `CONTEXT.md` + `agents-docs/adr/` at the repo root). This fits almost every repo; write it without asking.

Offer **multi-context** (a root `CONTEXT-MAP.md` pointing to per-context `CONTEXT.md` files) only when exploration found monorepo signals. Then confirm which layout they want.

**Section C: Existing `.scratch` content.** Skip this section entirely when step 1 found no feature directories.

When they exist, the repo was set up against an older version of these conventions, and the gap is worth naming before the other skills run against it. Check each feature directory for drift from the ticket shape in [issue-tracker-local.md](./issue-tracker-local.md):

- **Missing fields.** A ticket lacking `spec`, `blockedBy`, `testSeams`, `covers`, or `comments` predates that field. These are additive and safe to backfill: `spec` to that feature's `spec.md` when one exists and `null` when it doesn't, the rest to `[]`.
- **Unknown `status`.** Any value outside `ready-for-agent` / `done-coding-awaiting-final-review` / `done-final-review` came from an older lifecycle. Never guess a mapping — list each one and ask.
- **Shape violations.** A single combined tickets file (one array rather than one file per ticket), tickets sitting directly in the feature directory instead of under `issues/`, or two tickets sharing an `id`. Report each. Offer to split a combined file into per-ticket files under the ids the tickets already carry; never assign new ones.
- **Specs without story IDs.** A `spec.md` whose User Stories carry no `US-NNN` IDs predates them, so no ticket's `covers` can reference it. Offer to backfill IDs sequentially in document order — safe only while nothing references them, so if any ticket in that feature already has a non-empty `covers`, report it and leave the spec alone.
- **Non-conforming directory names.** A feature directory that isn't `<NN>-<feature-slug>`. Report it and leave it alone unless the user asks: the path is an address that each ticket's `spec` field points at, so a rename has to rewrite those fields in the same pass.

Present the drift as a per-file list and ask whether to migrate. Never migrate silently, and never touch live state while doing it: `status`, `acceptanceCriteria[].done`, and `comments` hold work that exists nowhere else. `.scratch/` is usually gitignored, so assume there is no undo and get the answer before writing.

Backfilling real `covers` values is not this skill's job. Set them to `[]` and tell the user that re-running `/mod-matt-to-tickets` against the spec maps stories to tickets properly, reconciling against what is already on disk.

### 3. Confirm and edit

Show the user a draft of:

- The `## Agent skills` block to add to whichever of `CLAUDE.md` / `AGENTS.md` is being edited (see step 4 for selection rules)
- The contents of `agents-docs/issue-tracker.md` and `agents-docs/domain.md`
- Any `.scratch` migration agreed in Section C, as a per-file list

For a file that already exists, show the **delta** rather than the whole file: what the current seed adds, changes, or drops relative to what is on disk. A wall of unchanged text buries the one line that actually moved.

Let them edit before writing.

### 4. Write

**Pick the file to edit:**

- If `CLAUDE.md` exists, edit it.
- Else if `AGENTS.md` exists, edit it.
- If neither exists, ask the user which one to create; don't pick for them.

Never create `AGENTS.md` when `CLAUDE.md` already exists (or vice versa); always edit the one that's already there.

If an `## Agent skills` block already exists in the chosen file, update its contents in-place rather than appending a duplicate. Don't overwrite user edits to the surrounding sections.

The block:

```markdown
## Agent skills

### Issue tracker

[one-line summary of where issues are tracked]. See `agents-docs/issue-tracker.md`.

### Domain docs

[one-line summary of layout: "single-context" or "multi-context"]. See `agents-docs/domain.md`.
```

Then write the docs files, using the seed templates in this skill folder as a starting point:

- [issue-tracker-local.md](./issue-tracker-local.md): local file-based issue tracker (JSON tickets)
- [domain.md](./domain.md): domain doc consumer rules + layout

**Upgrade these files in place; do not regenerate them.** For each of `agents-docs/issue-tracker.md` and `agents-docs/domain.md`:

- If it doesn't exist, write it from the seed.
- If it does, read it and compare against the seed. Apply what the seed adds or changes; leave everything else as the user left it. Sections the file has and the seed doesn't are the user's own additions: keep them unless they contradict a seed section, and say which ones you kept.
- If the file and the seed are already equivalent, say so and write nothing.

Finally, apply whatever `.scratch` migration the user approved in Section C, one file at a time. Re-read each ticket, mutate the parsed object, and write the whole file back as strict JSON. Report per file what changed.

### 5. Done

Tell the user the setup is complete and which engineering skills will now read from these files. Mention they can edit `agents-docs/*.md` directly later, and that re-running this skill upgrades what is there in place — it diffs against the current seeds, audits `.scratch/`, and asks before changing anything.

If Section C found drift, close with the follow-ups it left open: tickets whose `covers` is now `[]` and wants a `/mod-matt-to-tickets` pass, and anything reported but deliberately not migrated.
