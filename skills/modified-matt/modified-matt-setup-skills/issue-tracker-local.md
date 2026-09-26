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
- Implementation issues are one JSON file per issue at `.mysdd/features/<NN>-<feature-slug>/issues/<NN>-<slug>.json`,
  never a single combined issues file. The feature directory and issue filenames use independent `NN` sequences; issue
  numbering starts at `01` and increments the highest existing number in that feature's `issues/` directory (including
  `issues/archive/`). An issue's `id` and filename are **immutable once created**: never renumber an existing issue and
  never reuse a retired number — the number is an address that `blockedBy` references depend on, not a position in the
  running order.
- Workflow state is the issue's `status` field (see the lifecycle below for the canonical state strings)
- Comments and conversation history append to the issue's `comments` array, oldest first
- Every file under `issues/` is strict JSON: no comments, no trailing commas, every field present. Parse it, mutate the
  object, write the whole file back; never append loose text to an issue file

## Ignore policy

The **protected paths** — `.mysdd/issue-tracker.md`, everything under `.mysdd/docs/`, and the board-state file
`.mysdd/kanban-boards.json` — are committed and never gitignored, so the generated config, the ADRs and the board
travel with the repo. Feature files are in one of two modes, the same for every feature:

- **Committed**: no rule ignores anything under `.mysdd/features/`. Specs and issues are staged by path and committed
  as the sections below describe.
- **Local**: the whole Features root is ignored, normally by the single rule `.mysdd/features/` (Git can't re-include a
  file below an ignored directory, so a `!` exception under it has no effect). Specs and issues are written but never
  staged, and the bookkeeping commits below are skipped.

Anything else is **unresolved**: rules that ignore some feature files but not others, a feature file tracked by git
although a rule ignores it, or an ignored protected path. Stop, list the paths, and let the user resolve it;
`/modified-matt-setup-skills` can help. No skill ever force-adds (`git add -f`) or untracks (`git rm --cached`) a file,
and none edits `.git/info/exclude` or a global excludes file.

**The probe.** Before an operation writes or stages a spec or an issue, probe its **targets** — every spec and issue
path it will write or stage, including files it is about to create — together with the protected paths, then list which
targets git already tracks:

```sh
git check-ignore --no-index .mysdd/issue-tracker.md .mysdd/kanban-boards.json .mysdd/docs/agents/domain.md \
  .mysdd/docs/adr/0000-probe.md .mysdd/features/ <targets>
git ls-files -- <targets>
```

Run the probe again right before each write or stage, not once per session, and decide from its exit status:

- **Exit 1**: nothing is ignored. **Committed** mode.
- **Exit 0**: it prints exactly the ignored paths. If a protected path is among them, stop and tell the user to
  run `/modified-matt-setup-skills`. If `.mysdd/features/` and every target are printed and `git ls-files` prints none
  of them, **local** mode. Any other mixture is unresolved.
- **Any other exit** (128 outside a repository, for example): the probe failed. Stop and report the error; a failed
  probe never means "not ignored".

`--no-index` makes a rule covering a tracked file visible; without it git reports every tracked file as not ignored.
Use `git check-ignore -v --no-index <path>` only to show the user which file and line is responsible. Never read
ignoredness from verbose output or its exit status: it also prints a matching `!` negation, and exits 0, for a path
that the negation keeps included.

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
Only the independent final reviewer — `/modified-matt-final-review`, or a human acting in that role — sets
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
- One `Issue:` trailer per issue in the commit, repo-root-relative and beginning `.mysdd/features/`, in either mode:
  the trailers are addresses, not staged files.
- A `Spec:` trailer only when the issue's `spec` is not `null`, deduped when several issues in one commit share a spec.
- No tool or model attribution — no `Co-Authored-By` trailer, no "generated with" footer, no emoji badge. The message
  must read the same whichever agent, or human, produced it.

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

When the issues skill has published a feature's issues in **committed** mode, it records the Spec and those issues in
one commit of its own. Run the probe (§ Ignore policy) on that spec and those issue files right before staging:

- The subject is `SPEC: <imperative subject>`, ≤72 characters prefix included. An optional body of one to three lines
  may say why. No trailers.
- Stage only that feature's `spec.md` and the issue JSON files this run created or updated, each by path. Never
  `git add .mysdd/`, never stage implementation files or another feature's files, and leave unrelated staged or
  working-tree changes out of the commit.
- The no-attribution rule in § Commit message format applies.
- Never make an empty commit, and never amend.

In **local** mode, make no commit.

## Closing an issue

When the final reviewer sets `done-final-review` in **committed** mode, it records the close in one commit of its own.
Run the probe (§ Ignore policy) on the issue file before writing the status and again before staging:

- The subject is exactly `Closed Issue: <issue path>`, the path repo-root-relative and beginning `.mysdd/features/`
  (`Closed Issue: .mysdd/features/03-workspace-seats/issues/02-seat-guard.json`). No body, no trailers.
- Stage only that issue's JSON file, plus any `.mysdd/` board-state file the tooling keeps and has changed (for example
  `.mysdd/kanban-boards.json`). Never stage implementation files: those belong to the `CODE: ` and `CODE REVIEW FIXES: `
  commits.
- The no-attribution rule in § Commit message format applies.

In **local** mode, make no commit: the status change is the whole close.

## When a skill says "publish to the issue tracker"

Run the probe (§ Ignore policy) on the new file's path first. Then create it under
`.mysdd/features/<NN>-<feature-slug>/`, creating `.mysdd/features/` and the feature directory if needed: a `.json`
issue under `issues/`, or a markdown file for a spec.

## When a skill says "fetch the relevant issue"

Read the file at the referenced path and parse it as JSON. The user will normally pass the path or the issue number
directly.
