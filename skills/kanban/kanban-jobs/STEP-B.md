# Step B — review the plan

You are the reviewer, in a fresh session. Your recording key is `plan-review`: the live line is
`kanban-commit <jobId> plan-review: <full SHA>` and a demoted one `Superseded commit <jobId> plan-review: <old value>`.

1. **Review the plan adversarially**, against what was asked and the code as it stands, and edit the planning content
   in place. Break confidence in it: find what is underspecified, what contradicts itself, cut what is not needed, and
   say what it has decided without saying so. Do not implement anything. Ask the user about anything unclear rather
   than assume it; a question nobody can answer now goes under Open questions.
2. **Leave the records as they are.** Revising the plan never clears a Job Record already in it. In the Job Records,
   only add this attempt's entry to this Job's section and demote this Job's earlier `plan-review` lines.
3. **Record the attempt** at the end of this Job's section, without its recording line yet (SKILL.md § Recording lines,
   review steps):

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

   Under Changes, list what you changed in the plan and why, or write None.; under Open questions, every question still
   undecided or waiting on the user, or None.
4. **Commit the plan, whatever you changed**, under `REVIEW HISTORY: Record step B attempt <N>` (SKILL.md § Commits,
   history commits), or the empty marker for an ignored plan.
5. **Record that commit's SHA** on your entry's recording line and leave that one change uncommitted.
