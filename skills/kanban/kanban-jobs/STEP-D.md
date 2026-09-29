# Step D — review the code

You are the reviewer, in a fresh session. Your key is `code-review`.

1. **Collect the Job's whole change:** the `commit` of every C and E attempt, in order, and the live `commits.code`
   and `commits["code-fix"]`. Choose by record, never by subject, Git range or `HEAD`, which other work shares. If a
   given starting commit isn't this Job's live `commits.code`, or a recorded commit is missing or holds only
   bookkeeping, report it and ask rather than claim a complete review.
2. **Review adversarially**, each commit in its current context, against the plan: what doesn't do what the plan said,
   what it broke, what it decided without saying so. A loaded review skill runs on exactly these commits, not its
   default diff. Change no source code.
3. **Decide.** A finding is BLOCKING when it is a regression, an unmet plan requirement, a broken documented project
   standard, a security or data-loss risk, or required verification that fails or is blocked; anything else is a
   SUGGESTION. PASS only when every applicable requirement is verified and nothing is BLOCKING.
4. **Record the attempt** in `attempts`, `commit` still `null`:

   ```json
   {
     "step": "D",
     "attempt": 1,
     "agent": "<agent>",
     "commit": null,
     "summary": "<your final summary>",
     "reviewedCommits": ["<full SHA, in review order>"],
     "verdict": "<PASS | NEEDS FIXES>",
     "findings": [
       { "n": 1, "severity": "<BLOCKING | SUGGESTION>", "location": "<path:line, or null>", "impact": "<impact>", "correction": "<correction>" }
     ]
   }
   ```

   Every finding, suggestions and blocked checks included, goes in `findings` (`[]` when none). Step E triages from
   this attempt alone, so a finding left out is lost.
5. **Commit the plan, whatever the verdict**, under `REVIEW HISTORY: Record step D attempt <N>` (or the marker), then
   write that commit's SHA into `commit` and `commits["code-review"]`.
