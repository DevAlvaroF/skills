---
name: makerkit-custom-setup-skills
description: "Configure this repo for the engineering skills: set up its issue tracker and map its AGENTS.md docs. Run once before first use of the other engineering skills."
disable-model-invocation: true
---

# Setup Matt Pocock's Skills

Scaffold the per-repo configuration that the engineering skills assume:

- **Issue tracker**: local JSON issue files under `.myprds/`, documented in `.myprds/issue-tracker.md`
- **Project docs**: nothing to generate — the repo's own `AGENTS.md` distribution is the documentation

This is a prompt-driven skill, not a deterministic script. Explore, present what you found, confirm with the user, then
write.

The one generated file is `.myprds/issue-tracker.md`, sitting alongside the issues it describes. The root `AGENTS.md`
points at it, so both Claude Code and Codex find it. Do not write config into `docs/` — in a Makerkit repo that
directory is upstream product documentation (`.mdoc` files), not agent config, and do not reintroduce a generated
project-docs file: the `AGENTS.md` files are read directly, with no index in between.

## Process

### 1. Explore

Look at the current repo to understand its starting state. Read whatever exists; don't assume:

- `AGENTS.md` and `CLAUDE.md` at the repo root: does either exist? Is there already an `## Agent skills` section in
  either? Note whether `CLAUDE.md` is a real document or just an `@AGENTS.md` import line.
- The full `AGENTS.md` distribution: `find . -name AGENTS.md -not -path '*/node_modules/*'`. In a Makerkit monorepo this
  returns the root file plus one per app and per package. Note which paths have their own and which don't.
- `.myprds/`: does `issue-tracker.md` — this skill's prior output — already exist? What feature directories, `spec.md`
  files, and JSON files under `issues/` are there? If any exist this is an upgrade rather than a first run, so read
  enough of them to answer Section C

### 2. Present findings and ask

Summarise what's present and what's missing. Then take the sections in order. One section, one answer, then the next.

Lead each section with the recommended answer so the user can accept it in a word. Give a one-line explainer only when
the choice genuinely branches.

**Section A: Issue tracker.** These skills track work as local JSON issue files under
`.myprds/<NN>-<feature-slug>/issues/`, where `NN` is a two-digit feature sequence number, with specs as markdown
alongside them. This is fixed — there's no tracker choice to make, so skip straight to writing
`.myprds/issue-tracker.md` from the local template without asking.

**Section B: Project docs.** Nothing is generated here. This repo documents itself through a **distribution of
`AGENTS.md` files**: a root file that maps the monorepo, plus one per app and per package that owns the conventions for
that subtree. There is no separate glossary file and no ADR directory; vocabulary and decisions live in whichever
`AGENTS.md` owns the code they describe, and the other skills read those files directly rather than a generated index.

So this section reports rather than writes. Show the user the
`find . -name AGENTS.md -not -path '*/node_modules/*' | sort` output from step 1, annotating each path with a one-line
note on what that subtree owns, taken from that file's own opening lines rather than guessed. That is the map the other
skills will navigate; naming it here is how the user sees whether a subtree is undocumented.

If `find` returned **no** `AGENTS.md` files at all, say so and ask whether to seed a root one before continuing —
without it the other skills have nothing to read.

**Section C: Existing `.myprds` content.** Skip this section entirely when step 1 found no feature directories.

When they exist, the repo was set up against an older version of these conventions, and the gap is worth naming before
the other skills run against it. Check each feature directory for drift from the issue shape
in [issue-tracker-local.md](./issue-tracker-local.md):

- **Missing fields.** An issue lacking `spec`, `blockedBy`, `testSeams`, `covers`, or `comments` predates that field.
  These are additive and safe to backfill: `spec` to that feature's `spec.md` when one exists and `null` when it
  doesn't, the rest to `[]`.
- **Unknown `status`.** Any value outside `ready-for-agent` / `done-coding-awaiting-final-review` / `done-final-review`
  came from an older lifecycle. Never guess a mapping — list each one and ask.
- **Shape violations.** A single combined issues file (one array rather than one file per issue), issues sitting
  directly in the feature directory instead of under `issues/`, or two issues sharing an `id`. Report each. Offer to
  split a combined file into per-issue files under the ids the issues already carry; never assign new ones.
- **Specs without story IDs.** A `spec.md` whose User Stories carry no `US-NNN` IDs predates them, so no issue's
  `covers` can reference it. Offer to backfill IDs sequentially in document order — safe only while nothing references
  them, so if any issue in that feature already has a non-empty `covers`, report it and leave the spec alone.
- **Non-conforming directory names.** A feature directory that isn't `<NN>-<feature-slug>`. Report it and leave it alone
  unless the user asks: the path is an address that each issue's `spec` field points at, so a rename has to rewrite
  those fields in the same pass.

Present the drift as a per-file list and ask whether to migrate. Never migrate silently, and never touch live state
while doing it: `status`, `acceptanceCriteria[].done`, and `comments` hold work that exists nowhere else. `.myprds/` is
usually gitignored, so assume there is no undo and get the answer before writing.

Backfilling real `covers` values is not this skill's job. Set them to `[]` and tell the user that re-running
`/makerkit-custom-to-issues` against the spec maps stories to issues properly, reconciling against what is already on
disk.

### 3. Confirm and edit

Show the user a draft of:

- The `## Agent skills` block to add to whichever of `AGENTS.md` / `CLAUDE.md` is being edited (see step 4 for selection
  rules)
- The contents of `.myprds/issue-tracker.md`
- Any `.myprds` migration agreed in Section C, as a per-file list

If `issue-tracker.md` already exists, show the **delta** rather than the whole file: what the current seed adds,
changes, or drops relative to what is on disk. A wall of unchanged text buries the one line that actually moved.

Let them edit before writing.

### 4. Write

**Pick the file to edit:**

- If `AGENTS.md` exists at the root, edit it. It is the file both Claude Code and Codex read, and in this repo
  `CLAUDE.md` is only an `@AGENTS.md` import.
- Else if `CLAUDE.md` exists as a real document, edit that.
- If neither exists, ask the user which one to create; don't pick for them.

Never create a second root instruction file when one already exists; always edit the one that's already there. Never
edit a nested `AGENTS.md` (under `apps/` or `packages/`) for this block — the skills config is repo-wide and belongs at
the root.

If an `## Agent skills` block already exists in the chosen file, update its contents in-place rather than appending a
duplicate. Don't overwrite user edits to the surrounding sections.

The block:

```markdown
## Agent skills

### Issue tracker

[one-line summary of where issues are tracked]. See `.myprds/issue-tracker.md`.

### Project docs

Conventions live in a distribution of `AGENTS.md` files (root + per app/package). Read the root file, then the nearest
`AGENTS.md` to the code you're touching. Where the nearest one has a `## Skills` section, invoke the skills it names.
```

Then write `.myprds/issue-tracker.md`, creating `.myprds/` if it doesn't exist, from the seed template in this skill
folder:

- [issue-tracker-local.md](./issue-tracker-local.md): local file-based issue tracker (JSON issues)

**Upgrade the file in place; do not regenerate it:**

- If it doesn't exist, write it from the seed.
- If it does, read it and compare against the seed. Apply what the seed adds or changes; leave everything else as the
  user left it. Sections the file has and the seed doesn't are the user's own additions: keep them unless they
  contradict a seed section, and say which ones you kept.
- If the file and the seed are already equivalent, say so and write nothing.

Section B writes nothing. If the repo needs a root `AGENTS.md` seeded, that was agreed there; otherwise leave every
`AGENTS.md` alone.

Finally, apply whatever `.myprds` migration the user approved in Section C, one file at a time. Re-read each issue,
mutate the parsed object, and write the whole file back as strict JSON. Report per file what changed.

### 5. Done

Tell the user the setup is complete and which engineering skills will now read from these files. Mention they can edit
`.myprds/issue-tracker.md` directly later, and that re-running this skill upgrades what is there in place — it diffs
against the current seed, re-runs the `AGENTS.md` `find`, audits `.myprds/`, and asks before changing anything.

If `.myprds/` is gitignored, point out that `issue-tracker.md` won't be committed with the repo, so a fresh clone needs
this skill run again.

If Section C found drift, close with the follow-ups it left open: issues whose `covers` is now `[]` and wants a
`/makerkit-custom-to-issues` pass, and anything reported but deliberately not migrated.
