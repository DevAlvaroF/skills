# Phase 2: the coder's triage

Everything you know about the review comes from the issue's records, never from another session, `HEAD` or an assumed
empty finding list. From the start, keep the inventory of additional plans (§ Additional plans).

1. **Find the review you answer**, by opening label, never author or position: the latest
   `Final review, phase 1, attempt` record, the implementation record's `Deviations and tradeoffs:`, and earlier
   `Final review, phase 2, attempt` records whose `Answers:` name that attempt. Its `Reviewed commits:` must start at
   `codeCommit` and cover the change, bar fix commits an earlier answer made. Missing, stale or ambiguous (an unlabelled
   older review included): say which and ask. Never reconstruct reasoning or edit an old record.
2. **Decide what is left.**
   - `Findings: None.` on a current PASS: nothing to approve, so skip step 3's wait; the checks still decide.
   - `done-final-review` with an `Outcome: COMPLETE` answer: a saved status doesn't prove its commits landed, so make
     only a missing `Closed Issue:` or `ATTEMPT PLANS:` commit, or say nothing is left. With no answer on a zero-finding
     PASS, an older contract closed it: say so and stop.
   - Any other `done-final-review`, or NEEDS FIXES with no findings: ask; never overwrite the status.
   - An earlier answer: keep its FIXED, REJECTED and DEFERRED verdicts and work only on UNRESOLVED, so nothing is fixed
     or committed twice.
3. **Weigh every finding, then stop.** Being reviewed pulls you toward accepting a finding because it was raised and
   toward rejecting it because it criticises your code; neither is evidence. Check each claim against the code and
   requirements, weigh `Deviations and tradeoffs:`, and propose per finding, by number, **FIX** (where and how),
   **REJECT** (why it fails or isn't worth its cost) or **DEFER** (where it belongs). Then wait for the user's explicit
   reply approving the triage before changing code: being invoked, a copied prompt or a marked step is not approval,
   and without it a fix changes code nobody agreed to. For an ADR contradiction offer both ways
   out, fixing the code or superseding the ADR by `/modified-matt-domain-modeling`'s rules, and supersede only on the
   user's own agreement. Never edit the spec. An undecided finding keeps the triage from completing.
4. **Implement the approved fixes**, nothing more, with `/modified-matt-tdd` where behaviour changes.
5. **Check**: the project's typecheck, tests, lint and build, whole-suite runs through a failures-only sub-agent, even
   with nothing fixed, since a DEFER waives no check. A failing or unrunnable check, or a fix that falls short, means no
   fix commit: those fixes stay in the tree, UNRESOLVED. A pass that needs an uncommitted rewrite hasn't passed: ask.
6. **Commit verified fixes** as `CODE REVIEW FIXES:` per § Commits, with the ADRs the user agreed to change and the
   checks' rewrites in files of the change (list others and leave them: they're the user's). Nothing to stage, no
   commit. Take its SHA from the commit you made, then run § Additional plans either way.
7. **Settle the outcome.** `Outcome: COMPLETE` only when every finding has a user-approved FIXED, REJECTED or DEFERRED,
   every fix is verified and every check passes, with or without a code commit. Otherwise `Outcome: INCOMPLETE`
   (approved work unfinished, a check failing) or `Outcome: BLOCKED` (a check can't run, a decision is missing, a
   commit holds foreign paths).
8. **Write the issue once.** The fix commit's SHA goes in `reviewCodeCommit`, never a later `HEAD` or the planning
   commit's; with none, leave it. Append the phase 2 record per § Comment records, labels in order:
   `Final review, phase 2, attempt <K>`, `Answers:`, `Outcome:`, `Verdicts:` (or `Verdicts: None.`), `Checks:`,
   `Fix commit:` (or `Fix commit: None.`), `Attempt plans:`, `ADRs superseded:`. An approved FIX not finished is
   `UNRESOLVED — approved FIX: <what>; blocker: <failure>`, an undecided one `UNRESOLVED — no approved disposition`,
   never FIXED or an unapproved DEFER. Set `done-final-review` only on COMPLETE, since that status moves the card to
   Done. A failed write after a commit: report the SHAs and the error, commit nothing more.
9. **Close on COMPLETE**: in committed mode the `Closed Issue: <issue path>` commit, which also carries the uncommitted
   `reviewHistoryCommit`; in local mode no commit, and say so. A failed close leaves record and status standing; a
   retry makes only that commit. Not COMPLETE: say what is unresolved; a later attempt continues from this record.

Report the fix commit's SHA and subject, each disposition, the checks, the final status, the close commit's SHA (or
none), and apart, the `ATTEMPT PLANS:` SHA and paths and each plan left out with its reason.

## Additional plans

Plan files you or a delegate created in the repository for this attempt, such as under `.claude/plans`. Own a path only
from its creation (it was absent; delegates name theirs), never from `git status`, which would sweep up leftovers. After the fix commit, commit the eligible ones — created by this attempt, not
ignored, not bound elsewhere — in their own `ATTEMPT PLANS: final review <issue path> attempt <K>` commit per
§ Commits, for every outcome and in local mode too, unless a commit held foreign paths, which ends all committing.
Record them as `Attempt plans:`; a failure becomes that plan's reason and never stops the record. A project rule
forbidding the commit is a conflict: ask.
