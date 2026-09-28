---
name: modified-matt-setup-skills
description: "Configure this repo for the engineering skills: set up its issue tracker and domain doc layout. Run once before first use of the other engineering skills."
disable-model-invocation: true
---

# Setup Matt Pocock's Skills

Scaffold the per-repo configuration that the engineering skills assume:

- **Issue tracker**: local JSON issue files under `.mysdd/features/`
- **Domain docs**: where `CONTEXT.md` and the scoped, binding ADRs live, and the consumer rules for reading them

This is a prompt-driven skill, not a deterministic script. Explore, present what you found, confirm with the user, then write.

## Process

### 1. Explore

Look at the current repo to understand its starting state. Read whatever exists; don't assume:

- `AGENTS.md` and `CLAUDE.md` at the repo root: does either exist? Is there already an `## Agent skills` section in either?
- `CONTEXT.md` and `CONTEXT-MAP.md` at the repo root
- `.mysdd/docs/adr/`: list each ADR that doesn't open with `---` frontmatter, and its `**Status:**` line if it has one. Those are Section D's
- `.mysdd/issue-tracker.md` and `.mysdd/docs/agents/domain.md`: does this skill's prior output already exist?
- `.mysdd/features/`: existing feature directories, their `spec.md` files, and every JSON file under `issues/`. If any exist this is an upgrade rather than a first run, so read enough of them to answer Section C
- Old-layout feature directories directly under `.mysdd/` (`.mysdd/<NN>-<slug>/`). Report each one in Section A: the other skills stop until the user moves it under `.mysdd/features/` and updates its issues' `spec` paths. Setup never moves one
- Whether Git ignores any of it, per [issue-tracker-local.md](./issue-tracker-local.md) § Ignore policy. Run its
  complete NUL-delimited inventory and independent trackedness check, then its nonverbose ignoredness probe. Include
  every documentation and Feature file its pathspecs select (tracked, missing, untracked or ignored), the tracker and
  board paths, the Features-root probe, and proposed documentation targets as soon as they are known. Check every
  command's status independently; stop on an inventory or trackedness failure. Classify protected documents
  separately from Feature files. Use verbose diagnostics only to name an ignored path's responsible rule and line.
- Monorepo signals: a `pnpm-workspace.yaml`, a `workspaces` field in `package.json`, or a populated `packages/*` with its own `src/`. These are present only in a genuinely large multi-package repo; their absence means single-context, which is almost every repo.

### 2. Present findings and ask

Summarise what's present and what's missing. Then take the sections in order. One section, one answer, then the next.

Lead each section with the recommended answer so the user can accept it in a word. Give a one-line explainer only when the choice genuinely branches; skip the section entirely when exploration already settled it (Section B when there's no monorepo).

**Section A: Issue tracker.** These skills track work as local JSON issue files under `.mysdd/features/<NN>-<feature-slug>/issues/`, where `NN` is a two-digit feature sequence number, with specs as markdown alongside them. This is fixed — there's no tracker choice to make, so prepare `.mysdd/issue-tracker.md` from the local template without asking. Write only after the policy checks pass.

Then name the mode step 1 found (§ Ignore policy): **committed** when no protected document, Feature file or
Features-root probe is ignored; **local** when every protected document is included, the Features-root probe and
all Feature files are ignored, and no Feature file is tracked. Either is fine as it stands. Anything else is
unresolved, and the other skills stop on it, so resolve it here before continuing. Show each responsible rule with
its file and line, and each affected path:

- **An ignored protected document, or only some Feature files ignored.** A broad `.mysdd/` or `.mysdd/*` rule,
  incomplete re-includes, or a rule on one Feature or its `issues/` can cause this. In a committed `.gitignore`, offer
  to replace the responsible rule with `.mysdd/features/` (local: tracker, docs and board remain committed) or remove
  it (committed), and let the user pick. A rule in `.git/info/exclude` or the global excludes file isn't committed:
  never edit either; show the user the file and line to change there. Decide from the effective checks, not the
  spelling of a rule: working negations may already leave the policy valid.
- **A tracked feature file under an ignore rule.** Report it and ask whether to drop the rule or untrack the files themselves. Never untrack or force-add anything.

A text edit is not proof. After any rule changes, re-run the step 1 checks and confirm the effective result is one of the two modes, not assumed from the edit: another rule, a negation or a tracked file can still leave it unresolved. Files a removed rule was hiding need a first commit.

**Section B: Domain docs.** Default to **single-context** (one `CONTEXT.md` + `.mysdd/docs/adr/` at the repo root). This fits almost every repo; write it without asking.

Offer **multi-context** (a root `CONTEXT-MAP.md` pointing to per-context `CONTEXT.md` files) only when exploration found monorepo signals. Then confirm which layout they want.

**Section C: Existing features.** Skip this section entirely when step 1 found no feature directories.

When they exist, the repo was set up against an older version of these conventions, and the gap is worth naming before the other skills run against it. Check each feature directory for drift from the issue shape in [issue-tracker-local.md](./issue-tracker-local.md):

- **Missing fields.** An issue lacking `spec`, `blockedBy`, `testBoundaries`, `covers`, `codeCommit`, `reviewCodeCommit`, `reviewHistoryCommit`, or `comments` predates that field. These are additive and safe to backfill: `spec` to that feature's `spec.md` when one exists and `null` when it doesn't, `codeCommit`, `reviewCodeCommit` and `reviewHistoryCommit` to `null` (never guess a SHA for work that predates the field), the rest to `[]`.
- **Legacy `testSeams`.** An issue carrying `testSeams` instead of `testBoundaries` predates the rename. Same field, same values: rename the key in place and carry the array over verbatim. Never drop the entries.
- **Unknown `status`.** Any value outside `ready-for-agent` / `done-coding-awaiting-final-review` / `done-final-review` came from an older lifecycle. Never guess a mapping — list each one and ask.
- **Shape violations.** A single combined issues file (one array rather than one file per issue), issues sitting directly in the feature directory instead of under `issues/`, or two issues sharing an `id`. Report each. Offer to split a combined file into per-issue files under the ids the issues already carry; never assign new ones.
- **Specs without story IDs.** A `spec.md` whose User Stories carry no `US-NNN` IDs predates them, so no issue's `covers` can reference it. Offer to backfill IDs sequentially in document order — safe only while nothing references them, so if any issue in that feature already has a non-empty `covers`, report it and leave the spec alone.
- **Non-conforming directory names.** A feature directory that isn't `<NN>-<feature-slug>`. Report it and leave it alone unless the user asks: the path is an address that each issue's `spec` field points at, so a rename has to rewrite those fields in the same pass.

Present the drift as a per-file list and ask whether to migrate. Never migrate silently, and never touch live state while doing it: `status`, `acceptanceCriteria[].done`, `comments`, `codeCommit`, `reviewCodeCommit`, and `reviewHistoryCommit` hold work that exists nowhere else. Local feature files have no git history at all, so assume there is no undo and get the answer before writing.

Backfilling real `covers` values is not this skill's job. Set them to `[]` and tell the user that re-running `/modified-matt-to-issues` against the spec maps stories to issues properly, reconciling against what is already on disk.

**Section D: Existing ADRs.** Skip this section when every ADR already has frontmatter, or there are none.

An ADR without frontmatter predates it: the skills read it as repo-wide, with its status from its `**Status:**` line. That works, but every session touching any path then pays for it. Load `modified-matt-domain-modeling` for the frontmatter format, then list each one and propose its frontmatter:

- **`status`**, carried over from its `**Status:**` line: `accepted`, `superseded by ADR-NNNN`, or `superseded`. Without a line, propose `accepted`. Anything else is not a mapping to guess — show the line and ask.
- **`scope`**, optional: the repo-relative globs the decision binds, read from what the ADR states and the code it names. Leave it out when the decision is genuinely repo-wide, and say which ones you left out and why.

The user approves each ADR's frontmatter, or declines it; never add one silently. Adding frontmatter is the whole change: the body, its `**Status:**` line included, stays exactly as it is.

### 3. Confirm and edit

Show the user a draft of:

- The `## Agent skills` block to add to whichever of `CLAUDE.md` / `AGENTS.md` is being edited (see step 4 for selection rules)
- The contents of `.mysdd/issue-tracker.md` and `.mysdd/docs/agents/domain.md`
- Any ignore rule change agreed in Section A, any migration agreed in Section C, and the frontmatter agreed per ADR in Section D, as a per-file list

For a file that already exists, show the **delta** rather than the whole file: what the current seed adds, changes, or drops relative to what is on disk. A wall of unchanged text buries the one line that actually moved.

Let them edit before writing.

### 4. Write

Apply any approved repository ignore-rule correction first. Before each documentation or Feature write, rebuild
§ Ignore policy's inventory and repeat every check, including all proposed documentation targets from the draft.
Stop on any failed command or unresolved policy before writing. Repeat these checks before any staging as well.

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

[one-line summary of where issues are tracked]. See `.mysdd/issue-tracker.md` (issue schema, status lifecycle, and commit message format).

### Domain docs

[one-line summary of layout: "single-context" or "multi-context"], with scoped, binding ADRs in `.mysdd/docs/adr/`. See `.mysdd/docs/agents/domain.md`.
```

Then write the generated files, using the seed templates in this skill folder as a starting point:

- [issue-tracker-local.md](./issue-tracker-local.md): local file-based issue tracker (JSON issues)
- [domain.md](./domain.md): domain doc layout, and how to read the glossary and find the binding ADRs

**Upgrade these files in place; do not regenerate them.** For each of `.mysdd/issue-tracker.md` and `.mysdd/docs/agents/domain.md`:

- If it doesn't exist, write it from the seed.
- If it does, read it and compare against the seed. Apply what the seed adds or changes; leave everything else as the user left it. Sections the file has and the seed doesn't are the user's own additions: keep them unless they contradict a seed section, and say which ones you kept.
- If the file and the seed are already equivalent, say so and write nothing.
- **The tracker's `Tracker contract:` line goes last.** Apply every other seed change to `.mysdd/issue-tracker.md` first, and only then write the seed's `Tracker contract: <N>` line under the title, replacing any existing one, so an upgrade stopped halfway never claims a contract the file doesn't hold. The other skills stop on any other number. Report the contract before (none, when the file had no such line) and after.

Re-run the step 1 checks with the current inventory and targets before each migration write. Apply whatever migration the user approved in Section C, one file at a time. Re-read each issue, mutate the parsed object, and write the whole file back as strict JSON. Then add the frontmatter approved in Section D, one ADR at a time, re-running the checks with that ADR as a target before each write. Report per file what changed.

### 5. Done

Tell the user the setup is complete and which engineering skills will now read from these files. Mention they can edit `.mysdd/issue-tracker.md` and `.mysdd/docs/agents/domain.md` directly later, and that re-running this skill upgrades what is there in place — it diffs against the current seeds, re-checks the ignore rules, audits the features and the ADRs, and asks before changing anything. Nothing here was committed: list what the user should commit.

If Section C found drift, close with the follow-ups it left open: issues whose `covers` is now `[]` and wants a `/modified-matt-to-issues` pass, and anything reported but deliberately not migrated. If Section D ran, name each ADR that got frontmatter and each the user declined; a declined one stays repo-wide.
