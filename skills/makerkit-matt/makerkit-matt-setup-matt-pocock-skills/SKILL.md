---
name: makerkit-matt-setup-matt-pocock-skills
description: "Configure this repo for the engineering skills: set up its issue tracker, triage label vocabulary, and project doc layout. Run once before first use of the other engineering skills."
disable-model-invocation: true
---

# Setup Matt Pocock's Skills

Scaffold the per-repo configuration that the engineering skills assume:

- **Issue tracker**: local JSON ticket files under `.scratch/`
- **Triage labels**: the strings used for the seven canonical workflow state roles
- **Project docs**: which `AGENTS.md` files exist and the consumer rules for reading them

This is a prompt-driven skill, not a deterministic script. Explore, present what you found, confirm with the user, then write.

Generated config lives in `agents-docs/` at the repo root. That location is deliberately tool-agnostic: both Claude Code and Codex read the root `AGENTS.md`, which points at it. Do not write config into `docs/` — in a Makerkit repo that directory is upstream product documentation (`.mdoc` files), not agent config.

## Process

### 1. Explore

Look at the current repo to understand its starting state. Read whatever exists; don't assume:

- `AGENTS.md` and `CLAUDE.md` at the repo root: does either exist? Is there already an `## Agent skills` section in either? Note whether `CLAUDE.md` is a real document or just an `@AGENTS.md` import line.
- The full `AGENTS.md` distribution: `find . -name AGENTS.md -not -path '*/node_modules/*'`. In a Makerkit monorepo this returns the root file plus one per app and per package. Note which paths have their own and which don't.
- `agents-docs/`: does this skill's prior output already exist?
- `.scratch/`: a sign that a local file-based issue tracker convention is already in use
- Is the `makerkit-matt-triage` skill installed? (a `makerkit-matt-triage` skill folder alongside this one, or `makerkit-matt-triage` in your available skills.) This decides whether Section B runs at all.

### 2. Present findings and ask

Summarise what's present and what's missing. Then take the sections in order. One section, one answer, then the next.

Lead each section with the recommended answer so the user can accept it in a word. Give a one-line explainer only when the choice genuinely branches; skip the section entirely when exploration already settled it (Section B when `makerkit-matt-triage` isn't installed).

**Section A: Issue tracker.** These skills track work as local JSON ticket files under `.scratch/<NN>-<feature-slug>/issues/`, where `NN` is a two-digit feature sequence number, with specs as markdown alongside them. This is fixed — there's no tracker choice to make, so skip straight to writing `agents-docs/issue-tracker.md` from the local template without asking.

**Section B: Triage label vocabulary.** Skip this section entirely if the `makerkit-matt-triage` skill isn't installed (exploration told you), since an uninstalled skill needs no labels.

If it is installed, ask exactly one question:

> Do you want to keep the default triage labels? (recommended: **yes**)

The defaults are the seven canonical workflow state roles, each tracker string equal to its name: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `done-coding-awaiting-final-review`, `done-final-review`, `wontfix`. On **yes**, write them as-is. Only if the user says no, usually because their tracker already uses other names (e.g. `bug:triage` for `needs-triage`), collect the overrides so `makerkit-matt-triage` applies existing labels instead of creating duplicates.

**Section C: Project docs.** This repo documents itself through a **distribution of `AGENTS.md` files**: a root file that maps the monorepo, plus one per app and per package that owns the conventions for that subtree. There is no separate glossary file and no ADR directory; vocabulary and decisions live in whichever `AGENTS.md` owns the code they describe.

Write this without asking. Use the `AGENTS.md` inventory from exploration to fill in the layout section of the generated file — list the real paths you found, not a generic example. If exploration found **no** `AGENTS.md` files at all, say so and ask whether to seed a root one before continuing.

### 3. Confirm and edit

Show the user a draft of:

- The `## Agent skills` block to add to whichever of `AGENTS.md` / `CLAUDE.md` is being edited (see step 4 for selection rules)
- The contents of `agents-docs/issue-tracker.md`, `agents-docs/project-docs.md`, and `agents-docs/triage-labels.md` (the last only when `makerkit-matt-triage` is installed)

Let them edit before writing.

### 4. Write

**Pick the file to edit:**

- If `AGENTS.md` exists at the root, edit it. It is the file both Claude Code and Codex read, and in this repo `CLAUDE.md` is only an `@AGENTS.md` import.
- Else if `CLAUDE.md` exists as a real document, edit that.
- If neither exists, ask the user which one to create; don't pick for them.

Never create a second root instruction file when one already exists; always edit the one that's already there. Never edit a nested `AGENTS.md` (under `apps/` or `packages/`) for this block — the skills config is repo-wide and belongs at the root.

If an `## Agent skills` block already exists in the chosen file, update its contents in-place rather than appending a duplicate. Don't overwrite user edits to the surrounding sections.

The block:

```markdown
## Agent skills

### Issue tracker

[one-line summary of where issues are tracked]. See `agents-docs/issue-tracker.md`.

### Triage labels

[one-line summary of the label vocabulary]. See `agents-docs/triage-labels.md`.

### Project docs

Conventions live in a distribution of `AGENTS.md` files (root + per app/package). See `agents-docs/project-docs.md`.
```

Include the `### Triage labels` sub-block, and write `agents-docs/triage-labels.md`, only when `makerkit-matt-triage` is installed and Section B ran. When it isn't, both are omitted.

Then write the files under `agents-docs/`, using the seed templates in this skill folder as a starting point:

- [issue-tracker-local.md](./issue-tracker-local.md): local file-based issue tracker (JSON tickets)
- [triage-labels.md](./triage-labels.md): label mapping (only if `makerkit-matt-triage` is installed)
- [project-docs.md](./project-docs.md): `AGENTS.md` consumer rules + the repo's actual layout

### 5. Done

Tell the user the setup is complete and which engineering skills will now read from these files. Mention they can edit `agents-docs/*.md` directly later; re-running this skill is only necessary if they want to restart from scratch.
