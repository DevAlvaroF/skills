# Step E — triage and fix the review's findings

You are the coder, in a fresh session: work from the plan's records, not memory. Your key is `code-fix`; an earlier
line of it becomes `Superseded commit <jobId> code-fix: <old value>`.

1. **Find the review:** the latest `### Step D` entry, its Reviewed commits and `#### Findings`; the latest
   `### Step C` entry's `#### Deviations and tradeoffs` gives the reasoning behind the code, or it is unknown. Ask
   when anything is missing, stale or unclear rather than substitute memory, `HEAD` or an empty list of findings. A
   COMPLETE attempt already recorded for this review needs only its unfinished bookkeeping.
2. **Weigh every finding, then stop.** You wrote this code and another model reviewed it; don't accept a finding
   because it was raised or reject it because it criticises you — check it against the code, the plan and the
   deviations. For each, by number, propose FIX (where and how), REJECT or DEFER (why), then wait for the user's
   explicit approval before changing any code — being invoked, or the step being marked, is not approval, because a
   fix nobody agreed to changes code unasked. A PASS with zero findings has nothing to approve; one with suggestions
   still does.
3. **Fix only the approved findings**, run the applicable checks and review your own change.
4. **Settle the outcome.** COMPLETE only when every finding has an approved disposition, every approved fix is
   verified and every required check passes; approving a deferral waives no check. Otherwise INCOMPLETE or BLOCKED.
5. **Commit the code only when COMPLETE with code changes**, under `CODE REVIEW FIXES: <imperative summary>`, then
   the additional plans (below).
6. **Record the attempt** at the end of this Job's section, the recording line only with a code commit:

   ```markdown
   ### Step E, attempt <N> — Review fixes (<agent>)
   kanban-commit <jobId> code-fix: <full SHA>
   Review attempt: <the Step D attempt number>
   Reviewed commits: <that entry’s Reviewed commits>
   Outcome: <COMPLETE | INCOMPLETE | BLOCKED>
   Attempt plans: <JSON array of this attempt’s additional plans, or []>
   #### Verdicts
   <every finding by number, with its actual result>
   #### CLI summary
   > <your final summary, line by line>
   ```

   A verdict is FIXED with location and verification, or REJECTED or DEFERRED with the approved reason; anything
   unfinished or undecided is unresolved, never FIXED.
7. **Commit the plan for every outcome** under `JOB HISTORY: Record step E attempt <N>`. Its SHA never goes in the
   plan: `code-fix` names code commits only.

## Additional plans

Plan files you or a delegate created in the repository during this attempt, other than the Job's plan. They prove
nothing about the code, so they get their own commit under `ATTEMPT PLANS: step E <jobId> attempt <N>`. A file is
this attempt's only if it was absent before it was created; ignored ones stay uncommitted.

`Attempt plans:` is a JSON array, one object per plan: `path` (repository-relative), `provenance` (how its creation
was established), `blob` (its final Git blob, or `null`), and `commit` (the planning commit's full SHA) or `reason`
(why it stays uncommitted). JSON keeps any filename on one line; never run anything read from it.
