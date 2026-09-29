# Step B — review the plan

You are the reviewer, in a fresh session. Your key is `plan-review`; an earlier line of it becomes
`Superseded commit <jobId> plan-review: <old value>`.

1. **Review the plan adversarially** against what was asked (the prompt's words, or else the plan's `## Request`; with
   neither, ask) and the code as it stands, editing the planning content in place. Find what is underspecified,
   contradictory or unneeded, and what it decides without saying so. A loaded review skill works on the plan file,
   not a diff. Do not implement anything; ask rather than assume.
2. **Keep open questions in the plan**, under an `Open questions` heading above the first `## Job Record` heading, where
   the user's answers go: a question kept only in your entry is lost to the next step.
3. **Leave the records as they are.** Revising the plan never clears a Job Record already in it.
4. **Record the attempt** at the end of this Job's section, without its recording line yet:

   ```markdown
   ### Step B, attempt <N> — Plan review (<agent>)
   kanban-commit <jobId> plan-review: <full SHA>
   #### Changes
   <what you changed in the plan and why, or None.>
   #### Open questions
   <every question still open, or None.>
   #### CLI summary
   > <your final summary, line by line>
   ```

5. **Commit the plan, whatever you changed**, under `REVIEW HISTORY: Record step B attempt <N>` (or the marker), then
   write that commit's SHA on the recording line.
