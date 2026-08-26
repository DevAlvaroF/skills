---
name: alvaro-matt-resolving-merge-conflicts
description: "Use when you need to resolve an in-progress git merge/rebase conflict."
---

1. **See the current state** of the merge/rebase. Check git history, and the conflicting files.

2. **Find the primary sources** for each conflict. Understand deeply why each change was made, and what the original intent was. Read the commit messages, check the PRs, check original issues/tickets.

3. **Resolve each hunk.** Preserve both intents where possible. Where incompatible, pick the one matching the merge's stated goal and note the trade-off. Do **not** invent new behaviour. Always resolve; never `--abort`.

4. Run the project's **automated checks** and fix anything the merge broke. The root `AGENTS.md` defines them: `pnpm typecheck`, then the test suite, then `pnpm lint:fix` and `pnpm format:fix`. If the conflict touched RLS, a migration, or anything under `apps/web/supabase/`, run /rls-review too — a merge is exactly where two branches' policies silently combine into a hole.

5. **Finish the merge/rebase.** Stage everything and commit. If rebasing, continue the rebase process until all commits are rebased.
