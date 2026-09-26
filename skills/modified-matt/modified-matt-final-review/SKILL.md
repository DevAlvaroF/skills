---
name: modified-matt-final-review
description: "Run the two-phase final review of an implemented issue: in phase 1 the independent reviewer records every finding and closes only a verified PASS with zero findings; in phase 2 the coder, in a fresh session, triages each finding with the user, applies only the approved fixes and closes the issue. Use when an issue is done-coding-awaiting-final-review and the user asks for its final review or for the coder's triage of that review."
disable-model-invocation: true
---

This skill runs the final review of one issue that `/modified-matt-implement` has already committed. The review has two
phases, run by two different agents in two different sessions:

- **Phase 1, review.** You are the **independent reviewer**, in a fresh session. You review the change, record every
  finding in the issue, and close the issue only on a verified PASS with zero findings. You fix nothing.
- **Phase 2, the coder's triage.** You are the **coder** (the agent that implements, not the reviewer), in a fresh,
  cleared session. Nothing from phase 1's session is in your context: you work from the records in the issue. You
  propose a disposition for every finding, wait for the user to approve it, apply only the approved fixes, record the
  outcome, and close the issue once the triage is complete.

This skill owns the lifecycle of both phases: what to read, when to write the issue, and which commits to make. It does
not own the review technique. In phase 1, run the review itself with whichever review skill is loaded alongside this
one; if none is, review adversarially yourself.

**Read `.mysdd/issue-tracker.md` before you write anything.** It is the contract: the issue JSON shape, the status
lifecycle, the comment records the two phases write, the commit message format, and how an issue is closed. This skill
does not restate it. If the file is missing, stop and tell the user to run `/modified-matt-setup-skills`. If it has no
§ Comment records, or still reserves fixes or `reviewCodeCommit` for the independent reviewer, it predates this
contract: name the conflict and ask the user to update it (re-running `/modified-matt-setup-skills` does) rather than
letting either text win.

Read the glossary and the binding ADRs for the paths the change touches, per `.mysdd/docs/agents/domain.md`. ADRs are
binding. The phase's role (independent reviewer, or coder) is the role you are acting in and nothing more. Where it
conflicts with the project's own instructions (`CLAUDE.md`, `AGENTS.md` and the like), say so and ask the user rather
than deciding the role wins.

## Inputs

The user passes the issue path (`.mysdd/features/<NN>-<feature-slug>/issues/<NN>-<slug>.json`), and may name the agent
that implemented it, the commit, and which phase to run. With no phase named, run phase 1 and stop. Phase 2 never
continues phase 1's session: if the user asks the session that ran phase 1 to go on fixing, tell them phase 2 is run by
the coder in a fresh session.

Read the issue and take from it:

- `codeCommit`: the implementation under review. If it is `null`, the issue hasn't been implemented; stop and tell the
  user. If the user named a different commit, say so and ask which one to review.
- `spec`: the spec the issue came from, or `null`.
- `whatToBuild`, `acceptanceCriteria`, `testBoundaries` and `comments`.

In phase 1, if the status is already `done-final-review`, stop and tell the user: there is nothing left to review. In
phase 2 a closed status is not enough to stop on; phase 2 step 3 says what it means.

**The change** is `codeCommit` plus every fix commit made for this issue since, from every round:
`git log --reverse --format=%H --fixed-strings --grep='Issue: <issue path>' <codeCommit>..HEAD -- .
':(exclude).mysdd/features' ':(exclude).mysdd/kanban-boards.json'` (the pathspec drops the code-free `Closed Issue:`
commits, not an ADR-only fix). Don't rely on `reviewCodeCommit`: it holds only the latest round.

**Writing the issue**, in either phase, follows the tracker: run its ignore probe (§ Ignore policy) with the issue path
as the target, parse the file, mutate the object, write the whole file back as strict JSON, and re-read it to confirm it
parses. If the probe reports an unresolved state, write nothing: list the paths and let the user resolve them. Append
to `comments`; never edit or remove an earlier entry. Never write `codeCommit`. In local mode a close makes no commit
(§ Closing an issue).

## Phase 1: review

1. **Review the whole change** against the issue and, when `spec` is not `null`, the spec — its Decision log included —
   and against the binding ADRs. An ADR change inside the diff stands only if the issue's `comments` record the user
   agreeing to it. When they do, the replacement outranks the matching spec decision
   (`modified-matt-domain-modeling` § Superseding and removing): check the code against the replacement, not the spec
   line. Read the implementer's recorded deviations and tradeoffs, where the implementation record has them, as the
   implementer's stated reasons, not as proof. Hand review sub-agents the commands (`git show <sha>` per commit of the
   change) and the paths; never paste the diff or the spec in.
2. **Verify, don't assume.** Check each acceptance criterion against what the code actually does. A verification you
   could not run — a live UI check with no way to drive the UI, a test that needs a service you don't have — is a
   **failure**, not a pass. Say what was blocked and why.
3. **Decide.**
   - A finding is **blocking** when it should stop the change landing: a regression, a requirement missing or wrong, a
     broken documented standard, a contradiction of a live binding ADR or of a spec decision no agreed
     supersession replaced, a security or data-loss risk, a required verification that was blocked. Anything else is a
     **suggestion**.
   - The verdict is **PASS** when every acceptance criterion holds, nothing was blocked, and no blocking finding
     remains. A PASS can still carry suggestions. Anything else is **NEEDS FIXES**.
4. **Record the review.** Append one phase 1 record to `comments`, in the shape `.mysdd/issue-tracker.md` § Comment
   records gives: its attempt number, the full SHAs of the change you reviewed (oldest first), the verdict, and
   **every** finding numbered — suggestions on a PASS included, and each blocked verification as a blocking finding
   naming what was blocked and why. Give each finding its severity, its location where one applies (never invent a file
   or line for an environment or verification failure), its impact and the correction you ask for. Write
   `Findings: None.` only when there are no findings at all; a PASS with suggestions lists them.
5. **Close only a clean PASS.**
   - **PASS with zero findings**: in the same write, set `status` to `done-final-review`, then make the closing commit
     per `.mysdd/issue-tracker.md` § Closing an issue. Phase 2 has nothing to do.
   - **PASS with suggestions, or NEEDS FIXES**: leave `status` at `done-coding-awaiting-final-review` and make no
     commit. Every finding waits for the coder's triage in phase 2.

Fix nothing in this phase and never write `reviewCodeCommit`. Report the verdict, the findings by number and, if you
closed the issue, the closing commit's SHA, then stop. When findings remain, tell the user that phase 2 is next: the
coder runs it in a fresh session, not in this one.

## Phase 2: the coder's triage

You start with a cleared context. Everything you know about the review comes from the issue's records; never fill a gap
from memory of another session, from `HEAD`, or with an empty finding list you assumed.

1. **Find the review you answer.** Tell the records apart by their labels (§ Comment records), never by the author's
   name or by which comment came last: phase 1 records open with `Final review, phase 1, attempt`, phase 2 records with
   `Final review, phase 2, attempt`, and the implementation record carries `Deviations and tradeoffs:`. Take the latest
   phase 1 record, the implementer's reasoning, and every earlier phase 2 record whose `Answers:` line names that
   attempt. Check the review still describes the code: its reviewed commits must start at `codeCommit`, and every
   commit of the change must be one it reviewed or a fix commit an earlier phase 2 record answering it made. When a
   record is missing, stale or ambiguous, stop and ask the user; say which it is.
2. **Older records.** A review written before this contract carries no `Final review, phase 1` label. Read its findings
   from its own numbered list when it is unambiguous which entry is the review, which findings it holds and which code
   it saw; otherwise ask the user to clarify or to run a new phase 1 review. When no implementation record has a
   deviations and tradeoffs part, take the implementer's reasoning from their older implementation comment where it
   states it unambiguously; otherwise report the reasoning as unknown. Never reconstruct it, and never edit an old
   record to make it look new.
3. **Decide whether there is anything to triage.**
   - The review is a verified PASS with zero findings: nothing needs fixing. Say so and stop, with no commit, no
     `reviewCodeCommit` and no record. If the status is not `done-final-review`, phase 1's close did not land: say so
     and ask the user rather than closing it here.
   - A NEEDS FIXES review, or a failed or blocked review, that records no findings is incomplete evidence, not a clean
     review: ask the user.
   - The status is already `done-final-review` but the review holds findings that no phase 2 record gave an approved
     final disposition — typically an older issue closed on a PASS with suggestions: surface that conflict and ask
     before reopening or changing the issue. Never skip those findings silently, and never overwrite the status.
   - The status is already `done-final-review` and a COMPLETE phase 2 record answering this review settled every
     finding: nothing is left. Say so and stop.
   - An earlier phase 2 attempt answering this review already settled part of it: keep its FIXED, REJECTED and DEFERRED
     verdicts as they stand, and continue only its unresolved work. Never redo a successful fix, change an approved
     verdict without the user saying so, or commit the same fix twice.
4. **Triage, then stop.** Present every finding by its number, blocking and suggestions alike, each with a proposed
   **FIX** (and where), **REJECT** (and why) or **DEFER** (and why), weighing the implementer's recorded deviations and
   tradeoffs. Then wait. Change no code until the user replies approving the triage in so many words. Copying a prompt
   is not approval, and neither is marking a step complete in whatever tool drove this session. For a decision
   contradiction, the triage offers both ways out and the user picks: fix the code, or supersede the ADR per
   `modified-matt-domain-modeling`'s rules. Approving a verdict is not approval to supersede a binding decision; that
   needs the user's own agreement to the supersession. Never edit the spec. A finding the user leaves undecided keeps
   the triage from completing.
5. **Implement the approved fixes**, and nothing beyond them. Use `/modified-matt-tdd` where a fix changes behaviour.
6. **Check.** Run the project's applicable checks (typecheck, tests, lint, build: whatever it defines), sending any
   whole-suite run through a sub-agent that reports failures only. Run them even when the triage changed no code:
   approving a DEFER waives no required check. Then review your own changes against the approved fixes. A required
   check that fails or cannot run, or a fix that falls short, means no success and no commit: skip step 7, leave the
   fixes in the tree, and record each affected fix as unresolved in step 9.
7. **Commit completed, verified fixes.** Stage the implementation files, plus the ADR file(s) the user agreed to change,
   each by path — never `git add .mysdd/`, never `git add -A` — including anything the checks themselves rewrote, such
   as formatter output, so the commit is exactly what was verified. A commit touching only ADRs is a valid
   `CODE REVIEW FIXES: ` commit, not an empty one. Read `git status --short` and confirm nothing unrelated was swept in;
   leave anything else in the tree as you found it. The message follows `.mysdd/issue-tracker.md` § Commit message
   format with the `CODE REVIEW FIXES: ` header. If no file changed (every finding rejected or deferred, or a finding
   was only a blocked verification that now runs), there is nothing to commit: never make an empty commit to have
   something to record. Never push, amend or rebase.
8. **Settle the outcome.** It is **COMPLETE** only when every finding has an approved final disposition (FIXED,
   REJECTED or DEFERRED), every approved fix is verified and every required check passes. A triage that rejects or
   defers everything, with the user's approval, is complete without a code commit. Otherwise it is **INCOMPLETE**
   (approved work is unfinished, or a required check fails) or **BLOCKED** (something outside the change stops it: a
   check that cannot run, a decision the user has not made).
9. **Write the issue once.** If step 7 made a commit, take its full SHA from `git rev-parse HEAD` and write it into
   `reviewCodeCommit`; with no commit this round, leave `reviewCodeCommit` untouched. Never amend the commit to carry
   its own SHA. Append one phase 2 record to `comments` in the shape § Comment records gives: its attempt number, the
   phase 1 attempt and reviewed commits it answers, the outcome, a verdict for every finding by number, the checks you
   ran with their results, the fix commit if there is one, and any ADR the user agreed to supersede, with its
   replacement, by number and title. A finding's verdict is **FIXED** (where, and how it was verified), **REJECTED**
   or **DEFERRED** (with the reason the user approved). An approved FIX that could not be finished stays a FIX,
   recorded as **UNRESOLVED** with its blocker: never label it FIXED, and never turn it into a DEFER the user did not
   approve. A finding the user left undecided is **UNRESOLVED** too, with no approved disposition. Set `status` to
   `done-final-review` only when the outcome is COMPLETE; otherwise leave it at `done-coding-awaiting-final-review`. If
   the write fails after step 7 made a commit, report the commit's SHA and the error instead of making another commit.
10. **Close a complete triage.** When the outcome is COMPLETE, make the closing commit per § Closing an issue. Otherwise
    tell the user what is unresolved and stop; a later phase 2 attempt continues from this record.

Then report: the `CODE REVIEW FIXES: ` SHA and subject if you made one, each finding's disposition, the final status,
and the closing commit's SHA if you made one.
