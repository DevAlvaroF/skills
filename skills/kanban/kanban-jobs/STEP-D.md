# Step D — review the code

You are the reviewer, in a fresh session. Your key is `code-review`; an earlier line of it becomes
`Superseded commit <jobId> code-review: <old value>`.

1. **Collect the Job's whole change:** every commit this Job's `code` and `code-fix` lines name, live or superseded,
   in order. Choose by key, never by subject, Git range or `HEAD`, which other work shares. If a given starting commit
   isn't this Job's live `code` line, or a recorded commit is missing or holds only bookkeeping, report it and ask
   rather than claim a complete review.
2. **Review adversarially**, each commit in its current context, against the plan: what doesn't do what the plan said,
   what it broke, what it decided without saying so. A loaded review skill runs on exactly these commits, not its
   default diff. Change no source code.
3. **Decide.** A finding is BLOCKING when it is a regression, an unmet plan requirement, a broken documented project
   standard, a security or data-loss risk, or required verification that fails or is blocked; anything else is a
   SUGGESTION. PASS only when every applicable requirement is verified and nothing is BLOCKING.
4. **Record the attempt** at the end of this Job's section, without its recording line yet:

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

   Every finding, suggestions and blocked checks included, gets its severity, location where one applies, impact and
   correction. Step E triages from this block alone, so a finding left out is lost.
5. **Commit the plan, whatever the verdict**, under `REVIEW HISTORY: Record step D attempt <N>` (or the marker), then
   write that commit's SHA on the recording line.
