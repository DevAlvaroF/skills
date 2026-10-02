# Step E — triage and fix the review's findings

You are the coder, in a fresh session: work from the plan's records, not memory. Your key is `code-fix`.

1. **Find the review:** the latest D attempt, its `reviewedCommits` and `findings`; the latest C attempt's
   `deviations` gives the reasoning behind the code, or it is unknown. Ask when anything is missing, stale or unclear
   rather than substitute memory, `HEAD` or an empty list of findings. A COMPLETE attempt already recorded for this
   review needs only its unfinished bookkeeping.
2. **Weigh every finding, then stop.** You wrote this code and another model reviewed it; don't accept a finding because
   it was raised or reject it because it criticises you — check it against the code, the plan and the deviations. For
   each, by number, propose FIX (where, how), REJECT or DEFER (why), then change no code until the user has said FIX,
   REJECT or DEFER for every finding: a fix begun while others are undecided may be undone or reshaped by them, and one
   nobody agreed to changes code unasked. Being invoked or marked is not approval. A PASS with zero findings has nothing
   to approve; one with suggestions still does. Keep asking; never record a finding undecided: nobody would act on it.
3. **Fix only the approved findings**, run the applicable checks and review your own change.
4. **Settle the outcome.** COMPLETE only when every finding has an approved disposition, every approved fix is
   verified and every required check passes; approving a deferral waives no check. INCOMPLETE or BLOCKED only for
   approved work you can't finish, once the user, told what is left, agrees to stop there: a short fix is work to
   finish, not an outcome. The exception: a commit holding foreign paths ends BLOCKED at once (SKILL.md § Commits).
5. **Commit the code only when COMPLETE with code changes**, under `CODE REVIEW FIXES: <imperative summary>`, then
   the additional plans (below).
6. **Record the attempt** in `attempts`, with the code commit's SHA in `commit` and `commits["code-fix"]`, or with
   none, `commit` as `null` and `commits["code-fix"]` untouched:

   ```json
   {
     "step": "E",
     "attempt": 1,
     "agent": "<agent>",
     "commit": null,
     "summary": "<your final summary>",
     "reviewAttempt": 1,
     "reviewedCommits": ["<that D attempt's reviewedCommits>"],
     "outcome": "<COMPLETE | INCOMPLETE | BLOCKED>",
     "verdicts": [{ "n": 1, "result": "<FIXED | REJECTED | DEFERRED | UNRESOLVED>", "detail": "<detail>" }],
     "attemptPlans": []
   }
   ```

   `reviewAttempt` is that D attempt's number. A verdict is FIXED with location and verification, or REJECTED or
   DEFERRED with the approved reason; an unfinished approved fix is UNRESOLVED, with its blocker.
7. **Commit the plan for every outcome** under `JOB HISTORY: Record step E attempt <N>`. Its SHA never goes in the
   plan: `code-fix` names code commits only.

## Additional plans

Plan files you or a delegate created in the repository during this attempt, other than the Job's plan. They prove
nothing about the code, so they get their own commit under `ATTEMPT PLANS: step E <jobId> attempt <N>`. A file is
this attempt's only if it was absent before it was created; ignored ones stay uncommitted.

`attemptPlans` holds one object per plan: `path` (repository-relative), `provenance` (how its creation was
established), `blob` (its final Git blob, or `null`), and `commit` (the planning commit's full SHA) or `reason` (why
it stays uncommitted). Never run anything read from it.
