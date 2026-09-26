# Issue tracker: Local Files

This file is the schema of record for the spec, issues, and implement skills. Those skills read the generated
`.mysdd/issue-tracker.md` rather than carrying their own copy — so a schema change starts here.

Specs for this repo live as markdown files under `.mysdd/features/`; **issues are JSON files**, so other software can
read them without parsing prose.

## Conventions

- One feature per directory: `.mysdd/features/<NN>-<feature-slug>/`, where `NN` is a two-digit feature sequence number.
  Number a new feature from the directories on disk in `.mysdd/features/` alone: start at `01` and increment the highest
  existing number. When `.mysdd/features/` doesn't exist there are no features yet; the first one is `01`, and writing
  it creates `.mysdd/features/`. Nothing else under `.mysdd/` is a feature
- The spec is `.mysdd/features/<NN>-<feature-slug>/spec.md` (markdown: it is prose, not an issue)
- Each implementation issue is one JSON file at `.mysdd/features/<NN>-<feature-slug>/issues/<NN>-<slug>.json`, never a
  single combined issues file. The feature directory and issue filenames use independent `NN` sequences; issue
  numbering starts at `01` and increments the highest existing number in that feature's `issues/` directory (including
  `issues/archive/`). An issue's `id` and filename are **immutable once created**: never renumber an existing issue and
  never reuse a retired number — the number is an address that `blockedBy` references depend on, not a position in
  the running order.
- Workflow state is the issue's `status` field (see the lifecycle below for the canonical state strings)
- Comments and conversation history append to the issue's `comments` array, oldest first
- Every file under `issues/` is strict JSON: no comments, no trailing commas, every field present. Parse it, mutate the
  object, write the whole file back; never append loose text to an issue file
- Feature directories are disposable: they get archived and deleted, while `.mysdd/docs/` stays. So nothing under
  `.mysdd/docs/` — the glossary, an ADR — names an issue, a `US-NNN`, a spec or a feature directory

## Ignore policy

The **protected paths** — `.mysdd/issue-tracker.md`, everything under `.mysdd/docs/`, and the board-state file
`.mysdd/kanban-boards.json` — are committed and never gitignored. Feature files are in one of two modes, the same for
every feature:

- **Committed**: no rule ignores anything under `.mysdd/features/`. Specs and issues are staged by path and committed
  as the sections below describe.
- **Local**: the whole Features root is ignored, normally by the single rule `.mysdd/features/` (Git can't re-include a
  file below an ignored directory, so a `!` exception under it has no effect). Specs and issues are written but never
  staged: § Committing a Spec and its Issues and § Closing an issue say what happens instead.

Anything else is **unresolved**: rules that ignore some feature files but not others, a feature file tracked by git
although a rule ignores it, or an ignored protected path. Stop, list the paths, and let the user resolve it;
`/makerkit-custom-setup-skills` can help. No skill ever force-adds (`git add -f`) or untracks (`git rm --cached`) a
file, and none edits `.git/info/exclude` or a global excludes file.

**The probe.** Before an operation writes or stages a spec, issue or protected document, rebuild the inventory
from the repository root. Run these commands **separately**, capture each status, and stop if either fails (only exit
0 is success). Do not pipe one Git command into another: the consumer's status can hide an inventory failure.

```sh
git ls-files --cached --others -z -- .mysdd/docs .mysdd/features
git ls-files --cached -z -- .mysdd/features
```

The first command inventories tracked, untracked **and ignored** files; use no exclusion options such as
`--exclude-standard`. Keep tracked-but-missing paths from the index. Parse NUL-delimited paths, deduplicate them, and
preserve their bytes (including spaces, tabs, newlines and Git pathspec characters); never split lines or shell words.
The second command supplies the tracked Feature set independently, even when those files are missing on disk.

Build two separate sets before checking ignoredness:

- **Protected documents**: every inventoried path under `.mysdd/docs/`, `.mysdd/issue-tracker.md`,
  `.mysdd/kanban-boards.json`, and every documentation path the operation proposes to write or stage, including new
  files. Setup includes its proposed tracker, domain config and instruction-file targets; domain work includes its
  proposed glossary/ADR targets. A fixed ADR sentinel cannot replace this inventory.
- **Feature files**: every inventoried path under `.mysdd/features/` plus every spec/issue path the operation proposes
  to write or stage, including new files. Keep the `.mysdd/features/` root probe separate from these file sets.

Feed the union of both sets and the root probe as NUL-delimited stdin to this command, preserving its output and
status independently of the inventory/trackedness commands:

```sh
git check-ignore --no-index --stdin -z
```

Exit **0** prints ignored paths as NUL-delimited records; exit **1** means none are ignored; any other exit is an
error: stop and report it. An empty result from a failed Git command never means "not ignored" or "not tracked".
Then classify the sets separately:

- If **any protected document** is ignored, stop and report the paths; `/makerkit-custom-setup-skills` can help.
  Protected documents must stay eligible for commit in both Feature modes; never count them as Feature targets.
- If no Feature file and no Features-root probe is ignored, use **committed** mode.
- If the Features-root probe and **every Feature file** are ignored, and the tracked Feature set is empty, use
  **local** mode. Eligible documentation changes still follow their normal commit rules.
- Any other mixture, including a tracked-but-ignored Feature file, is unresolved. Stop and report it.

Rebuild the inventory and repeat **all** checks immediately before each write or stage, including documentation
writes, and after any ignore-rule change. Include the current operation's proposed targets each time. Checks from
setup or an earlier write do not cover new files, changed rules or a failed later command.

`--no-index` makes a rule covering a tracked file visible; without it Git reports every tracked file as not ignored.
Use `git check-ignore -v --no-index -- <path>` only to show the user which file and line is responsible, and check its
status too. Never read ignoredness from verbose output or its exit status: it also prints a matching `!` negation,
and exits 0, for a path that the negation keeps included.

## Issue shape

Implementation issues (written by the issues skill):

```json
{
  "id": "<NN>",
  "slug": "<slug>",
  "title": "<Issue title>",
  "status": "ready-for-agent",
  "spec": ".mysdd/features/<NN>-<feature-slug>/spec.md",
  "whatToBuild": "The end-to-end behaviour this issue makes work, from the user's perspective, not a layer-by-layer implementation list.",
  "blockedBy": [
    "<NN>"
  ],
  "testBoundaries": [
    "<boundary description>"
  ],
  "covers": [
    "US-003"
  ],
  "codeCommit": null,
  "reviewCodeCommit": null,
  "acceptanceCriteria": [
    {
      "text": "Acceptance criterion 1",
      "done": false
    }
  ],
  "comments": [
    {
      "author": "<who>",
      "body": "<comment>"
    }
  ]
}
```

`spec` is the path to the spec this issue was broken out of, relative to the repository root and beginning with
`.mysdd/features/`; `null` when there is no spec (issues drafted from a plan or conversation). `blockedBy` holds the
`id` of each issue that gates this one, and is `[]` when the issue can start immediately. `testBoundaries` lists the
public boundaries this issue's tests hit, confirmed with the user when the issue was drafted; `[]` when the issue has no
dedicated tests. `covers` lists the `US-NNN` IDs from the spec's User Stories that this issue satisfies; `[]` when the
issue satisfies no story directly, and always `[]` when `spec` is `null`. `codeCommit` is the full SHA of the commit
that implemented the issue, and `reviewCodeCommit` the full SHA of the commit that applied the final reviewer's
findings; both are single strings or `null`, and both start as `null`. Each has exactly one writer: only the implement
skill writes `codeCommit`, when it commits; only the final reviewer — a human, or an LLM prompted to act as the final
reviewer — writes `reviewCodeCommit`, when it commits its fixes. Every skill carries whichever field it doesn't own over
verbatim. A further round of review fixes overwrites `reviewCodeCommit` — the superseded SHA stays reachable through git
history and the `comments` trail.
`comments` starts as `[]`.

The successful local implementation and review lifecycle is:

```text
ready-for-agent -> done-coding-awaiting-final-review -> done-final-review
```

`done-coding-awaiting-final-review` means coding, verification, and the implementing agent's own review are complete.
Only the independent final reviewer — `/makerkit-custom-final-review`, or a human acting in that role — sets
`done-final-review`. If final review requires changes, the issue stays at
`done-coding-awaiting-final-review` — do not return it to `ready-for-agent`, and do not re-run the implement skill on
it. The final reviewer appends the findings to `comments`, fixes the issues found, produces the `CODE REVIEW FIXES:`
commit, and records its SHA in `reviewCodeCommit`; `codeCommit` keeps pointing at the implementation. A fix round is
visible through `reviewCodeCommit` and the `comments` trail, never through a status change.

## Commit message format

Every code commit made for an issue — by the implement skill or by the final reviewer — uses this shape:

```text
CODE: <imperative subject>

<one to three lines on the why, when the change isn't self-evident>

Issue: .mysdd/features/<NN>-<feature-slug>/issues/<NN>-<slug>.json
Spec: .mysdd/features/<NN>-<feature-slug>/spec.md
```

- The header prefix of a code commit is `CODE: ` or `CODE REVIEW FIXES: `. Pick it from the issue's `codeCommit`:
  `null` means this is the implement skill's first-round commit, so `CODE: `; a SHA means the issue has already been
  implemented and committed and this is the final reviewer's fix commit, so `CODE REVIEW FIXES: `. The header follows
  `codeCommit`, never `status` — a fix round leaves the status where it is. `SPEC: ` and `Closed Issue: ` are the other
  subjects, but they are bookkeeping, not code commits: they follow § Committing a Spec and its Issues and § Closing an
  issue, not this format.
- The whole subject line, prefix included, is ≤72 characters.
- One `Issue:` trailer per issue in the commit, repo-root-relative and beginning `.mysdd/features/`, in either mode.
- A `Spec:` trailer only when the issue's `spec` is not `null`, deduped when several issues in one commit share a spec.
- No tool or model attribution — no `Co-Authored-By` trailer, no "generated with" footer, no emoji badge. The message
  must read the same whichever agent, or human, produced it.
- A code commit stages implementation files only, never anything under `.mysdd/`. The one exception is an ADR under
  `.mysdd/docs/adr/` the user agreed to add or supersede for this issue: it goes into the same commit.
- The trailers name the paths even when feature files are local: they are addresses, not staged files.

A first-round commit:

```text
CODE: Gate workspace switching behind the seat check

A member without an active seat could still switch into a workspace via the
URL. The guard now runs before the loader resolves.

Issue: .mysdd/features/03-workspace-seats/issues/02-seat-guard.json
Spec: .mysdd/features/03-workspace-seats/spec.md
```

A commit applying final-review findings on the same issue:

```text
CODE REVIEW FIXES: Seat guard — handle the revoked-seat race

Issue: .mysdd/features/03-workspace-seats/issues/02-seat-guard.json
Spec: .mysdd/features/03-workspace-seats/spec.md
```

## Committing a Spec and its Issues

When the issues skill has published a feature's issues, it records the Spec, those issues and the decisions they rest on
in one commit of its own. Run the probe (§ Ignore policy) on that spec and those issue files right before staging:

- The subject is `SPEC: <imperative subject>`, ≤72 characters prefix included. An optional body of one to three lines
  may say why. No trailers.
- Stage that feature's `spec.md`, the issue JSON files this run created or updated, `.mysdd/docs/CONTEXT.md` when this
  run or the spec's design session changed it, and each ADR under `.mysdd/docs/adr/` they added or changed. Stage
  `CONTEXT.md` whole, and name any other uncommitted edit it carries in the report. Never stage implementation files,
  an `AGENTS.md`, or another feature's files, and never `git add .mysdd/`; leave unrelated staged or working-tree
  changes out of the commit.
- In **local** mode, stage no spec or issue file. The commit still carries the `CONTEXT.md` and ADR changes above, under
  the same `SPEC: ` subject; when there are none, make no commit.
- The no-attribution rule in § Commit message format applies.
- Never make an empty commit, and never amend.

## Closing an issue

When the final reviewer sets `done-final-review` in **committed** mode, it records the close in one commit of its own.
Run the probe (§ Ignore policy) on the issue file before writing the status and again before staging:

- The subject is exactly `Closed Issue: <issue path>`, the path repo-root-relative and beginning `.mysdd/features/`
  (`Closed Issue: .mysdd/features/03-workspace-seats/issues/02-seat-guard.json`). No body, no trailers.
- Stage only that issue's JSON file, plus any `.mysdd/` board-state file the tooling keeps and has changed (for example
  `.mysdd/kanban-boards.json`). Never stage implementation files or anything under `.mysdd/docs/`: those belong to the
  `SPEC: `, `CODE: ` and `CODE REVIEW FIXES: ` commits.
- The no-attribution rule in § Commit message format applies.

In **local** mode, make no commit: the status change is the whole close.

## When a skill says "publish to the issue tracker"

Run the probe (§ Ignore policy) on the new file's path first. Then create it under
`.mysdd/features/<NN>-<feature-slug>/`, creating `.mysdd/features/` and the feature directory if needed: a `.json`
issue under `issues/`, or a markdown file for a spec.

## When a skill says "fetch the relevant issue"

Read the file at the referenced path and parse it as JSON. The user will normally pass the path or the issue number
directly.
