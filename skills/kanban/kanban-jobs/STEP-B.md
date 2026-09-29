# Step B — review the plan

You are the reviewer, in a fresh session. Your key is `plan-review`.

1. **Review the plan adversarially** against what was asked (the prompt's words, or else the plan's `## Request`; with
   neither, ask) and the code as it stands, editing the planning content in place. Find what is underspecified,
   contradictory or unneeded, and what it decides without saying so. A loaded review skill works on the plan file,
   not a diff. Do not implement anything; ask rather than assume.
2. **Keep open questions in the plan**, under an `Open questions` heading above the Job Record, where the user's
   answers go: a question kept only in your attempt is lost to the next step.
3. **Leave the records as they are.** Revising the plan never clears a Job Record already in it.
4. **Record the attempt** in `attempts`, `commit` still `null`:

   ```json
   {
     "step": "B",
     "attempt": 1,
     "agent": "<agent>",
     "commit": null,
     "summary": "<your final summary>",
     "changes": "<what you changed in the plan and why, or None.>",
     "openQuestions": ["<every question still open; [] when none>"]
   }
   ```

5. **Commit the plan, whatever you changed**, under `REVIEW HISTORY: Record step B attempt <N>` (or the marker), then
   write that commit's SHA into `commit` and `commits["plan-review"]`.
