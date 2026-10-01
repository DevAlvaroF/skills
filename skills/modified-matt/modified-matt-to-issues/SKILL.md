---
name: modified-matt-to-issues
description: Breaks a plan, spec, or the current conversation into tracer-bullet issues, each declaring its blocking edges as data, published as one JSON file per issue under .mysdd/features/ and committed with the spec. Use when a spec or plan is ready to be cut into issues, or its issues need reconciling after the spec changed.
disable-model-invocation: true
---

# To Issues

Break a plan, spec, or conversation into **issues**: tracer-bullet vertical slices, each declaring the issues that
**block** it.

## Process

### 1. Gather context

Work from the conversation; if the user passes a spec or issue path, read the whole file. Read
`.mysdd/issue-tracker.md` whole; it must hold exactly one `Tracker contract: 6` line: with none (or no file) or a lower
number, stop and tell the user to re-run `/modified-matt-setup-skills`; with a higher one, stop and tell them to run
`npx skills update -p`. Its § Layout, § Committed or local, § Issue shape and § Commits are the formats and rules this
skill writes by.

### 2. Explore the codebase

Read the glossary and the binding ADRs for the paths you touch, per `.mysdd/docs/agents/domain.md`, and use the
glossary's vocabulary in titles and descriptions. Look for prefactoring that makes the work easier: "make the change
easy, then make the easy change."

### 3. Draft vertical slices

<vertical-slice-rules>

- Each slice cuts a narrow but complete path through every layer (schema, API, UI, tests), never a horizontal slice of
  one layer, so it is demoable or verifiable on its own.
- Each slice fits one fresh context window. Use file count as the proxy: past ~10 files created or edited, split it
  along behaviour, never by layer.
- Prefactoring goes first.

</vertical-slice-rules>

Give each issue its **blocking edges**, the issues that must finish before it can start, and its **test boundaries**,
the public interfaces its tests hit — drawn from the spec's Testing Decisions where there is one; a pure prefactor may
have none. From a spec, map each slice to the `US-NNN` stories it satisfies (`covers`). Together the issues cover every
story not marked `(retired)`; a story nobody covers is a missed slice or a deliberate deferral, and step 4 finds out
which.

**Wide refactors** are the exception: one mechanical change whose blast radius spans the codebase can't land green as
a vertical slice. Sequence it expand–contract: add the new form beside the old; migrate call sites in batches sized by
blast radius, each an issue blocked by the expand; then delete the old form in an issue blocked by every batch. When
even the batches can't stay green alone, let them share an integration branch that all block a final
integrate-and-verify issue.

### 4. Quiz the user

Present the breakdown as a numbered list: title, blocked by, what it delivers, test boundaries, covers. Ask whether the
granularity is right, whether each edge genuinely gates, what to merge or split, whether the boundaries are right,
which uncovered non-retired stories are deferrals, and whether any issue contradicts a binding ADR (name it by number
and title). Iterate until the user approves.

### 5. Publish the issues

List `issues/*.json` and `issues/archive/*.json` in the Feature first, and resolve the mode per § Committed or local:
if it's unresolved, write nothing and list the paths.

- **No live issue**: create one file per issue, `issues/<NN>-<slug>.json`, in dependency order, numbering from `01`, or
  past the highest id under `issues/archive/` — a Retired Issue's number is never reused, because `blockedBy` may still
  name it.
- **Live issues exist**: reconcile (below), and write nothing until the whole reconciliation is shown to the user.

Each issue follows § Issue shape exactly, as strict JSON with every field present, seeded `ready-for-agent`, criteria
`done: false`, `comments: []` and the three commit fields `null`. `spec` is the Feature's `spec.md` path when this run
started from a spec, else `null`. An `AGENTS.md` line the spec agreed rides on the first issue, in dependency order,
whose slice touches its area, as an acceptance criterion naming that `AGENTS.md` and the line verbatim, so
`/modified-matt-implement` commits it with the code. Never edit `spec.md`, its Spec Record included: the `SPEC:` commit
carries it as the review left it. Keep paths and snippets out, as in the spec.

#### Reconciling with existing issues

An issue on disk may hold state that exists nowhere else — a status reached through real work, review comments, ticked
criteria, commit pointers — so reconcile, never regenerate:

1. **Match by `slug`, never by number.** Numbers are addresses, not identities.
2. **On a match, preserve.** Carry `status`, `comments` and the three commit fields over verbatim, and keep each
   criterion's `done` by matching `text`, never flipping `true` back. Update only `title`, `whatToBuild`, `blockedBy`,
   `testBoundaries`, `covers`, `spec` and added or removed criteria. A delivered issue (`codeCommit` set, or past
   `ready-for-agent`) keeps its `whatToBuild`, criteria and boundaries: new scope goes in a follow-up issue,
   `<slug>-followup-<n>`, blocked by it; name any dropped or reworded criterion to the user and leave it.
3. **No match is a new issue**, numbered past the highest id in `issues/` and `issues/archive/`.
4. **Ids and filenames never change**, so every `blockedBy` stays valid; order lives in `blockedBy`, not numbering.
5. **Never delete.** Ask, for each issue with no counterpart, whether to keep it or move it to `issues/archive/`.
   Archiving makes it a Retired Issue that counts as resolved, so also ask, for each live issue blocked by it, whether
   to remap or drop that edge.
6. **A `covers` entry naming a missing or `(retired)` story** is a dangling reference: list it and ask whether the
   issue is out of scope or points at another story, never silently drop it.
7. **Report** a table of every issue: created, follow-up created, updated, status preserved or archived.

### 6. Record the spec's standing decisions

Skip this without a spec. Otherwise apply `/modified-matt-domain-modeling`'s rules for ADRs:

1. **Add** an ADR for each Implementation Decision or Decision log entry that passes its tests and isn't already
   recorded or superseded in `.mysdd/docs/adr/` — "or superseded", so a re-run doesn't revive a replaced decision.
2. **Retire** what the spec dropped: a live ADR stating a decision an earlier version of this spec made (its committed
   history, plus supersessions agreed in its issues' `comments`; in local mode only the current spec and comments, and
   say the trace was that narrow) that the spec and no other spec still carry. Ask, per candidate, supersede or remove;
   recommend removal only with evidence the decision never reached the code, since a `null` `codeCommit` alone proves
   nothing.
3. **Show, then write**: list the adds, supersedes, removes, and the uncommitted glossary and ADR edits from the design
   session (a glossary file commits whole, so name any other edit it carries), and write nothing to `.mysdd/docs/`
   until the user approves.

### 7. Commit

Read every file the commit carries and stop on anything secret-shaped (keys, tokens, `sk-`/`ghp_`/`AKIA` prefixes,
private keys, credentialed URLs, `.env`-style secrets, PII), telling the user what and where: history outlives any
later redaction. Then make the `SPEC:` commit per § Commits — in local mode it holds only the glossary and ADR changes,
and there is none without them. Report its SHA and subject and each ADR and glossary change, or why there is no commit.

## Next step

`/modified-matt-implement`, taking one issue from the frontier: an issue whose blockers are all done.
