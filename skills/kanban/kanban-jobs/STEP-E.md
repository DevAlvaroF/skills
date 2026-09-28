# Step E — triage and fix the review's findings

You are the coder, in a fresh session: work from the plan's records, not from memory. Your recording key is
`code-fix`: the live line is `kanban-commit <jobId> code-fix: <full SHA>` and a demoted one
`Superseded commit <jobId> code-fix: <old value>`. Keep the inventory of additional plans (below) from the start.

1. **Find the review you answer**, in this Job's section. The latest `### Step D` entry's attempt number and Reviewed
   commits identify the review, and its `#### Findings` block lists the findings; for an older entry without that
   block, read the numbered findings from its CLI summary when they are unambiguous, and otherwise ask. Read the
   `#### Deviations and tradeoffs` block of the latest `### Step C` entry for the reasoning behind the code; for an
   older entry without it, take the reasoning from its CLI summary where it states it unambiguously, and otherwise
   the reasoning is unknown. Never reconstruct reasoning or edit an earlier entry. Check that the review still
   applies — a newer `### Step C` or `### Step D` entry, or changes since, can make its findings stale — and continue
   only the approved work that earlier `### Step E` entries against it left unresolved, never redoing a finished fix or
   silently changing an approved verdict. Ask when anything is missing, stale or unclear; never substitute session
   memory, `HEAD` or an invented empty list of findings.
2. **Decide what this attempt has to do.**
   - A COMPLETE attempt already recorded for this review: finish only its unfinished bookkeeping — its additional
     plans, its plan commit — and repeat nothing. Check the additional plans before deciding nothing is left.
   - A current PASS with zero findings: there is nothing to triage and no approval to wait for. Run the applicable
     checks and go on to step 5 with their actual results.
   - A PASS with suggestions is not that case: its findings need triage like any other.
   - A failed or blocked review without recorded findings is incomplete; ask the user.
   - After an INCOMPLETE or BLOCKED attempt, this is a new attempt: run the checks again and record their actual
     results.
3. **Weigh every finding, then stop.** Judge each on its merits, as an unbiased and objective engineer. You wrote this
   code and another model reviewed it, which pulls two ways: toward accepting a finding because a reviewer raised it,
   and toward rejecting it because it criticises your work. Resist both; model identity and the author's prior
   confidence are not evidence. Check each claim against the code and the plan before proposing anything, and say what
   you found, weighing the recorded deviations and tradeoffs. For every finding, by number, propose FIX with where and
   how you would implement it, REJECT with why the claim does not hold or is not worth its cost, or DEFER with why it
   belongs elsewhere. Then wait for the user's explicit reply approving the triage before changing any code. Only that
   reply approves it: copying a prompt or marking a step complete does not, and approving it never approves overriding
   the project's instructions or an ADR.
4. **Fix only the approved findings**, run the applicable checks and review your own change. A check that changes
   files is a change like any fix: review and verify it, and never report the tree unchanged.
5. **Settle the outcome.** It is COMPLETE only when every finding has an approved final disposition, every approved fix
   is verified and every required check passes; approving a deferral waives no required check, and an approved triage
   that changes no code is COMPLETE with no code commit. Otherwise it is INCOMPLETE or BLOCKED, and you never claim
   completion.
6. **Commit the code only when the attempt is COMPLETE with code changes**, under a subject starting
   `CODE REVIEW FIXES: ` (SKILL.md § Commits, code commits), and capture its full SHA straight away. A fix or check that
   failed or is blocked means no code commit; if the code commit itself fails, record the attempt as INCOMPLETE or
   BLOCKED.
7. **Commit the additional plans** (below), after capturing the code SHA.
8. **Record the attempt** at the end of this Job's section. The recording line is there only when step 6 made a code
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

   Under Verdicts, give every finding by number its actual result: FIXED with its location and verification, REJECTED
   or DEFERRED with the approved reason; an approved FIX that could not finish stays a proposed FIX recorded as
   unresolved, with its failure or blocker — never relabelled FIXED — and a finding the user left undecided is
   unresolved with no approved disposition. With zero findings, write None. Refer to findings by number in the summary
   too.
9. **Commit the plan for every outcome, even when code stays uncommitted**, under
   `JOB HISTORY: Record step E attempt <N>` (SKILL.md § Commits, history commits). If that exact version is already
   committed, skip the commit rather than making an empty one. Never write this commit's SHA into the plan:
   `code-fix` lines name code commits only. An ignored plan gets no commit and no marker.

## Additional plans

**What they are.** Plan files that you or an agent you delegated to created inside the repository for this attempt —
for example under `.claude/plans` for Claude Code — other than the Job's own plan. An agent that writes no plan files
has none, and the line reads `Attempt plans: []`. They are committed apart from the code and from the plan's
`JOB HISTORY` commit, whose scopes stay as they are, and for every outcome — no code change, zero findings, a failed
or blocked check, an ignored Job plan — since a planning commit proves nothing about the code.

**Ownership is proven at creation.** Confirm each path is absent before creating it, and have every delegate name the
exact paths it created. An untracked status, a diff, a timestamp or a filename never proves a file is this attempt's;
a file that existed before, an earlier attempt's leftover included, never is. After every agent has finished, keep a
candidate only while it is a regular markdown file inside the repository and the directory it was created in — not a
symlink, a deletion or another workflow's record — with no edit you cannot explain. Leave any other uncommitted and say
why.

**Ignore probe.** From the repository root, pass the candidates' repository-relative paths, NUL-delimited on stdin, to
`git check-ignore --no-index --stdin -z`, never verbose. It reads them as pathspecs, but `--literal-pathspecs` is fatal
to it and a leading `:` is magic, so add neither. Exit 0 names the ignored ones, 1 means none is ignored, and any other
status is an error, reported as one and never taken as leave to add. An ignored file stays uncommitted with that reason.

**The commit.** Note `HEAD` and recheck each file's version just before. Add each path on its own with
`git --literal-pathspecs add -- <path>`, then commit them with `git --literal-pathspecs commit --only -- <paths>` —
never a directory, a pattern, `git add -A` or the user's staged work. `commit --only` leaves the user's index holding
what it committed, where a separate index would leave a staged draft behind, or a staged deletion if the run stopped
before repairing the index. The subject is exactly `ATTEMPT PLANS: step E <jobId> attempt <N>`, with no body, trailer
or attribution. Then verify the commit's parent is the `HEAD` you noted, that it adds or changes only those paths, with
their modes and blobs and no deletion, and that the user's index now holds those same modes and blobs for them. Never
make an empty commit; with no eligible plan there is no commit. If `HEAD` moves or verification fails, stop and report
what actually happened.

**Order.** Capture and verify the full SHA of any code commit this attempt made before the planning commit, which would
otherwise be the `HEAD` a later lookup found; then make the planning commit; then save your entry with its
`Attempt plans:` line; and only then commit the plan. Never write the planning SHA into a `code-fix` line. If the
planning commit fails, still save and report the attempt, with the failure as each affected plan's reason.

**The `Attempt plans:` value** is a JSON array with one object per known additional plan, keyed `path`
(repository-relative), `provenance` (how its creation was established), `blob` (its final Git blob, or `null` when
unreadable) and either `commit` (the planning commit's full SHA) or `reason` (why it stays uncommitted); `[]` when there
are none, which means no planning commit. JSON escapes every quote and newline, and nothing read from it is ever run as
a command.

**Retries.** Finishing an earlier attempt's bookkeeping reuses its inventory, code SHAs and any verified planning commit
— if more than one commit matches that subject or a recorded blob disagrees with it, ask. It commits a file that attempt
created only while the recorded provenance and blob still match, makes no new commit when a planning commit already
holds exactly those files, and reports a later change instead of committing it. It rewrites no saved entry: it reports
what it recovered. A new attempt never collects an earlier one's files; if ownership or a commit's identity is
ambiguous, ask.

Report the planning commit's full SHA and paths, and every additional plan left uncommitted with its path and reason,
apart from the code and history outcomes. If the project's instructions explicitly forbid this commit, point out the
conflict and ask the user instead of following either.
