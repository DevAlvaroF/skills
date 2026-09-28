# Step C — code

You are the coder. Your recording key is `code`: the live line is `kanban-commit <jobId> code: <full SHA>` and a
demoted one `Superseded commit <jobId> code: <old value>`.

1. **Implement the plan**, run the project's applicable checks, and review your own change against the plan.
2. **Commit the code only when the attempt is COMPLETE** — the work is done and every required check passes — under a
   subject starting `CODE: ` (SKILL.md § Commits, code commits). If the work is incomplete, or a required check fails
   or cannot run, make no code commit. Then, or if the code commit fails, record the attempt as INCOMPLETE or BLOCKED,
   leave the work uncommitted and never report code success.
3. **Never stage or commit the plan: this step's only commit is the code.** Your entry is carried into history by the
   next step that commits the whole plan.
4. **Record the attempt** at the end of this Job's section. The recording line is there only when you made a code
   commit (SKILL.md § Recording lines, code steps):

   ```markdown
   ### Step C, attempt <N> — Code (<agent>)
   kanban-commit <jobId> code: <full SHA>
   Outcome: <COMPLETE | INCOMPLETE | BLOCKED>
   #### Deviations and tradeoffs
   <each deviation from the plan and each deliberate tradeoff, with its reason, or None.>
   #### CLI summary
   > <your final summary, line by line>
   ```

   Include your self-review in the summary. Under Deviations and tradeoffs, list every deviation from the plan and
   every deliberate tradeoff with its reason, or write None. Whoever triages the review's findings later does it in a
   fresh session, and this is the only place the reasons behind the code survive to them — so record only what you
   decided, and never reconstruct reasoning you do not have.
