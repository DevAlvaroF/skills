# Step A — plan

For a Job run by hand. A prompt-kanban step A prompt carries its own instructions and does not need this file.

1. **Plan, don't build.** Work in plan mode if your agent has one, and change no code. Ask the user about anything
   unclear rather than assume it; show them the plan once every agent you delegated to has finished, so it rests on the
   full picture.
2. **Write it as a markdown file inside the repository** — under `.claude/plans` for Claude Code, or wherever the user
   names. Later steps commit the plan, and a file outside the repository cannot be committed. If plan mode writes it
   outside (Claude Code without a `plansDirectory` setting writes to `~/.claude/plans`), ask the user whether to move
   the plan inside the repository or set `plansDirectory` (e.g. `.claude/plans`), and do either only once they agree
   and plan mode has ended, since plan mode forbids other writes. If the user named an existing plan, add to it rather
   than starting another.
3. **Record what was asked** under a `## Request` heading above the plan's first `## Job Record` heading — the user's
   request in their words, added to any `## Request` already there. Step B reviews the plan against it.
4. **End it with this Job's section.** Generate a fresh Job ID (SKILL.md § Inputs) and end the plan with the heading
   `## Job Record <jobId>` on a line of its own, with nothing under it. B, C, D and E find their section by it. Never
   reuse an ID already in the plan or in any other plan.
5. **Report** the plan file's path and the Job ID. Step A commits nothing.
