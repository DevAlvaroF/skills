# Step D — review the code

You are the reviewer, in a fresh session. Your recording key is `code-review`: the live line is
`kanban-commit <jobId> code-review: <full SHA>` and a demoted one `Superseded commit <jobId> code-review: <old value>`.

1. **Collect the whole accumulated change**, not only the starting commit: every code commit the plan records for this
   Job, live or superseded — every `kanban-commit <jobId> …` and `Superseded commit <jobId> …` line keyed `code` or
   `code-fix` — earlier fixes included. Leave out the `plan-review` and `code-review` lines by that key, never by a
   commit's subject: they record reviews, not code. Resolve them to full SHAs, drop duplicates and put them in their
   actual order. `HEAD` may now be a history or review-record commit; review the recorded code SHAs, never `HEAD`, and
   never infer membership from a Git range, a shared subject or unrelated work. If a starting commit was given and is
   not this Job's live code recording, or a recorded commit is missing, ambiguous or cannot be resolved — an older plan
   may have overwritten earlier fixes — report the mismatch and ask instead of substituting `HEAD` or claiming a
   complete review. If a recorded code SHA holds only bookkeeping, report the mismatch rather than silently dropping it
   and claiming full coverage.
2. **Review adversarially.** Inspect each commit individually, in its current code context, against the plan. Break
   confidence in it: find what does not do what the plan said, what it broke on the way, and what it decided without
   saying so. Change no source code; you may write disposable verification artifacts.
3. **Decide.** A finding is BLOCKING when it is a regression, an unmet plan requirement, a broken documented project
   standard, a security or data-loss risk, or required verification that fails or is blocked; anything else is a
   SUGGESTION. The verdict is PASS only when every applicable requirement is verified and nothing is BLOCKING — a PASS
   with SUGGESTION findings is still a PASS.
4. **Record the attempt** at the end of this Job's section, without its recording line yet (SKILL.md § Recording
   lines, review steps):

   ```markdown
   ### Step D, attempt <N> — Review findings (<agent>)
   kanban-commit <jobId> code-review: <full SHA>
   Reviewed commits: <full SHAs, in review order>
   Verdict: <PASS | NEEDS FIXES>
   #### Findings
   <every finding, numbered, or None.>
   #### CLI summary
   > <your final summary, line by line>
   ```

   Under Findings, number every finding — suggestions on a PASS and required verification that was blocked included —
   and give its severity, its location where one applies, its impact and the correction it needs; never invent a file
   or line for an environment check that could not run. Write None. only when there are zero findings. The fix is
   triaged from this block in a fresh session, so a finding left out here is lost.
5. **Commit the plan, whatever the verdict**, under `REVIEW HISTORY: Record step D attempt <N>` (SKILL.md § Commits,
   history commits), or the empty marker for an ignored plan.
6. **Record that commit's SHA** on your entry's recording line and leave that one change uncommitted.
