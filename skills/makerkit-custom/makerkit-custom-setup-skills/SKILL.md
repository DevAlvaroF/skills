---
name: makerkit-custom-setup-skills
description: "Configure this repo for the engineering skills: set up its issue tracker and domain docs under .mysdd/, keep .mysdd/ out of .gitignore, and map its AGENTS.md conventions. Run once before first use of the other engineering skills."
disable-model-invocation: true
---

# Setup the Makerkit engineering skills

Scaffold the per-repo configuration that the engineering skills assume:

- **Issue tracker**: local JSON issue files under `.mysdd/`, documented in `.mysdd/issue-tracker.md`
- **Domain docs**: a glossary (`.mysdd/docs/CONTEXT.md`) and scoped ADRs (`.mysdd/docs/adr/`), with the rules for
  reading them in `.mysdd/docs/agents/domain.md`
- **Conventions**: nothing to generate — the repo's own `AGENTS.md` distribution is the documentation

This is a prompt-driven skill, not a deterministic script. Explore, present what you found, confirm with the user, then
write.

The root `AGENTS.md` points at both generated files, so Claude Code and Codex find them. Never write config into
`docs/`: in a Makerkit repo that is upstream product documentation (`.mdoc` files). Don't seed `CONTEXT.md` or `adr/`;
`makerkit-custom-domain-modeling` creates them lazily. `.mysdd/` is always committed, never gitignored.

## Process

### 1. Explore

Look at the current repo to understand its starting state. Read whatever exists; don't assume:

- `AGENTS.md` and `CLAUDE.md` at the repo root: does either exist? Is there already an `## Agent skills` section in
  either? Note whether `CLAUDE.md` is a real document or just an `@AGENTS.md` import line.
- The full `AGENTS.md` distribution: `find . -name AGENTS.md -not -path '*/node_modules/*' | sort`. In a Makerkit
  monorepo this returns the root file plus one per app and per package. Note which carry a `## Vocabulary` or
  `## Decisions` section: those are legacy entries for Section D.
- `.mysdd/`: do `issue-tracker.md` and `docs/agents/domain.md` — this skill's prior output — already exist? What
  feature directories, `spec.md` files, and JSON files under `issues/` are there? If any exist this is an upgrade rather
  than a first run, so read enough of them to answer Section C.
- Whether git ignores any of it: `git check-ignore -v .mysdd/docs .mysdd/issue-tracker.md`, then
  `git ls-files -oi --exclude-standard -- .mysdd | git check-ignore -v --stdin` for anything else under it.

### 2. Present findings and ask

Summarise what's present and what's missing. Then take the sections in order. One section, one answer, then the next.

Lead each section with the recommended answer so the user can accept it in a word. Give a one-line explainer only when
the choice genuinely branches.

**Section A: Issue tracker.** These skills track work as local JSON issue files under
`.mysdd/<NN>-<feature-slug>/issues/`, where `NN` is a two-digit feature sequence number, with specs as markdown
alongside them. This is fixed — there's no tracker choice to make, so skip straight to writing
`.mysdd/issue-tracker.md` from the local template without asking.

If step 1 found a rule ignoring `.mysdd` or anything under it, show each rule with its file and line and offer to remove
it. This isn't optional: the other skills stop on an ignored `.mysdd/`. A rule in `.git/info/exclude` or the global
excludes file isn't committed, so the user removes it there. Files the rule was hiding need a first commit.

**Section B: Domain docs.** Write `.mysdd/docs/agents/domain.md` from the seed without asking. Then show the
`AGENTS.md` map from step 1, annotating each path with a one-line note on what that subtree owns, taken from that file's
own opening lines rather than guessed. That is the conventions map the other skills navigate; naming it here is how the
user sees whether a subtree is undocumented.

If `find` returned **no** `AGENTS.md` files at all, say so and ask whether to seed a root one before continuing —
without it the `## Agent skills` block has nowhere to live.

**Section C: Existing `.mysdd` content.** Skip this section entirely when step 1 found no feature directories.

When they exist, the repo was set up against an older version of these conventions, and the gap is worth naming before
the other skills run against it. Check each feature directory for drift from the issue shape
in [issue-tracker-local.md](./issue-tracker-local.md):

- **Missing fields.** An issue lacking `spec`, `blockedBy`, `testBoundaries`, `covers`, `codeCommit`,
  `reviewCodeCommit`, or `comments` predates that field. These are additive and safe to backfill: `spec` to that
  feature's `spec.md` when one exists and `null` when it doesn't, `codeCommit` and `reviewCodeCommit` to `null` (never
  guess a SHA for work that predates the field), the rest to `[]`.
- **Legacy `testSeams`.** An issue carrying `testSeams` instead of `testBoundaries` predates the rename. Same field,
  same values: rename the key in place and carry the array over verbatim. Never drop the entries.
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
while doing it: `status`, `acceptanceCriteria[].done`, `comments`, `codeCommit`, and `reviewCodeCommit` hold work that
exists nowhere else, and `git diff` can only undo what was already committed.

Backfilling real `covers` values is not this skill's job. Set them to `[]` and tell the user that re-running
`/makerkit-custom-to-issues` against the spec maps stories to issues properly, reconciling against what is already on
disk.

**Section D: Legacy `AGENTS.md` entries.** Skip this section when step 1 found no `## Vocabulary` or `## Decisions`
section. An earlier version of these skills kept terms and decisions there; they now live in `.mysdd/docs/`. Load
`makerkit-custom-domain-modeling` for the formats and propose, per entry: a term → `CONTEXT.md`; a decision → an ADR
scoped to that `AGENTS.md`'s directory (no `scope` for the root file); a superseded decision → an ADR whose `status`
says so. Flag any entry pointing into `.mysdd/` (an issue, a `US-NNN`, a spec or feature path) for the user to reword;
never rewrite one silently. Once the moves are agreed, the moved sections come out of each `AGENTS.md`.

### 3. Confirm and edit

Show the user a draft of:

- The `## Agent skills` block to add to whichever of `AGENTS.md` / `CLAUDE.md` is being edited (see step 4 for selection
  rules)
- The contents of `.mysdd/issue-tracker.md` and `.mysdd/docs/agents/domain.md`
- Any ignore rule removal agreed in Section A, and any migration agreed in Sections C and D, as a per-file list

If a generated file already exists, show the **delta** rather than the whole file: what the current seed adds, changes,
or drops relative to what is on disk. A wall of unchanged text buries the one line that actually moved.

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

[one-line summary of where issues are tracked]. See `.mysdd/issue-tracker.md` (issue schema, status lifecycle, and
commit message format).

### Domain docs

Glossary in `.mysdd/docs/CONTEXT.md`, decisions as scoped ADRs in `.mysdd/docs/adr/`. See `.mysdd/docs/agents/domain.md`.

### Project docs

Conventions live in a distribution of `AGENTS.md` files (root + per app/package). Read the root file, then the nearest
`AGENTS.md` to the code you're touching. Where the nearest one has a `## Skills` section, invoke the skills it names.
```

Then write the generated files, creating directories as needed, from the seed templates in this skill folder:

- [issue-tracker-local.md](./issue-tracker-local.md) → `.mysdd/issue-tracker.md`: the local file-based issue tracker
- [domain.md](./domain.md) → `.mysdd/docs/agents/domain.md`: how to read the glossary and find the binding ADRs

**Upgrade each file in place; do not regenerate it:**

- If it doesn't exist, write it from the seed.
- If it does, read it and compare against the seed. Apply what the seed adds or changes; leave everything else as the
  user left it. Sections the file has and the seed doesn't are the user's own additions: keep them unless they
  contradict a seed section, and say which ones you kept.
- If the file and the seed are already equivalent, say so and write nothing.

Remove the ignore rules agreed in Section A. Apply the Section C migration one file at a time: re-read each issue,
mutate the parsed object, and write the whole file back as strict JSON. Apply the Section D moves, then remove only the
moved sections from each `AGENTS.md`. Report per file what changed. Beyond the `## Agent skills` block, a root file
seeded in Section B and the Section D removals, leave every `AGENTS.md` alone.

### 5. Done

Tell the user the setup is complete and which engineering skills will now read from these files. Mention they can edit
`.mysdd/issue-tracker.md` and `.mysdd/docs/agents/domain.md` directly later, and that re-running this skill upgrades
what is there in place — it diffs against the current seeds, re-checks the ignore rules, audits `.mysdd/` and the
`AGENTS.md` files, and asks before changing anything. Nothing here was committed: list what the user should commit.

If Section C found drift, close with the follow-ups it left open: issues whose `covers` is now `[]` and wants a
`/makerkit-custom-to-issues` pass, and anything reported but deliberately not migrated.
