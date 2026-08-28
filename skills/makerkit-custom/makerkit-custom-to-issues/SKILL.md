---
name: makerkit-custom-to-issues
description: Break a plan, spec, or the current conversation into a set of tracer-bullet issues, each declaring its blocking edges as data, published as one JSON file per issue under .myprds/.
disable-model-invocation: true
---

# To Issues

Break a plan, spec, or conversation into a set of **issues**: tracer-bullet vertical slices, each declaring the issues
that **block** it.

**Read `.myprds/issue-tracker.md` before you write anything.** It is the contract: directory layout, feature and issue
numbering, the issue JSON shape, and the status lifecycle. This skill does not restate it. If the file is missing, stop
and tell the user to run `/makerkit-custom-setup-skills`.

## Process

### 1. Gather context

Work from whatever is already in the conversation context. If the user passes a reference (a spec path or issue path) as
an argument, read the file's full contents.

### 2. Explore the codebase (optional)

**Before starting**, If you have not already explored the codebase to understand the state of the code,read the
project's own documentation:

- the nearest `AGENTS.md` to the area in question — the root file is already in your context via `CLAUDE.md` — plus the
  vendored Next.js docs for anything Next.js. Read these directly; they're small and targeted. Where they and this
  description differ, **follow the repo**.
- the `README.md` of each app or package **actually involved** (`apps/*/README.md`, `packages/*/README.md`) — what that
  piece is and how it fits. Read directly, and only for the pieces the feature touches.
- the Makerkit docs under `docs/` — **dispatch a sub-agent; never walk the tree in this context.** It holds 150+
  upstream Makerkit `.mdoc` files. Name the one or two topic directories the feature touches (`docs/billing`,
  `docs/security`, `docs/data-fetching`, …) and ask the sub-agent how the feature is *meant* to work. Per the frontier
  rule above, don't block round one on it: only the questions downstream of its answer wait for it to report.

Look for opportunities to prefactor the code to make the implementation easier. "Make the change easy, then make the
easy change."

### 3. Draft vertical slices

Break the work into **tracer bullet** issues.

<vertical-slice-rules>

- Each slice cuts a narrow but COMPLETE path through every layer (schema, API, UI, tests): vertical, NOT a horizontal
  slice of one layer
- A completed slice is demoable or verifiable on its own
- Each slice is sized to fit in a single fresh context window
- Any prefactoring should be done first

</vertical-slice-rules>

Give each issue its **blocking edges**: the other issues that must complete before it can start. An issue with no
blockers can start immediately.

Identify each issue's **test seam (s)**: the public boundary its tests will hit. When the issue set descends from a spec
with a Testing Decisions section, draw seams from what was agreed there; propose a new one only when a slice needs a
boundary the spec didn't cover. An issue with no dedicated tests (e.g. a pure prefactor, or one leg of a wide-refactor
batch) can carry no seams.

When the issue set descends from a spec, map each slice to the **user stories it satisfies**: the `US-NNN` IDs from the
spec's User Stories section. Between them the issues should satisfy every story in the spec; a story no slice covers is
either a missed slice or a deliberate deferral, and step 4 is where you find out which. An issue can satisfy no story
directly — a pure prefactor, or one leg of an expand–contract batch — and carries none.

**Wide refactors are the exception to vertical slicing.** A **wide refactor** is one mechanical change (rename a column,
retype a shared symbol) whose **blast radius** fans across the whole codebase, so a single edit breaks thousands of call
sites at once and no vertical slice can land green. Don't force it into a tracer bullet; sequence it as
**expand–contract**. First expand: add the new form beside the old so nothing breaks. Then migrate the call sites over
in batches sized by blast radius (per package, per directory), each batch its own issue blocked by the expand, keeping
CI green batch to batch because the old form still exists. Finally contract: delete the old form once no caller remains,
in an issue blocked by every migrate batch. When even the batches can't stay green alone, keep the sequence but let them
share an integration branch that all block a final integrate-and-verify issue; green is promised only there.

### 4. Quiz the user

Present the proposed breakdown as a numbered list. For each issue, show:

- **Title**: short descriptive name
- **Blocked by**: which other issues (if any) must complete first
- **What it delivers**: the end-to-end behaviour this issue makes work
- **Test seams**: which seam (s) this issue's tests will hit
- **Covers**: which user stories (`US-NNN`) from the spec this issue satisfies

Ask the user:

- Does the granularity feel right? (too coarse / too fine)
- Are the blocking edges correct: does each issue only depend on issues that genuinely gate it?
- Should any issues be merged or split further?
- Are the test seams right: does each issue test at the right boundary, and are any missing or superfluous?
- Is every user story covered? List each `US-NNN` in the spec that no issue covers, and ask whether it is a deliberate
  deferral or a slice you missed.

Iterate until the user approves the breakdown.

### 5. Publish the issues

**Inspect before you write.** List `issues/*.json` in the target feature directory first.

- **Absent or empty** → first publish. Create the issues as described below, numbering from `01` in dependency order
  (blockers first).
- **Non-empty** → **reconciliation mode**. Write nothing until the whole reconciliation is resolved and shown to the
  user; see *Reconciling with existing issues* below.

Write one file per issue under `.myprds/<NN>-<feature-slug>/issues/<NN>-<slug>.json`. The feature directory's `NN` is
its two-digit sequence number; the issue filename's `NN` is a separate sequence within that feature and is that issue's
`id`. Each file's `blockedBy` lists the issues it depends on. Set each issue's `spec` field to that feature's `spec.md`
path if this run started from a spec (a spec path was passed in, or one exists at
`.myprds/<NN>-<feature-slug>/spec.md`); otherwise `null`. Set `testSeams` to the seams agreed for that issue in step 4,
and `covers` to the `US-NNN` IDs agreed there. Use the issue shape from `.myprds/issue-tracker.md` § Issue shape: one
issue per file, never a single combined file.

Work the **frontier**: any issue whose blockers are all done. For a purely linear chain that means top to bottom.

Do NOT modify the feature's `spec.md`.

Avoid specific file paths or code snippets: they go stale fast. Exception: if a prototype produced a snippet that
encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it and note
briefly that it came from a prototype. Trim to the decision-rich parts, not a working demo, just the important bits.

#### Reconciling with existing issues

An issue already on disk may carry live state that exists nowhere else: a `status` reached through real work, `comments`
holding review findings, `acceptanceCriteria` already ticked. Regenerating the directory from `01` destroys all three,
and because the numbering restarts it can also land one issue's content in another issue's file. So when the directory
is non-empty, reconcile — never regenerate.

1. **Identity is `slug`, never the number.** Match each entry in the approved breakdown to an existing file by its
   `slug`. Numbers are addresses, not identities.
2. **On a slug match, preserve — never reset.** Carry `status` and `comments` over verbatim. For each
   `acceptanceCriteria` entry, match on `text` and keep that entry's existing `done` value; never flip a `true` back to
   `false`. Update only `title`, `whatToBuild`, `blockedBy`, `testSeams`, `covers`, `spec`, and criteria genuinely added
   or removed by text.
3. **On no match, it's a new issue.** Assign `id` = the highest `id` present in the directory (including
   `issues/archive/`) + 1. **Never reuse a retired number.**
4. **`id` and filename are immutable once written.** Never renumber an existing issue, even when the dependency order
   changed. This is what stops content shifting between files and what keeps every `blockedBy` reference valid.
   Dependency order is carried by `blockedBy`, not by the numbering — remap `blockedBy` onto the preserved ids.
5. **Never delete.** An existing issue with no counterpart in the new breakdown is listed to the user with one question:
   keep it, or move it to `issues/archive/`? No `rm`, no silent drop, no answer assumed on their behalf.
6. **A `covers` entry with no matching story is a dangling reference.** It means the spec was revised and that `US-NNN`
   was dropped or renamed. Never silently remove it. List each one with the issue it sits on and ask the user whether
   that issue is now out of scope or should point at a different story.
7. **Report.** Show a table of every issue in the directory and what happened to it: created / updated / status
   preserved / archived.

#### The issue shape

`.myprds/issue-tracker.md` § Issue shape defines the fields, their types, and what each empty value means. Follow it
exactly — this skill does not restate it. Write strict JSON: no comments, no trailing commas, and every field present on
every issue.

The `status`, `acceptanceCriteria[].done`, and `comments` values shown there are **seed values for a newly created issue
only**. On an issue that already exists they are live state: carry them over from the file on disk rather than
re-seeding them. `status` starts at `ready-for-agent`; `acceptanceCriteria` entries start with `"done": false` and
ticking one means flipping it to `true`; `comments` starts as `[]`.

## Next step

Once the user approves the published issues, the next step is `/makerkit-custom-implement`, taking one issue from the
frontier.
