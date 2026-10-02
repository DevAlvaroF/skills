# Phase 2: the coder's triage

You start with a cleared context: the review comes from the issue's records alone, never from another session, `HEAD`
or an assumed empty finding list. Keep the additional-plans inventory (below) from the start.

1. **Find the review you answer.** Tell records apart by their opening label (§ Comment records), never by author or
   position. Take the latest phase 1 record, the implementer's `Deviations and tradeoffs:`, and each phase 2 record
   whose `Answers:` names that attempt. The review must still describe the code: reviewed commits start at
   `codeCommit`, and every commit of the change is one it reviewed or an answering phase 2's fix. Missing, stale or
   ambiguous: ask, saying which. An older record without labels is read only where its findings and the code it saw
   are unambiguous; never reconstruct reasoning or edit an old record.
2. **Decide what this attempt does.**
   - **Zero findings** (a current PASS with `Findings: None.`): nothing to triage or approve; go to step 5.
   - **Closed by an older contract** (`done-final-review`, zero-finding PASS, no phase 2 answering): it stays closed;
     say so, write nothing.
   - **Saved but unfinished close** (`done-final-review`, a COMPLETE phase 2 answering): make only a missing close or
     plans commit — the status was written before them, so it doesn't prove they landed.
   - A NEEDS FIXES review with no findings, or a closed issue with undisposed findings: ask.
   - An earlier attempt's FIXED, REJECTED and DEFERRED verdicts stand; continue only its UNRESOLVED work.
3. **Weigh every finding, then stop.** Being reviewed pulls you both ways — accept because it was raised, reject because
   it criticises you — and neither is evidence. Check each claim against the code and requirements, then present every
   finding by number with a proposed **FIX** (where, how), **REJECT** or **DEFER** (why), weighing the recorded
   deviations. Then wait: change no code until the user has said FIX, REJECT or DEFER for every finding in so many words
   — a fix begun while others are undecided may be undone or reshaped by them, and one nobody agreed to changes code
   unasked. Being invoked, copying a prompt or marking a step is not approval. A decision contradiction offers fixing
   the code or superseding the ADR per `/makerkit-custom-domain-modeling`, which needs the user's own agreement. Never
   edit the spec. Keep asking, and never record a finding undecided: nobody would act on it.
4. **Implement the approved fixes**, nothing more, with `/makerkit-custom-tdd` where behaviour changes.
5. **Check** with the root `AGENTS.md` § Verification in its order, plus what nested files add, whole-repo runs
   through a sub-agent reporting failures only. A review skill there sees only this attempt's fixes and the ADRs'
   paths (`/rls-review` only when they touch migrations or policies); its findings are triaged with the user as in
   step 3, never recorded UNRESOLVED unasked. Checks run even with nothing fixed: no DEFER waives one. No fix commit
   until the fixes are verified: a failing check or a fix that falls short is work to finish, not a place to stop. A
   pass that needs an uncommitted rewrite hasn't passed: ask.
6. **Commit verified fixes** as the `CODE REVIEW FIXES:` commit per § Commits, with its `Issue:` and `Spec:` trailers:
   the fixes, agreed ADRs, and `lint:fix`, typegen or formatter rewrites in the change's files — others are listed and
   left as the user's. Nothing to stage, no commit. Take the SHA from your commit.
7. **Settle the outcome.** **COMPLETE** only when every finding has an approved FIXED, REJECTED or DEFERRED, every fix
   is verified and every required check passes; zero findings, or all rejected or deferred with approval, completes
   without a fix commit. **INCOMPLETE** (an approved fix you can't finish, a check that keeps failing) or **BLOCKED**
   (a check that can't run) only once the user, told what is left, agrees to stop there: a short fix is work to
   finish, not an outcome. The one exception: a commit holding foreign paths stops the attempt at once and ends
   BLOCKED, so nothing more is built on it before the user sees it.
8. **Write the issue once**: `reviewCodeCommit` gets the fix SHA if there is one; append one phase 2 record per
   § Comment records. An approved FIX left unfinished is UNRESOLVED with its blocker, never FIXED or an unapproved
   DEFER. Set `done-final-review` only on COMPLETE: the board reads it as Done. A write failing after a commit is
   reported with the SHAs, never answered with another commit.
9. **Close** on COMPLETE with the `Closed Issue: <issue path>` commit per § Commits; local mode has none — say so. A
   failed close leaves record and status standing, and a retry makes only that commit. Not COMPLETE: say what is
   unresolved and stop; the next attempt continues from this record.

Report the fix SHA and subject, each disposition, the checks, the final status and the close SHA or its absence; then,
apart, the plans commit and each plan left out with its reason.

## Additional plans

An additional plan is a plan file you or a delegate created in the repo this attempt (e.g. under `.claude/plans`).
Ownership is fixed at creation (the path was absent; delegates name theirs), never inferred from `git status`, so no
earlier leftover is swept up. After step 6 has its SHA, commit the eligible ones as the
`ATTEMPT PLANS:` commit per § Commits, never inside the fix commit, whatever the outcome except a failed isolation,
and record them as `Attempt plans:`; a planning failure is each plan's reason, never a stopped record. A saved COMPLETE
or landed close doesn't prove they were committed, so check on every retry. A project rule forbidding it: ask.
