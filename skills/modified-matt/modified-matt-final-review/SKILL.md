---
name: modified-matt-final-review
description: "Runs the two-phase final review of an implemented issue: the independent reviewer records and commits every finding without closing the issue; the coder, in a fresh session, weighs each finding objectively, applies the fixes the user approves and closes the issue — even when there was nothing to fix. Use when an issue is done-coding-awaiting-final-review and the user asks for its final review or for the coder's triage of it."
disable-model-invocation: true
---

This skill runs the final review of one issue that `/modified-matt-implement` has already committed. The review has two
phases, run by two different agents in two different sessions:

- **Phase 1, review.** You are the **independent reviewer**, in a fresh session. You review the change, record every
  finding in the issue, and commit that record so the review is visible in git history. You fix nothing, and you never
  close the issue, whatever the verdict.
- **Phase 2, the coder's triage.** You are the **coder** (the agent that implements, not the reviewer), in a fresh,
  cleared session. Nothing from phase 1's session is in your context: you work from the records in the issue. You weigh
  every finding on its merits, propose a disposition for each, wait for the user to approve it, apply only the approved
  fixes, run the checks, record the outcome, and close the issue when the outcome is COMPLETE. Phase 2 runs even after a
  PASS with zero findings: it is the only phase that closes, and the checks still have to pass first.

This skill owns the lifecycle of both phases: what to read, when to write the issue, and which commits to make. It does
not own the review technique. In phase 1, run the review itself, on the change PHASE-1.md step 1 names, with whichever
review skill is loaded alongside this one. If none is, run the passes of `/modified-matt-implement`'s
[REVIEW.md](../modified-matt-implement/REVIEW.md) yourself on the same commits: Standards with its smell baseline, and
Spec scoped to this issue. Skip its _Assess refactors_ step: phase 1 fixes nothing.

**Read `.mysdd/issue-tracker.md` before you write anything:** its contract line and its Contents row for review phase 1
or review phase 2, whichever you run, then those sections in full, by the commands its § Contents gives, never the whole
file. The file is the contract. This skill does not restate it. If the file is missing, stop and tell the user to run
`/modified-matt-setup-skills`. Check its contract line with
`sh "<this skill's directory>/scripts/check-tracker-contract.sh" 4`. If it exits non-zero, write nothing and relay its
message: on exit 1 the tracker is behind, so have the user re-run `/modified-matt-setup-skills`; on exit 3 the skills
are behind, so have them run `npx skills update -p`, and update the app too if its prompt named a lower number; on any
other exit, report the error.

Read the glossary and the binding ADRs for the paths the change touches, per `.mysdd/docs/agents/domain.md`. ADRs are
binding. The phase's role (independent reviewer, or coder) is the role you are acting in and nothing more. Where it
conflicts with the project's own instructions (`CLAUDE.md`, `AGENTS.md` and the like), say so and ask the user rather
than deciding the role wins.

## Inputs

The user passes the issue path (`.mysdd/features/<NN>-<feature-slug>/issues/<NN>-<slug>.json`), and may name the agent
that implemented it, the commit, and which phase to run. With no phase named, infer it from the issue, taking the first
case that fits:

- `status` is `done-final-review`: phase 2, which says what is left.
- The latest phase 1 record has no `REVIEW HISTORY:` commit for its attempt, or `reviewHistoryCommit` doesn't name that
  commit: phase 1, to finish its bookkeeping.
- The issue holds no review yet: phase 1.
- The latest phase 1 record's reviewed commits start at `codeCommit`, every commit of the change below is one it
  reviewed or a fix commit an earlier phase 2 record answering it made, and no COMPLETE phase 2 record answers it:
  phase 2.

Decide from the issue and `git log` alone, and read only the chosen phase's file. Anything else, such as a stale
review or an older record without labels, is ambiguous: ask. Say which phase you
inferred and the role it gives you, and write nothing until the user confirms. Phase 2 never continues phase 1's
session: if the user asks the session that ran phase 1 to go on fixing, tell them phase 2 is run by the coder in a
fresh session.

Read the issue and take from it:

- `codeCommit`: the implementation under review. If it is `null`, the issue hasn't been implemented; stop and tell the
  user. If the user named a different commit, say so and ask which one to review.
- `spec`: the spec the issue came from, or `null`.
- `whatToBuild`, `acceptanceCriteria`, `testBoundaries` and `comments`.

In phase 1, if the status is already `done-final-review`, stop and tell the user: there is nothing left to review. In
phase 2 a closed status is not enough to stop on; PHASE-2.md step 3 says what it means.

**The change** is `codeCommit` plus every fix commit made for this issue since, from every round:
`git log --reverse --format=%H --fixed-strings --grep='Issue: <issue path>' <codeCommit>..HEAD -- .
':(exclude).mysdd/features' ':(exclude).mysdd/kanban-boards.json'`. The pathspec drops the code-free bookkeeping
commits: a `REVIEW HISTORY:` commit touches only the issue file (a local-mode marker touches nothing), and a
`Closed Issue:` commit only the issue and board files. It keeps an ADR-only fix. Don't rely on `reviewCodeCommit`: it
holds only the latest round. Commits outside that list are not the change; don't open them.

**Writing the issue**, in either phase, follows the tracker: run its ignore probe (§ Ignore policy) with the issue path
as the target, parse the file, mutate the object, write the whole file back as strict JSON, and re-read it to confirm it
parses. If the probe reports an unresolved state, write nothing: list the paths and let the user resolve them. Append
to `comments`; never edit or remove an earlier entry. Never write `codeCommit`. Phase 1 writes only its record and
`reviewHistoryCommit`; phase 2 carries `reviewHistoryCommit` over as it stands.

## The phase files

Once the phase is settled, read its own file in full before writing anything:

| Phase | File | For |
|---|---|---|
| 1 | [PHASE-1.md](./PHASE-1.md) | the independent review, recorded and committed |
| 2 | [PHASE-2.md](./PHASE-2.md) | the coder's triage, its fixes, the close and its additional plans |
