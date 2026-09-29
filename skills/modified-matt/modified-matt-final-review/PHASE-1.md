# Phase 1: review

**Finish before you start again.** When the latest phase 1 record already reviewed the change as it stands now but its
bookkeeping is unfinished — no `REVIEW HISTORY:` commit for its attempt, or `reviewHistoryCommit` not naming that
commit — this run is a retry of it: go straight to step 5 and finish only what is missing, rather than reviewing again
under a new attempt number.

1. **Review the whole change** against the issue and, when `spec` is not `null`, the spec — its Decision log included —
   and against the binding ADRs. An ADR change inside the diff stands only if the issue's `comments` record the user
   agreeing to it. When they do, the replacement outranks the matching spec decision
   (`modified-matt-domain-modeling` § Superseding and removing): check the code against the replacement, not the spec
   line. Read the implementer's recorded deviations and tradeoffs, where the implementation record has them, as the
   implementer's stated reasons, not as proof. A loaded review skill is run on exactly the change's commits: hand it
   their SHAs, a `git show <sha>` command for each and the binding ADRs' paths, and override its default diff
   (`git diff HEAD`, `git show HEAD`) — a review of any other diff is not this review. Hand review sub-agents the same
   commands and paths; never paste the diff, an ADR or the spec in.
2. **Verify, don't assume.** Check each acceptance criterion against what the code actually does. A verification you
   could not run — a live UI check with no way to drive the UI, a test that needs a service you don't have — is a
   **failure**, not a pass. Say what was blocked and why.
3. **Decide.**
   - A finding is **blocking** when it should stop the change landing: a regression, a requirement missing or wrong, a
     broken documented standard, a contradiction of a live binding ADR or of a spec decision no agreed
     supersession replaced, a security or data-loss risk, a required verification that was blocked. Anything else is a
     **suggestion**.
   - The verdict is **PASS** when every acceptance criterion holds, nothing was blocked, and no blocking finding
     remains. A PASS can still carry suggestions. Anything else is **NEEDS FIXES**.
4. **Record the review.** Append one phase 1 record to `comments`, in the shape `.mysdd/issue-tracker.md` § Comment
   records gives: its attempt number, the full SHAs of the change you reviewed (oldest first), the verdict, and
   **every** finding numbered — suggestions on a PASS included, and each blocked verification as a blocking finding
   naming what was blocked and why. Give each finding its severity, its location where one applies (never invent a file
   or line for an environment or verification failure), its impact and the correction you ask for. Write
   `Findings: None.` only when there are no findings at all; a PASS with suggestions lists them. Leave `status` as it
   is, whatever the verdict.
5. **Commit the review record** as `.mysdd/issue-tracker.md` § Recording a final review directs. The commit is what
   lets the user, coming back later, see that the review happened. The tracker owns the message, the literal-path
   `commit --only` route (a plain `git commit` would sweep in whatever else the user had staged), the local-mode empty
   marker, how to identify the commit you created without trusting `HEAD`, writing its SHA into `reviewHistoryCommit`
   and leaving that one change uncommitted (a commit cannot contain its own SHA), and the retries. The marker is only
   for a local mode the probe positively established, never a fallback for a failure; a failed commit never erases the
   saved review, and one review never gets a second record or a second commit.

Fix nothing in this phase, and never write `status` or `reviewCodeCommit` or make the close commit: phase 2 closes, even
after a clean PASS. Report three outcomes separately — the record saved; the record committed, with its SHA (in local
mode, "local record saved; marker committed"); and the SHA written to `reviewHistoryCommit` — then the verdict and the
findings by number, and stop. Tell the user that phase 2 is next, even with zero findings: the coder runs it in a fresh
session, not in this one.
