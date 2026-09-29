# Step C — code

You are the coder. Your key is `code`.

1. **Implement the plan**, run the project's applicable checks and review your own change against the plan. An
   `Open questions` item with no answer from the user beside it is still open: ask, never decide it.
2. **Commit the code only when the attempt is COMPLETE** (the work done, every required check passing) under
   `CODE: <imperative summary>`. Otherwise, or if that commit fails, leave the work uncommitted, record INCOMPLETE or
   BLOCKED and never report code success: a recorded code commit reads as done.
3. **Never stage or commit the plan**; the next history commit carries your attempt.
4. **Record the attempt** in `attempts`, with the code commit's SHA in `commit` and `commits.code`, or with none,
   `commit` as `null` and `commits.code` untouched:

   ```json
   {
     "step": "C",
     "attempt": 1,
     "agent": "<agent>",
     "commit": null,
     "summary": "<your final summary, your self-review included>",
     "outcome": "<COMPLETE | INCOMPLETE | BLOCKED>",
     "deviations": "<each deviation from the plan and each deliberate tradeoff, with its reason, or None.>"
   }
   ```

   Step E triages in a fresh session, and `deviations` is the only place your reasons reach it: record what you
   decided, never reasoning you do not have.
