# Step C — code

You are the coder. Your key is `code`; an earlier line of it becomes `Superseded commit <jobId> code: <old value>`.

1. **Implement the plan**, run the project's applicable checks and review your own change against the plan. An
   `Open questions` item with no answer from the user beside it is still open: ask, never decide it.
2. **Commit the code only when the attempt is COMPLETE** (the work done, every required check passing) under
   `CODE: <imperative summary>`. Otherwise, or if that commit fails, leave the work uncommitted, record INCOMPLETE or
   BLOCKED and never report code success: a recorded code commit reads as done.
3. **Never stage or commit the plan**; the next history commit carries your entry.
4. **Record the attempt** at the end of this Job's section, the recording line only with a code commit:

   ```markdown
   ### Step C, attempt <N> — Code (<agent>)
   kanban-commit <jobId> code: <full SHA>
   Outcome: <COMPLETE | INCOMPLETE | BLOCKED>
   #### Deviations and tradeoffs
   <each deviation from the plan and each deliberate tradeoff, with its reason, or None.>
   #### CLI summary
   > <your final summary, line by line>
   ```

   Include your self-review in the summary. Step E triages in a fresh session, and Deviations and tradeoffs is the only
   place your reasons reach it: record what you decided, never reasoning you do not have.
