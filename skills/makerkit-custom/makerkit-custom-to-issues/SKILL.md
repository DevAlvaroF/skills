---
name: makerkit-custom-to-issues
description: Breaks a plan, spec, or the current conversation into tracer-bullet issues, each declaring its blocking edges as data, published as one JSON file per issue under .mysdd/features/ and committed with the spec. Use when a spec or plan is ready to be cut into issues, or its issues need reconciling after the spec changed.
disable-model-invocation: true
---

# To Issues

Break a plan, spec, or conversation into **issues**: tracer-bullet vertical slices, each declaring the issues that
**block** it.

## Process

### 1. Gather context

Work from what is already in the conversation. If the user passes a spec or issue path, read the whole file.

Read `.mysdd/issue-tracker.md` whole before writing anything: its layout, issue shape and commit rules are the ones
this skill writes to. It must hold exactly one `Tracker contract: 5` line; missing, lower or none → stop and tell the
user to re-run `/makerkit-custom-setup-skills`; higher → stop and tell them to run `npx skills update -p`.

### 2. Ground yourself first

Before exploring, read the project's own documentation, because where it and this skill differ, the repo wins:

- every `AGENTS.md` from the repo root down to each directory the work touches, plus any a file on that chain routes a
  touched concern to — read them directly, since not every agent loads nested files;
- the glossary and the binding ADRs, per `.mysdd/docs/agents/domain.md`;
- the `README.md` of each app or package the feature involves;
- the Makerkit docs, through one sub-agent, per `.mysdd/docs/agents/domain.md` § Makerkit docs; draft the slices that
  don't depend on its answer while it works.

Use the glossary's vocabulary in titles and descriptions. Look for prefactoring that makes the work easier: "make the
change easy, then make the easy change."

### 3. Draft vertical slices

<vertical-slice-rules>

- Each slice cuts a narrow but complete path through every layer (schema, API, UI, tests), never a horizontal slice
  of one layer.
- A completed slice is demoable or verifiable on its own.
- Each slice fits one fresh context window; more than ~10 files created or edited is too big, so split it along
  behaviour, never by layer. A slice crossing migration, policy, types, action, page and tests is still one slice.
- Prefactoring comes first.

</vertical-slice-rules>

For each issue settle:

- its **blocking edges**: the issues that must complete before it can start (none means it starts now);
- its **test boundaries**: the public interface its tests hit, drawn from the spec's Testing Decisions where it has
  them; a new one only where a slice needs it; none for a pure prefactor;
- the `US-NNN` stories it **covers**. Together the issues cover every story not marked `(retired)`; an uncovered story
  is a missed slice or a deliberate deferral, and step 4 finds out which.

**Wide refactors** — one mechanical change whose blast radius breaks call sites across the codebase — can't land as a
green vertical slice, so sequence them expand–contract: add the new form beside the old; migrate call sites in batches
(per package or directory), each blocked by the expand; then delete the old form, blocked by every batch.

### 4. Quiz the user

Show the breakdown as a numbered list: title, blocked by, what it delivers, test boundaries, covers. Ask whether the
granularity is right, whether each blocking edge genuinely gates, what to merge or split, whether the boundaries are
right, which uncovered story is a deliberate deferral, and name each binding ADR (number and title) an issue would
contradict. Iterate until the user approves.

### 5. Publish the issues

List `issues/` and `issues/archive/` in the Feature directory first, and write only once § Committed or local resolves
to a mode.

- **No live issue** → create one file per issue in dependency order, numbered from `01`, or from past the highest
  Retired Issue under `issues/archive/`, since a retired number is never reused.
- **Live issues** → reconcile, below. Write nothing until the whole reconciliation is shown to the user.

Each file follows § Issue shape exactly, every field present, strict JSON. `spec` is the Feature's `spec.md` when the
run started from one, else `null`; `testBoundaries` and `covers` are what step 4 agreed. Each `AGENTS.md` convention
line or routing row the spec agreed rides on the first issue, in dependency order, that touches its area, as an
acceptance criterion naming that `AGENTS.md` and the line verbatim, so `/makerkit-custom-implement` commits it with the
code. No file paths or code snippets, beyond a trimmed prototype snippet that encodes a decision prose can't. Never
modify `spec.md`: it is the user's reviewed record.

#### Reconciling with existing issues

An issue on disk may hold state that exists nowhere else — a status reached through real work, review comments,
ticked criteria, commit SHAs — so reconcile, never regenerate:

1. **Identity is `slug`**, never the number. Match each approved entry to a file by `slug`.
2. **On a match, preserve.** Carry `status`, `comments` and the three commit fields over verbatim, and each
   criterion's `done` by matching `text`; never flip `true` back. Update only `title`, `whatToBuild`, `blockedBy`,
   `testBoundaries`, `covers`, `spec` and criteria added or removed by text. A delivered issue (`codeCommit` set, or
   past `ready-for-agent`) keeps its `whatToBuild`, criteria and boundaries: new work for it goes in a follow-up issue,
   slug `<slug>-followup-<n>`, blocked by it; name any criteria the breakdown dropped from it to the user.
3. **No match is a new issue**, id one past the highest in `issues/` and `issues/archive/`.
4. **Ids and filenames never change**: `blockedBy` addresses issues by them. Order lives in `blockedBy`, so remap edges
   onto the preserved ids.
5. **Never delete.** Ask about each issue with no counterpart: keep it, or move it to `issues/archive/`? Archiving makes
   it a Retired Issue, which unblocks its dependents, so ask for each dependent whether to remap or drop that edge.
6. **A `covers` entry naming a missing or `(retired)` story is dangling**: list it and ask whether the issue is out of
   scope or points at another story; never drop it silently.
7. **Report** every issue and what happened to it: created, follow-up created, updated, preserved, archived.

### 6. Record the spec's standing decisions

Only when the run started from a spec. Apply `/makerkit-custom-domain-modeling`'s rules (the three tests, docs stand
alone, superseding and removing):

1. **Add what's missing.** Each decision in Implementation Decisions or the Decision log that passes the three tests
   and isn't already recorded or superseded in `.mysdd/docs/adr/` becomes an ADR scoped to the paths it binds;
   "or superseded" keeps a re-run from reviving a decision a review already replaced.
2. **Retire what the spec dropped.** Trace every decision this spec ever made through its committed history and the
   supersessions recorded in its issues' `comments` (in local mode the current spec and comments alone — say the trace
   was that narrow), never through ids in the ADRs. A live ADR whose decision the spec no longer carries, and no other
   spec does, is a candidate: ask supersede or remove. Recommend removal only when every issue carrying it is still
   `ready-for-agent` with `codeCommit: null` and the code doesn't implement it; otherwise recommend superseding.
3. **Show, then write.** List the adds, supersedes and removes with the uncommitted `.mysdd/docs/` edits from the design
   session, and write nothing to `.mysdd/docs/` until the user approves: ADRs bind every later run.

### 7. Commit

Once the user approves the issues and step 6, make the `SPEC:` commit per § Commits. First read every file it carries
and scan for secret-shaped strings — keys, tokens, `sk-`/`ghp_`/`AKIA` prefixes, private keys, credentialed URLs,
`.env`-style assignments, customer data: history outlives any later redaction, so on a hit commit nothing and tell the
user what and where. Report the SHA and subject and each ADR and glossary change it carried, or that there was no
commit and why.

## Next step

`/makerkit-custom-implement`, taking one issue from the frontier: any issue whose blockers are all done.
