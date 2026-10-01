# Step B — review the plan

You are the reviewer, in a fresh session. Your key is `plan-review`.

1. **Review the plan adversarially** against what was asked (the prompt's words, or else the plan's `## Request`; with
   neither, ask) and the code as it stands, editing the planning content in place. Find what is underspecified,
   contradictory or unneeded, and what it decides without saying so. A loaded review skill works on the plan file,
   not a diff. Do not implement anything; ask rather than assume.
2. **Ask until nothing is open.** Keep each question, and the user's answer once given, in the plan under an
   `Open questions` heading above the Job Record: the next step reads the plan, not this conversation. The review
   finishes only when every question has the user's answer; until then record and commit nothing, because a
   `plan-review` commit tells the app the plan is ready to code.
3. **Leave the records as they are.** Revising the plan never clears a Job Record already in it.
4. **Record the attempt** in `attempts`, `commit` still `null`:

   ```json
   {
     "step": "B",
     "attempt": 1,
     "agent": "<agent>",
     "commit": null,
     "summary": "<your final summary>",
     "changes": "<what you changed in the plan and why, and the questions the user answered, or None.>"
   }
   ```

5. **Commit the plan, whatever you changed**, under `REVIEW HISTORY: Record step B attempt <N>` (or the marker), then
   write that commit's SHA into `commit` and `commits["plan-review"]`.
