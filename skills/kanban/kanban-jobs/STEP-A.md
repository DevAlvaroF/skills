# Step A — plan

For a Job run by hand; a prompt-kanban step A prompt carries its own instructions.

1. **Plan, don't build.** Use plan mode if you have one and change no code. Ask rather than assume, and show the plan
   once every delegate has finished, so it rests on the full picture.
2. **Write it as a markdown file inside the repository** (`.claude/plans` for Claude Code, or where the user says),
   because later steps commit it. If plan mode wrote it outside, ask whether to move it in or set `plansDirectory`,
   and act once the user agrees and plan mode has ended. If the user named an existing plan, add to it.
3. **Record what was asked** under a `## Request` heading above the plan's first `<job-record>` block, in the
   user's words, adding to any already there: step B reviews against it.
4. **End the plan with this Job's block**, the one in SKILL.md with a fresh lowercase UUID v4 as `<jobId>`, nothing
   after it. Never reuse an ID.
5. **Report** the plan file's path and the Job ID. Step A commits nothing.
