---
name: modified-matt-to-issues
description: Break a plan, spec, or the current conversation into a set of tracer-bullet issues, each declaring its blocking edges as data, published as one JSON file per issue under .mysdd/features/.
disable-model-invocation: true
---

# To Issues

Break a plan, spec, or conversation into a set of **issues**: tracer-bullet vertical slices, each declaring the issues
that **block** it.

**Read `.mysdd/issue-tracker.md` before you write anything.** It is the contract: directory layout, feature and issue
numbering, the issue JSON shape, and the status lifecycle. This skill does not restate it. If the file is missing, stop
and tell the user to run `/modified-matt-setup-skills`.

## Process

### 1. Gather context

Work from whatever is already in the conversation context. If the user passes a reference (a spec path or issue path) as
an argument, read the file's full contents.

### 2. Explore the codebase

If you have not already explored the codebase, do so to understand the current state of the code. Read the glossary
and the binding ADRs for the paths you touch, per `.mysdd/docs/agents/domain.md`. ADRs are binding. Issue titles and
descriptions should use the glossary's vocabulary.

Look for opportunities to prefactor the code to make the implementation easier. "Make the change easy, then make the
easy change."

### 3. Draft vertical slices

Break the work into **tracer bullet** issues.

<vertical-slice-rules>

- Each slice cuts a narrow but COMPLETE path through every layer (schema, API, UI, tests): vertical, NOT a horizontal
  slice of one layer
- A completed slice is demoable or verifiable on its own
- Each slice is sized to fit in a single fresh context window. You can't measure tokens directly, so use the file count
  as the proxy: a slice that looks like it will create or edit more than ~10 files is too big — split it
- Any prefactoring should be done first

</vertical-slice-rules>

Give each issue its **blocking edges**: the other issues that must complete before it can start. An issue with no
blockers can start immediately.

Identify each issue's **test boundaries**: the public interface its tests will hit. When the issue set descends from a
spec with a Testing Decisions section, draw boundaries from what was agreed there; propose a new one only when a slice
needs a boundary the spec didn't cover. An issue with no dedicated tests (e.g. a pure prefactor, or one leg of a
wide-refactor batch) can carry no boundaries.

When the issue set descends from a spec, map each slice to the **user stories it satisfies**: the `US-NNN` IDs from the
spec's User Stories section. Between them the issues should satisfy every story in the spec not marked `(retired)`; a story no slice covers is
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
- **Test boundaries**: which boundaries this issue's tests will hit
- **Covers**: which user stories (`US-NNN`) from the spec this issue satisfies

Ask the user:

- Does the granularity feel right? (too coarse / too fine)
- Are the blocking edges correct: does each issue only depend on issues that genuinely gate it?
- Should any issues be merged or split further?
- Are the test boundaries right: does each issue test at the right boundary, and are any missing or superfluous?
- Is every user story covered? Skip stories marked `(retired)`. List each other `US-NNN` in the spec that no issue covers, and ask whether it is a deliberate
  deferral or a slice you missed.
- Does any issue contradict a binding ADR? Name each one, with the ADR's number and title.

Iterate until the user approves the breakdown.

### 5. Publish the issues

**Inspect before you write.** List `issues/*.json` and `issues/archive/*.json` in the target feature directory first.
Then run the ignore probe (`.mysdd/issue-tracker.md` § Ignore policy) with the spec and every issue file this run will
create or update as its targets. If it reports an unresolved state, write nothing: list the paths and let the user
resolve them.

- **No live issue** (`issues/*.json` absent or empty) → first publish. Create the issues as described below, in
  dependency order (blockers first), numbering from `01` — or, when `issues/archive/` holds retired issues, from one
  past their highest number, which is never reused.
- **Non-empty** → **reconciliation mode**. Write nothing until the whole reconciliation is resolved and shown to the
  user; see *Reconciling with existing issues* below.

Write one file per issue under `.mysdd/features/<NN>-<feature-slug>/issues/<NN>-<slug>.json`. The feature directory's
`NN` is its two-digit sequence number; the issue filename's `NN` is a separate sequence within that feature and is that
issue's `id`. Each file's `blockedBy` lists the issues it depends on. Set each issue's `spec` field to that feature's
`spec.md` path if this run started from a spec (a spec path was passed in, or one exists at
`.mysdd/features/<NN>-<feature-slug>/spec.md`); otherwise `null`. Set `testBoundaries` to the boundaries agreed for
that issue in step 4, and `covers` to the `US-NNN` IDs agreed there. Use the issue shape from `.mysdd/issue-tracker.md`
§ Issue shape: one issue per file, never a single combined file.

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
2. **On a slug match, preserve — never reset.** Carry `status`, `comments`, `codeCommit`, `reviewCodeCommit`, and
   `reviewHistoryCommit` over verbatim — the commit fields are the only pointers from the issue to the code that
   implemented it, the fixes its review asked for and the commit that recorded that review. For each
   `acceptanceCriteria` entry, match on `text` and keep that entry's existing `done` value; never flip a `true` back to
   `false`. Update only `title`, `whatToBuild`, `blockedBy`, `testBoundaries`, `covers`, `spec`, and criteria genuinely
   added or removed by text.
3. **On no match, it's a new issue.** Assign `id` = the highest `id` present in the directory (including
   `issues/archive/`) + 1. **Never reuse a retired number.**
4. **`id` and filename are immutable once written.** Never renumber an existing issue, even when the dependency order
   changed. This is what stops content shifting between files and what keeps every `blockedBy` reference valid.
   Dependency order is carried by `blockedBy`, not by the numbering — remap `blockedBy` onto the preserved ids.
5. **Never delete.** An existing issue with no counterpart in the new breakdown is listed to the user with one question:
   keep it, or move it to `issues/archive/`? No `rm`, no silent drop, no answer assumed on their behalf.
6. **A `covers` entry with no matching story is a dangling reference.** It means the spec was revised and that `US-NNN`
   was dropped or renamed. Never silently remove it. List each one with the issue it sits on and ask the user whether
   that issue is now out of scope or should point at a different story. A `covers` entry naming a story marked
   `(retired)` is the same case, even though the ID is still in the spec: list it and ask the same question.
7. **Report.** Show a table of every issue in the directory and what happened to it: created / updated / status
   preserved / archived.

#### The issue shape

`.mysdd/issue-tracker.md` § Issue shape defines the fields, their types, and what each empty value means. Follow it
exactly — this skill does not restate it. Write strict JSON: no comments, no trailing commas, and every field present on
every issue.

The `status`, `acceptanceCriteria[].done`, `comments`, `codeCommit`, `reviewCodeCommit`, and `reviewHistoryCommit`
values shown there are **seed values for a newly created issue only**. On an issue that already exists they are live
state: carry them over from the file on disk rather than re-seeding them. `status` starts at `ready-for-agent`;
`acceptanceCriteria` entries start with `"done": false` and ticking one means flipping it to `true`; `comments` starts
as `[]`; `codeCommit`, `reviewCodeCommit` and `reviewHistoryCommit` all start as `null`. `codeCommit` is written only
by the implement skill, `reviewCodeCommit` only by the final-review skill's phase 2 (the coder's triage), and
`reviewHistoryCommit` only by its phase 1 (the independent reviewer, after committing its review record) — never by
this skill.

### 6. Record the spec's standing decisions

Skip this step when the run didn't start from a spec. Otherwise call the Skill tool with
"modified-matt-domain-modeling" and apply its rules: the three tests, docs stand alone, superseding and removing.

1. **Add what's missing.** Walk the spec's Implementation Decisions and Decision log. Each decision that passes the
   three tests and is not already recorded **or superseded** in `.mysdd/docs/adr/` becomes a new ADR, scoped to the
   paths it binds. The "or superseded" part stops a re-run from re-adding a decision that implement or final-review
   already replaced.
2. **Retire what the spec dropped.** Trace provenance through the spec's own history and its issues' `comments` —
   never through IDs in the ADRs (they carry none).
   - **Every decision this spec ever made:** the Implementation Decisions and Decision log of each committed version
     (`git log --format=%H -- <spec path>`, then `git show <sha>:<spec path>`), plus each replacement recorded as an
     agreed supersession in the `comments` of its issues, `issues/archive/` included. In **local** mode the spec has
     no history, so use the current spec and those `comments` alone, and say that the trace was that narrow.
   - **Its live ADRs:** read every ADR in `.mysdd/docs/adr/` whose status isn't superseded, and match each against
     those decisions by what it states.
   - **Candidates:** a live ADR stating a decision an earlier version made that the current spec no longer carries,
     unless it is a recorded replacement or another feature's spec still carries it; or, once every issue of this spec
     has been retired to `issues/archive/`, every live ADR of this spec, replacements included. Ask for each
     candidate: supersede or remove? Recommend removal only on positive evidence that the decision never reached
     the code: every issue carrying it still reads `ready-for-agent` with `codeCommit: null`, and the code doesn't
     implement it. A `null` `codeCommit` alone proves nothing (setup backfills it on older, finished issues), so
     without that evidence recommend superseding. Never decide for the user.
3. **Collect the files for the commit:** every ADR step 6 added or changed, plus the uncommitted ADRs and glossary
   edits from this spec's design session
   (`git status --short -- .mysdd/docs CONTEXT-MAP.md ':(glob)**/CONTEXT.md'`). A glossary file is committed whole, so
   name any other uncommitted edit it carries.
4. **Show, then write.** List the adds, supersedes, removes and files next to the published issues. Write nothing to
   `.mysdd/docs/` until the user approves, and run the ignore probe with each ADR as a target before writing it.

### 7. Commit the Spec, the issues and the decisions

**Scan for secrets first.** In committed mode this is the spec's first commit, and a secret in history outlives any
later redaction. Before staging, read the spec and the issue files and scan them for secret-shaped strings: API keys and
tokens, `sk-`/`ghp_`/`AKIA`-style prefixes, private key blocks, connection strings or URLs with embedded credentials,
`.env`-style assignments of a secret-looking name, and pasted customer data or PII. If you find any, stop: commit
nothing, tell the user exactly what you found and where, and let them redact it first.

Once the user approves the published issues and step 6, commit the Spec, the issues and the step-6 files as
`.mysdd/issue-tracker.md` § Committing a Spec and its Issues defines, re-running its probe first. Follow it exactly —
this skill does not restate it. In local mode that commit carries only the step-6 files, and there is none when they
are empty. Report the commit's SHA and subject, and each ADR and glossary change it carried, or that no commit was
made and why.

## Next step

Once the Spec, its issues and its decisions are committed — or, in local mode, the decisions alone, if any — the next
step is `/modified-matt-implement`, taking one issue from the frontier.
