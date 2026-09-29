# Phase 2: the coder's triage

You start with a cleared context. Everything you know about the review comes from the issue's records; never fill a gap
from memory of another session, from `HEAD`, or with an empty finding list you assumed. From the start of the attempt,
keep the inventory of additional plans that § Additional plans below describes.

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
3. **Decide what this attempt has to do.**
   - **Zero findings.** A current, verified PASS whose record reads `Findings: None.` has nothing to triage, so skip
     step 4's approval — there is nothing for the user to approve — and go on with steps 6 to 10: run the applicable
     checks, settle the outcome, write the record with `Verdicts: None.` and the checks' actual results, and close only
     on COMPLETE. With no fix, step 7 commits only what a check rewrote in the change's files, and still runs
     § Additional plans.
   - **Closed by an older contract.** The status is already `done-final-review`, the review is a verified PASS with
     zero findings, and no phase 2 record answers it: phase 1 closed it under an earlier version of this contract. It
     stays closed. Say so and stop, without rewriting the issue or recording anything.
   - **A saved close is not a finished close.** The status is already `done-final-review` and a COMPLETE phase 2 record
     answers this review. The status was written before the close commit, so it doesn't prove that commit landed, and
     neither the record nor the close proves the attempt's additional plans were committed: check the close
     bookkeeping per § Closing an issue and the planning operation per § Additional plans. When it is all
     there, nothing is left; say so and stop. When something is missing, make only that: the close commit, or the
     attempt's proven pending planning commit — no new record, no second triage, no new fix commit.
   - A NEEDS FIXES review, or a failed or blocked review, that records no findings is incomplete evidence, not a clean
     review: ask the user.
   - The status is already `done-final-review` but the review holds findings that no phase 2 record gave an approved
     final disposition — typically an older issue closed on a PASS with suggestions: surface that conflict and ask
     before reopening or changing the issue. Never skip those findings silently, and never overwrite the status.
   - An earlier phase 2 attempt answering this review already settled part of it: keep its FIXED, REJECTED and DEFERRED
     verdicts as they stand, and continue only its unresolved work. Never redo a successful fix, change an approved
     verdict without the user saying so, or commit the same fix twice.
4. **Weigh every finding, then stop.** You wrote this code and another model reviewed it, and that pulls two ways at
   once: toward accepting a finding because a reviewer raised it, and toward rejecting it because it criticises your
   work. Neither pull is evidence, and neither is the reviewer's identity or your own earlier confidence, so judge each
   finding on its merits: check its claim against the code and the recorded requirements before proposing anything,
   and say what you found. Present every finding by its number, blocking and suggestions alike, each with a proposed
   **FIX** (where and how you would implement it), **REJECT** (why the claim does not hold or is not worth its cost) or
   **DEFER** (why it belongs elsewhere), weighing the implementer's recorded deviations and tradeoffs. Then wait.
   Change no code until the user replies approving the triage in so many words. Copying a prompt is not approval, and
   neither is marking a step complete in whatever tool drove this session. For a decision contradiction, the triage
   offers both ways out and the user picks: fix the code, or supersede the ADR per `modified-matt-domain-modeling`'s
   rules. Approving a verdict is not approval to supersede a binding decision; that needs the user's own agreement to
   the supersession. Never edit the spec. A finding the user leaves undecided keeps the triage from completing.
5. **Implement the approved fixes**, and nothing beyond them. Use `/modified-matt-tdd` where a fix changes behaviour.
6. **Check.** Run the project's applicable checks (typecheck, tests, lint, build: whatever it defines), sending any
   whole-suite run through a sub-agent that reports failures only. Run them even when the triage changed no code or the
   review had no findings: approving a DEFER, or having nothing to fix, waives no required check. Then review your own
   changes against the approved fixes. A required check that fails or cannot run, or a fix that falls short, means no
   success and no fix commit: skip step 7's fix commit (its § Additional plans operation still runs), leave the fixes
   in the tree, and record each affected fix as unresolved in step 9. A required check that passes only with a rewrite
   step 7 leaves uncommitted has not passed: ask the user.
7. **Commit completed, verified fixes**, on the current branch, whichever it is. Stage the files the approved fixes
   changed, plus the ADR file(s) the user agreed to change, each by path — never `git add .mysdd/`, never `git add -A` —
   with every rewrite the checks made (formatter, `lint:fix`, typegen output) in a file of the whole change: any commit
   of the issue (SKILL.md's **The change**), not only the fixes. Find the rewrites by comparing `git status --porcelain`
   from before step 6; list any outside the change and leave it uncommitted, as the user's to decide. A commit touching
   only ADRs or only such rewrites is a valid `CODE REVIEW FIXES: ` commit, not an empty one. Commit by the route in
   `.mysdd/issue-tracker.md` § Commit message format, leaving anything else in the tree as you found it; the message
   follows that section, with the `CODE REVIEW FIXES: ` header. With nothing to stage (no findings, every finding
   rejected or deferred, or a finding was only a blocked verification that now runs, and no rewrite in the change),
   there is nothing to commit: never make an empty commit to have something to record. Never push, amend or rebase.
   Right after the fix commit, before any other commit, confirm it is yours — its parent is the `HEAD` you committed on
   and its subject is the one you wrote — and capture its full 40-character SHA for step 9. If the route stops on failed
   isolation, that commit is not the fix commit: make no further commit, planning or close, and step 9 records the
   outcome BLOCKED with its SHA and the foreign paths, never in `reviewCodeCommit` or `Fix commit:`. Otherwise, with or
   without a fix commit, run § Additional plans: eligible plans get a planning-only commit of their own, never a place
   in this one.
8. **Settle the outcome.** It is **COMPLETE** only when every finding has an approved final disposition (FIXED,
   REJECTED or DEFERRED), every approved fix is verified and every required check passes. A triage that rejects or
   defers everything, with the user's approval, is complete without a code commit, and so is a review with no findings
   once the checks pass. Otherwise it is **INCOMPLETE** (approved work is unfinished, or a required check fails) or
   **BLOCKED** (something outside the change stops it: a check that cannot run, a decision the user has not made).
9. **Write the issue once.** If step 7 made a fix commit, write the full SHA step 7 captured into `reviewCodeCommit` —
   never a later `git rev-parse HEAD`, which may by then name the planning commit; with no fix commit this round, leave
   `reviewCodeCommit` untouched. Never amend the commit to carry its own SHA, and never put the planning commit's SHA
   into `reviewCodeCommit` or `Fix commit:`. Append one phase 2 record to `comments` in the shape § Comment records
   gives: its attempt number, the phase 1 attempt and reviewed commits it answers, the outcome, a verdict for every
   finding by number (or `Verdicts: None.`), the checks you ran with their results, the fix commit if there is one, the
   `Attempt plans:` inventory (§ Additional plans), and any ADR the user agreed to supersede, with its replacement, by
   number and title. A finding's verdict is **FIXED** (where, and how it was verified), **REJECTED** or **DEFERRED**
   (with the reason the user approved). An approved FIX that could not be finished stays a FIX, recorded as
   **UNRESOLVED** with its blocker: never label it FIXED, and never turn it into a DEFER the user did not approve. A
   finding the user left undecided is **UNRESOLVED** too, with no approved disposition. Set `status` to
   `done-final-review` only when the outcome is COMPLETE; otherwise leave it at `done-coding-awaiting-final-review`. If
   the write fails after step 7 made a commit, report the SHAs of the commits made and the error instead of making
   another commit.
10. **Close a complete triage.** Only this phase closes an issue, and only on COMPLETE. In committed mode make the
    closing commit per § Closing an issue; it also carries the `reviewHistoryCommit` phase 1 left uncommitted. In
    local mode make no commit, and say so: the issue is closed locally, with no close commit. Local mode skips only
    the close commit, not step 7's planning commit, and neither a planning commit nor its absence says anything about
    the close. If the close commit fails, the saved record and status stand; report the error, and a retry makes only
    that commit (step 3). When the outcome is not COMPLETE, tell the user what is unresolved and stop; a later phase 2
    attempt continues from this record.

Then report: the `CODE REVIEW FIXES: ` SHA and subject if you made one, each finding's disposition, the checks and
their results, the final status, and the closing commit's SHA if you made one — or, in local mode, that no close commit
was made. Report the additional plans apart from both: the planning commit's full SHA and paths when you made or reused
one, and every additional plan left uncommitted with its path and specific reason (ignored, missing, out of scope,
uncertain ownership, changed content, Git failure, conflicting project rule). Never report the work as done while the
planning operation is unresolved.

## Additional plans

An **additional plan** is a plan file that you, or an agent you delegated to, created inside the repository for this
phase 2 attempt — for example under `.claude/plans` for Claude Code; an agent that writes no plan files has none.
`.mysdd/issue-tracker.md` § Committing additional plans owns what happens to them: provenance, eligibility, the ignore
probe, the planning-only `ATTEMPT PLANS: final review <issue path> attempt <K>` commit and its verification, the
`Attempt plans:` value and the retries. What this phase adds:

- **Keep the inventory from the start.** Confirm a path is absent before you create it, and have every delegate name
  the exact paths it created. Ownership is established when a file is created, never inferred afterwards from Git
  status, so an earlier attempt's leftover is never swept up.
- **Order.** Step 7 captures the fix commit's SHA before the planning commit, which would otherwise be the `HEAD` a
  later lookup found, then runs the planning operation for every outcome — no code change, zero findings, checks
  blocked, local mode. Step 9 records the result; a planning failure is recorded as each affected plan's reason and
  never stops the record.
- **Retries.** Neither a saved COMPLETE record nor a landed close commit proves the plans were committed, so check
  this operation before any of step 3's stops.
- A project or tracker instruction that explicitly forbids committing these plans is a conflict: surface it and ask,
  never override it.
