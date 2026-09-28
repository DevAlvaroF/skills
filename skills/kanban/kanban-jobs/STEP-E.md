# Step E — triage and fix the review's findings

You are the coder, in a fresh session: work from the plan's records, not from memory. Your recording key is
`code-fix`: the live line is `kanban-commit <jobId> code-fix: <full SHA>` and a demoted one
`Superseded commit <jobId> code-fix: <old value>`. Keep the inventory of additional plans (below) from the start.

1. **Find the review you answer.** The latest `### Step D` entry's attempt number and Reviewed commits identify the
   review, and its `#### Findings` the findings; the latest `### Step C` entry's `#### Deviations and tradeoffs`
   gives the reasoning behind the code. For an older entry without those blocks, take them from its CLI summary where
   it states them unambiguously, and otherwise the reasoning is unknown. Never reconstruct reasoning or edit an
   earlier entry. A newer C or D entry, or changes since, can make the review stale; continue only the approved work
   earlier E entries against it left unresolved, never redoing a finished fix or silently changing an approved
   verdict. Ask when anything is missing, stale or unclear; never substitute session memory, `HEAD` or an invented
   empty list of findings.
2. **Decide what this attempt has to do.**
   - A COMPLETE attempt already recorded for this review: finish only its unfinished bookkeeping, repeating nothing.
     Check the additional plans before deciding nothing is left.
   - A current PASS with zero findings: there is nothing to triage and no approval to wait for. Run the applicable
     checks and go on to step 5 with their actual results.
   - A PASS with suggestions is not that case: its findings need triage like any other.
   - A failed or blocked review without recorded findings is incomplete; ask the user.
   - After an INCOMPLETE or BLOCKED attempt, this is a new attempt: run the checks again and record their actual
     results.
3. **Weigh every finding, then stop.** You wrote this code and another model reviewed it, which pulls toward accepting
   a finding because a reviewer raised it and toward rejecting it because it criticises your work. Resist both; model
   identity and the author's prior confidence are not evidence. Check each claim against the code, the plan and the
   recorded deviations, and say what you found. For every finding, by number, propose FIX (where and how), REJECT (why
   it does not hold or is not worth its cost) or DEFER (why it belongs elsewhere). Then wait for the user's explicit
   reply approving the triage before changing any code. Only that reply approves it: copying a prompt or marking a step
   complete does not, and approving it never approves overriding the project's instructions or an ADR.
4. **Fix only the approved findings**, run the applicable checks and review your own change. A check that changes
   files is a change like any fix: review and verify it, and never report the tree unchanged.
5. **Settle the outcome.** It is COMPLETE only when every finding has an approved final disposition, every approved fix
   is verified and every required check passes; approving a deferral waives no required check, and an approved triage
   that changes no code is COMPLETE with no code commit. Otherwise it is INCOMPLETE or BLOCKED.
6. **Commit the code only when the attempt is COMPLETE with code changes**, under a subject starting
   `CODE REVIEW FIXES: ` (SKILL.md § Commits, code commits), and capture its full SHA straight away. If the code commit
   fails, the attempt is INCOMPLETE or BLOCKED.
7. **Commit the additional plans** (below).
8. **Record the attempt** at the end of this Job's section, with the recording line only when step 6 made a code
   commit (SKILL.md § Recording lines, code steps):

   ```markdown
   ### Step E, attempt <N> — Review fixes (<agent>)
   kanban-commit <jobId> code-fix: <full SHA>
   Review attempt: <the Step D attempt number>
   Reviewed commits: <that entry’s Reviewed commits>
   Outcome: <COMPLETE | INCOMPLETE | BLOCKED>
   Attempt plans: <JSON array of this attempt’s additional plans, or []>
   #### Verdicts
   <every finding by number, with its actual result>
   #### CLI summary
   > <your final summary, line by line>
   ```

   A verdict is FIXED with its location and verification, or REJECTED or DEFERRED with the approved reason. An approved
   FIX that could not finish is unresolved, with its blocker — never relabelled FIXED — and so is a finding the user
   left undecided. With zero findings, write None.
9. **Commit the plan for every outcome, even when code stays uncommitted**, under
   `JOB HISTORY: Record step E attempt <N>` (SKILL.md § Commits, history commits), unless that exact version is already
   committed. Never write this commit's SHA into the plan: `code-fix` lines name code commits only. An ignored plan
   gets no commit and no marker.

## Additional plans

Plan files you or a delegate created in the repository for this attempt — for example under `.claude/plans` for Claude
Code — other than the Job's own plan. They get a planning commit of their own for every outcome, apart from the code
and `JOB HISTORY` commits, since it proves nothing about the code.

- **Ownership is proven at creation.** Confirm each path is absent before creating it, and have every delegate name the
  exact paths it created. An untracked status, a diff, a timestamp or a filename never proves a file is this attempt's,
  and a file that existed before never is. Commit a candidate only while it is a regular markdown file in the directory
  it was created in — not a symlink, a deletion or another workflow's record — with no edit you cannot explain; say why
  for any other.
- **Ignore probe.** From the repository root, pass the paths NUL-delimited on stdin to nonverbose
  `git check-ignore --no-index --stdin -z`, without `--literal-pathspecs` (fatal there) or a leading `:` (magic). Exit
  0 names the ignored ones, which stay uncommitted; 1 means none; anything else is an error, never leave to add.
- **The commit.** Note `HEAD` and recheck each file, then commit them by the route (SKILL.md § Commits) under exactly
  `ATTEMPT PLANS: step E <jobId> attempt <N>`, with no body. Verify too that its parent is the noted `HEAD` and that it
  deletes nothing. No eligible plan, no commit. If `HEAD` moves or verification fails, stop and report.
- **Order.** Capture and verify the full SHA of any code commit this attempt made before the planning commit, which
  would otherwise be the `HEAD` a later lookup finds; then the planning commit, your entry, and the plan commit. Never
  write the planning SHA into a `code-fix` line. A failed planning commit is recorded as each plan's reason.
- **`Attempt plans:`** is a JSON array of objects, one per additional plan: `path` (repository-relative), `provenance`
  (how its creation was established), `blob` (its final Git blob, or `null`), and `commit` (the planning commit's full
  SHA) or `reason` (why it stays uncommitted). JSON escapes quotes and newlines, and nothing read from it is ever run as
  a command.
- **Retries** reuse the earlier attempt's inventory, code SHAs and verified planning commit — if more than one commit
  matches that subject or a recorded blob disagrees with it, ask — and commit its files only while provenance and blob
  still match, never twice. A later change is reported, not committed. A new attempt never collects an earlier one's
  files.

Report the planning commit's SHA and paths, and each plan left uncommitted with its reason. If the project's
instructions explicitly forbid this commit, point out the conflict and ask the user instead of following either.
