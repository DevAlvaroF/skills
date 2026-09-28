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
not own the review technique. In phase 1, run the review itself with whichever review skill is loaded alongside this
one; if none is, review adversarially yourself.

**Read `.mysdd/issue-tracker.md` before you write anything.** It is the contract: the issue JSON shape, the status
lifecycle, the comment records the two phases write, how phase 1 commits its record, the commit message format, and how
an issue is closed. This skill does not restate it. If the file is missing, stop and tell the user to run
`/modified-matt-setup-skills`.

Then check that the tracker is this contract and not an older one, before any write. This holds when the user invoked
this skill directly, with no prompt from a tool around it: the tracker is then the only statement of the rules. The
tracker predates this contract when any of these is true:

- it has no § Comment records, or still reserves fixes or `reviewCodeCommit` for the independent reviewer;
- it lets phase 1 set `done-final-review` or make the close commit;
- its issue shape has no `reviewHistoryCommit`, or it has no § Recording a final review with its `REVIEW HISTORY: `
  commit;
- it forbids the local-mode review marker, for example by skipping every bookkeeping commit in local mode with no
  exception for it;
- it has no § Committing additional plans, or its record commits are not literal-path `git commit --only` — for
  example, it still offers an isolated index for the review record.

Comment records and coder-owned fixes alone don't settle it: an older tracker has both and still closes in phase 1. On
a mismatch, write nothing: name the conflict and ask the user to update the tracker (re-running
`/modified-matt-setup-skills` does), rather than letting this skill, the prompt that drove it or the tracker win
silently.

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
':(exclude).mysdd/features' ':(exclude).mysdd/kanban-boards.json'`. The pathspec drops the code-free bookkeeping
commits: a `REVIEW HISTORY:` commit touches only the issue file (a local-mode marker touches nothing), and a
`Closed Issue:` commit only the issue and board files. It keeps an ADR-only fix. Don't rely on `reviewCodeCommit`: it
holds only the latest round.

**Writing the issue**, in either phase, follows the tracker: run its ignore probe (§ Ignore policy) with the issue path
as the target, parse the file, mutate the object, write the whole file back as strict JSON, and re-read it to confirm it
parses. If the probe reports an unresolved state, write nothing: list the paths and let the user resolve them. Append
to `comments`; never edit or remove an earlier entry. Never write `codeCommit`. Phase 1 writes only its record and
`reviewHistoryCommit`; phase 2 carries `reviewHistoryCommit` over as it stands.

## Phase 1: review

**Finish before you start again.** When the latest phase 1 record already reviewed the change as it stands now but its
bookkeeping is unfinished — no `REVIEW HISTORY:` commit for its attempt, or `reviewHistoryCommit` not naming that
commit — this run is a retry of it: go straight to step 5 and finish only what is missing, rather than reviewing again
under a new attempt number.

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
   `Findings: None.` only when there are no findings at all; a PASS with suggestions lists them. Leave `status` as it
   is, whatever the verdict.
5. **Commit the review record** as `.mysdd/issue-tracker.md` § Recording a final review directs. The commit is what
   lets the user, coming back later, see that the review happened. The tracker owns the message, the literal-path
   `commit --only` route (a plain `git commit` would sweep in whatever else the user had staged), the local-mode empty
   marker, how to identify the commit you created without trusting `HEAD`, writing its SHA into `reviewHistoryCommit`
   and leaving that one change uncommitted (a commit cannot contain its own SHA), and the retries. The marker is only
   for a local mode the probe positively established, never a fallback for a failure; a failed commit never erases the
   saved review, and one review never gets a second record or a second commit.

Fix nothing in this phase, and never write `status` or `reviewCodeCommit` or make the close commit: phase 2 closes, even
after a clean PASS. Report three outcomes separately — the record saved; the record committed, with its SHA (in local
mode, "local record saved; marker committed"); and the SHA written to `reviewHistoryCommit` — then the verdict and the
findings by number, and stop. Tell the user that phase 2 is next, even with zero findings: the coder runs it in a fresh
session, not in this one.

## Phase 2: the coder's triage

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
     on COMPLETE. With no changed file there is no fix commit, but step 7 still runs § Additional plans. If a check
     rewrites files, the tree is no longer unchanged: show the user those changes, and review and verify them like a
     fix before step 7 commits them.
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
   in the tree, and record each affected fix as unresolved in step 9.
7. **Commit completed, verified fixes.** Stage the implementation files, plus the ADR file(s) the user agreed to change,
   each by path — never `git add .mysdd/`, never `git add -A` — including anything the checks themselves rewrote, such
   as formatter output, so the commit is exactly what was verified. A commit touching only ADRs is a valid
   `CODE REVIEW FIXES: ` commit, not an empty one. Read `git status --short` and confirm nothing unrelated was swept in;
   leave anything else in the tree as you found it. The message follows `.mysdd/issue-tracker.md` § Commit message
   format with the `CODE REVIEW FIXES: ` header. If no file changed (no findings, every finding rejected or deferred,
   or a finding was only a blocked verification that now runs), there is nothing to commit: never make an empty commit
   to have something to record. Never push, amend or rebase. Right after the fix commit, before any other commit,
   confirm it is yours — its parent is the `HEAD` you committed on and its subject is the one you wrote — and capture
   its full 40-character SHA for step 9. Then, with or without a fix commit, run § Additional plans: eligible plans get
   a planning-only commit of their own, never a place in this one.
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

### Additional plans

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
