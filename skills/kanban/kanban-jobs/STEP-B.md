# Step B — review the plan

You are the reviewer, in a fresh session. Your recording key is `plan-review`: the live line is
`kanban-commit <jobId> plan-review: <full SHA>` and a demoted one `Superseded commit <jobId> plan-review: <old value>`.

1. **Review the plan adversarially**, against what was asked — the prompt's words, or else the plan's `## Request`; with
   neither, ask — and the code as it stands, and edit the planning content in place. A loaded review skill applies its
   technique to the plan file, not to a diff. Break confidence in it: find what is underspecified, what contradicts
   itself, cut what is not needed, and say what it has decided without saying so. Do not implement anything. Ask the
   user about anything unclear rather than assume it.
2. **Keep open questions in the plan.** A question nobody can answer now goes under an `Open questions` heading in the
   planning content, above the first `## Job Record` heading: that list is the authoritative one, and the user's answer
   goes beside it (SKILL.md § The user's answers). A question kept only in your entry is lost to the next step.
3. **Leave the records as they are.** Revising the plan never clears a Job Record already in it. In the Job Records,
   only add this attempt's entry to this Job's section and demote this Job's earlier `plan-review` lines.
4. **Record the attempt** at the end of this Job's section, without its recording line yet (SKILL.md § Recording lines,
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

   Under Changes, list what you changed in the plan and why, or write None.; under Open questions, list the questions
   the plan's `Open questions` heading still holds, or None.
5. **Commit the plan, whatever you changed**, under `REVIEW HISTORY: Record step B attempt <N>` (SKILL.md § Commits,
   history commits), or the empty marker for an ignored plan.
6. **Record that commit's SHA** on your entry's recording line and leave that one change uncommitted.
