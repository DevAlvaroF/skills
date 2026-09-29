---
name: makerkit-custom-final-review
description: "Runs the two-phase final review of an implemented issue: the independent reviewer records and commits every finding without closing the issue; the coder, in a fresh session, weighs each finding objectively, applies the fixes the user approves and closes the issue — even when there was nothing to fix. Use when an issue is done-coding-awaiting-final-review and the user asks for its final review or for the coder's triage of it."
disable-model-invocation: true
---

The final review of an issue `/makerkit-custom-implement` committed runs in two phases, two agents, two fresh
sessions, so whoever judges the code never fixes it in the same breath:

- **Phase 1**: the **independent reviewer** records every finding in the issue and commits that record. It fixes
  nothing and never changes `status`, whatever the verdict.
- **Phase 2**: the **coder**, with nothing of phase 1's session in context, weighs every finding, applies what the
  user approves, runs the checks, records the outcome and closes on COMPLETE. It runs even after a zero-finding PASS:
  only it closes, and the checks must still pass.

Read `.mysdd/issue-tracker.md` whole before writing anything: its issue shape, comment records and commit rules are
the ones both phases write to. It must hold exactly one `Tracker contract: 5` line; missing, lower or none → stop and
tell the user to re-run `/makerkit-custom-setup-skills`; higher → stop and tell them to run `npx skills update -p`.

## Ground yourself first

For the touched paths, read every `AGENTS.md` from the repo root down, plus any the chain routes a touched concern to,
and the glossary and binding ADRs per `.mysdd/docs/agents/domain.md`: the repo wins where it and this skill differ.
The phase's role is only the role you act in; where it conflicts with those instructions, ask.

## Inputs

The user passes the issue path, and may name the implementer, commit and phase. With no phase named, infer it from the
issue and `git log` alone, first match wins:

- `status` is `done-final-review` → phase 2, which says what is left.
- The latest phase 1 record has no `REVIEW HISTORY:` commit for its attempt, or `reviewHistoryCommit` doesn't name it
  → phase 1, to finish its bookkeeping.
- No review yet → phase 1.
- The latest phase 1 record's reviewed commits start at `codeCommit`, every commit of the change is one it reviewed or
  a fix commit an earlier phase 2 record answering it made, and no COMPLETE phase 2 answers it → phase 2.

Anything else (a stale review, an unlabelled older record) is ambiguous: ask. Say which phase you inferred and its
role, and write nothing until the user confirms: each role writes different things. Phase 2 never continues phase 1's
session.

Work from the issue's `codeCommit` (`null`: not implemented, stop; the user named another: ask), `spec`,
`whatToBuild`, `acceptanceCriteria`, `testBoundaries` and `comments`.

**The change** is `codeCommit` plus every later commit whose `Issue:` trailer names this issue's path, minus the
bookkeeping commits that touch only `.mysdd/features/` or `.mysdd/kanban-boards.json` (review records, markers,
closes); an ADR-only fix stays in. Not `reviewCodeCommit`: it holds only the latest round. Don't open other commits.

**Writing the issue** waits for § Committed or local to resolve to a mode, follows § Issue shape's one-writer table,
and only appends to `comments`: an earlier record is evidence the next phase reads.

## The phase files

Once the phase is settled, read its file in full, and only that one, before writing anything:

| Phase | File | For |
|---|---|---|
| 1 | [PHASE-1.md](./PHASE-1.md) | the independent review, recorded and committed |
| 2 | [PHASE-2.md](./PHASE-2.md) | the coder's triage, its fixes, the close and its additional plans |
