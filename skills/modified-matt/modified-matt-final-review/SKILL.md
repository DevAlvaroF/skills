---
name: modified-matt-final-review
description: "Runs the two-phase final review of an implemented issue: the independent reviewer records and commits every finding without closing the issue; the coder, in a fresh session, weighs each finding objectively, applies the fixes the user approves and closes the issue — even when there was nothing to fix. Use when an issue is done-coding-awaiting-final-review and the user asks for its final review or for the coder's triage of it."
disable-model-invocation: true
---

The final review of an issue `/modified-matt-implement` committed runs in two fresh sessions, so the reviewer never
grades fixes to its own findings and the coder works from the record, not memory:

- **Phase 1**: you are the independent reviewer. Review the change, record every finding and commit the record; fix
  nothing and never close the issue.
- **Phase 2**: you are the coder. Triage each finding with the user, apply only approved fixes, run the checks, record
  the outcome and close on COMPLETE. It runs even after a clean PASS: only it closes, and the checks must still pass.

Read `.mysdd/issue-tracker.md` whole; it must hold exactly one `Tracker contract: 6` line: with none (or no file) or a
lower number, stop and tell the user to re-run `/modified-matt-setup-skills`; with a higher one, stop and tell them to
run `npx skills update -p`. Its § Comment records and § Commits define every record, subject and done rule used here,
and § Committed or local must resolve before you write. Read the glossary and binding ADRs for the touched paths, per
`.mysdd/docs/agents/domain.md`. The phase's role doesn't outrank the project's own instructions: on a conflict, ask.

## Inputs

The user passes the issue path, and may name the implementer, a commit or the phase. With no phase named, take the
first case that fits the issue and `git log`:

- `status` is `done-final-review`: phase 2, which says what is left.
- The latest phase 1 record lacks its `REVIEW HISTORY:` commit, or `reviewHistoryCommit` doesn't name it: phase 1.
- No review yet: phase 1.
- The latest phase 1 record's `Reviewed commits:` start at `codeCommit` and cover the change, bar fixes an earlier
  phase 2 made, and no `Outcome: COMPLETE` answers it: phase 2.

Anything else is ambiguous: ask. Say the phase and role you inferred and write nothing until the user confirms, since a
record can't be taken back. Phase 2 never continues phase 1's session.

`codeCommit` is the implementation: `null` means there is nothing to review, so stop; if the user named another commit,
ask which. Also take `spec`, `whatToBuild`, `acceptanceCriteria`, `testBoundaries` and `comments`.

**The change** is `codeCommit` plus every later commit whose `Issue:` trailer names this issue path, minus the
bookkeeping commits touching only `.mysdd/features/` and `.mysdd/kanban-boards.json`; an ADR-only fix stays in.
`reviewCodeCommit` holds only the latest round, so never use it for this.

**Writing the issue**: write the whole object back as strict JSON with every field carried over, since other programs
parse it. Only append to `comments`. Never write `codeCommit`; phase 1 writes only its record and `reviewHistoryCommit`.

## The phase files

Once the phase is settled, read its file in full before writing anything:

<!-- oxfmt-ignore -->
| Phase | File | For |
|---|---|---|
| 1 | [PHASE-1.md](./PHASE-1.md) | the independent review, recorded and committed |
| 2 | [PHASE-2.md](./PHASE-2.md) | the coder's triage, its fixes, the close and its additional plans |
