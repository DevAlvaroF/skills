---
name: modified-matt-setup-skills
description: "Configure this repo for the engineering skills: set up its issue tracker and domain doc layout. Run once before first use of the other engineering skills."
disable-model-invocation: true
---

# Setup Matt Pocock's Skills

Scaffold the per-repo configuration that the engineering skills assume:

- **Issue tracker**: local JSON issue files under `.myprds/`
- **Domain docs**: where `CONTEXT.md` and ADRs live, and the consumer rules for reading them

This is a prompt-driven skill, not a deterministic script. Explore, present what you found, confirm with the user, then write.

## Process

### 1. Explore

Look at the current repo to understand its starting state. Read whatever exists; don't assume:

- `AGENTS.md` and `CLAUDE.md` at the repo root: does either exist? Is there already an `## Agent skills` section in either?
- `CONTEXT.md` and `CONTEXT-MAP.md` at the repo root
- `.myprds/docs/adr/`
- `.myprds/docs/agents/*.md`: does this skill's prior output already exist?
- `.myprds/`: existing feature directories, their `spec.md` files, and every JSON file under `issues/`. If any exist this is an upgrade rather than a first run, so read enough of them to answer Section C
- Monorepo signals: a `pnpm-workspace.yaml`, a `workspaces` field in `package.json`, or a populated `packages/*` with its own `src/`. These are present only in a genuinely large multi-package repo; their absence means single-context, which is almost every repo.

### 2. Present findings and ask

Summarise what's present and what's missing. Then take the sections in order. One section, one answer, then the next.

Lead each section with the recommended answer so the user can accept it in a word. Give a one-line explainer only when the choice genuinely branches; skip the section entirely when exploration already settled it (Section B when there's no monorepo).

**Section A: Issue tracker.** These skills track work as local JSON issue files under `.myprds/<NN>-<feature-slug>/issues/`, where `NN` is a two-digit feature sequence number, with specs as markdown alongside them. This is fixed — there's no tracker choice to make, so skip straight to writing `.myprds/docs/agents/issue-tracker.md` from the local template without asking.

**Section B: Domain docs.** Default to **single-context** (one `CONTEXT.md` + `.myprds/docs/adr/` at the repo root). This fits almost every repo; write it without asking.

Offer **multi-context** (a root `CONTEXT-MAP.md` pointing to per-context `CONTEXT.md` files) only when exploration found monorepo signals. Then confirm which layout they want.

**Section C: Existing `.myprds` content.** Skip this section entirely when step 1 found no feature directories.

When they exist, the repo was set up against an older version of these conventions, and the gap is worth naming before the other skills run against it. Check each feature directory for drift from the issue shape in [issue-tracker-local.md](./issue-tracker-local.md):

- **Missing fields.** An issue lacking `spec`, `blockedBy`, `testSeams`, `covers`, or `comments` predates that field. These are additive and safe to backfill: `spec` to that feature's `spec.md` when one exists and `null` when it doesn't, the rest to `[]`.
- **Unknown `status`.** Any value outside `ready-for-agent` / `done-coding-awaiting-final-review` / `done-final-review` came from an older lifecycle. Never guess a mapping — list each one and ask.
- **Shape violations.** A single combined issues file (one array rather than one file per issue), issues sitting directly in the feature directory instead of under `issues/`, or two issues sharing an `id`. Report each. Offer to split a combined file into per-issue files under the ids the issues already carry; never assign new ones.
- **Specs without story IDs.** A `spec.md` whose User Stories carry no `US-NNN` IDs predates them, so no issue's `covers` can reference it. Offer to backfill IDs sequentially in document order — safe only while nothing references them, so if any issue in that feature already has a non-empty `covers`, report it and leave the spec alone.
- **Non-conforming directory names.** A feature directory that isn't `<NN>-<feature-slug>`. Report it and leave it alone unless the user asks: the path is an address that each issue's `spec` field points at, so a rename has to rewrite those fields in the same pass.

Present the drift as a per-file list and ask whether to migrate. Never migrate silently, and never touch live state while doing it: `status`, `acceptanceCriteria[].done`, and `comments` hold work that exists nowhere else. `.myprds/` is usually gitignored, so assume there is no undo and get the answer before writing.

Backfilling real `covers` values is not this skill's job. Set them to `[]` and tell the user that re-running `/modified-matt-to-issues` against the spec maps stories to issues properly, reconciling against what is already on disk.

### 3. Confirm and edit

Show the user a draft of:

- The `## Agent skills` block to add to whichever of `CLAUDE.md` / `AGENTS.md` is being edited (see step 4 for selection rules)
- The contents of `.myprds/docs/agents/issue-tracker.md` and `.myprds/docs/agents/domain.md`
- Any `.myprds` migration agreed in Section C, as a per-file list

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

[one-line summary of where issues are tracked]. See `.myprds/docs/agents/issue-tracker.md`.

### Domain docs

[one-line summary of layout: "single-context" or "multi-context"]. See `.myprds/docs/agents/domain.md`.
```

Then write the docs files, using the seed templates in this skill folder as a starting point:

- [issue-tracker-local.md](./issue-tracker-local.md): local file-based issue tracker (JSON issues)
- [domain.md](./domain.md): domain doc consumer rules + layout

**Upgrade these files in place; do not regenerate them.** For each of `.myprds/docs/agents/issue-tracker.md` and `.myprds/docs/agents/domain.md`:

- If it doesn't exist, write it from the seed.
- If it does, read it and compare against the seed. Apply what the seed adds or changes; leave everything else as the user left it. Sections the file has and the seed doesn't are the user's own additions: keep them unless they contradict a seed section, and say which ones you kept.
- If the file and the seed are already equivalent, say so and write nothing.

Finally, apply whatever `.myprds` migration the user approved in Section C, one file at a time. Re-read each issue, mutate the parsed object, and write the whole file back as strict JSON. Report per file what changed.

### 5. Done

Tell the user the setup is complete and which engineering skills will now read from these files. Mention they can edit `.myprds/docs/agents/*.md` directly later, and that re-running this skill upgrades what is there in place — it diffs against the current seeds, audits `.myprds/`, and asks before changing anything.

Check `.gitignore`. If `.myprds/` is ignored, point out that `issue-tracker.md`, `domain.md`, and any ADRs under `.myprds/docs/adr/` won't be committed with the repo — so the `## Agent skills` block will point at files a fresh clone doesn't have, and this skill needs running again there. Offer to un-ignore `.myprds/docs/` so the generated config and the ADRs travel with the repo while the issue files stay local.

If Section C found drift, close with the follow-ups it left open: issues whose `covers` is now `[]` and wants a `/modified-matt-to-issues` pass, and anything reported but deliberately not migrated.
