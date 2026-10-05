# Phase 1: review

**Finish before you start again.** When the latest phase 1 record already reviewed the change as it stands but its
bookkeeping is unfinished — no `REVIEW HISTORY:` commit for its attempt, or `reviewHistoryCommit` not naming it — this
run is its retry: go to step 5 and make only what is missing, because one review gets one record and one commit.

1. **Review the whole change** against the issue, the spec and its Decision log when `spec` isn't `null`, and the
   binding ADRs. An ADR changed inside the change stands only if the issue's `comments` record the user agreeing to it;
   then its replacement outranks the matching spec decision, so check the code against the replacement. The
   implementer's `Deviations and tradeoffs:` are reasons, not proof. Run these passes as sub-agents or skills handed
   the SHAs, a `git show <sha>` per commit and the ADRs' paths — nothing pasted in — overriding any default diff
   (`git diff HEAD`): a review of another diff is not this review.
   - **Spec**, scoped to this issue: what is missing or partial (a requirement outside its `covers` is not a finding),
     behaviour nobody asked for, requirements implemented wrongly, contradictions of the Decision log or a binding ADR,
     and each acceptance criterion met, unmet or unverified, with its evidence.
   - **Standards**: `/reviewer` when an `AGENTS.md` § Verification names it and it's installed; `/rls-review` when the
     change touches migrations or RLS policies; `/makerkit-custom-kit-conformance` when installed. With no general
     review skill both named and installed, give it to a sub-agent with the `AGENTS.md` chain, the ADRs' paths and
     Fowler's smell baseline as judgement calls — Mysterious Name, Duplicated Code, Feature Envy, Data Clumps, Primitive
     Obsession, Repeated Switches, Shotgun Surgery, Divergent Change, Speculative Generality, Message Chains, Middle
     Man, Refused Bequest — dropping any a documented rule or ADR endorses.
2. **Verify, don't assume.** Every acceptance criterion needs evidence: take it from the Spec pass and verify here only
   what it left open. One nobody could verify — no way to drive the UI, a service you don't have — is a failure, not a
   pass: say what was blocked and why.
3. **Decide.** A finding is **BLOCKING** when it should stop the change landing: a regression, a missing or wrong
   requirement, a broken documented standard, a contradiction of a live ADR or of a spec decision no agreed
   supersession replaced, a security or data-loss risk, a blocked required verification. Anything else is a
   **SUGGESTION**. The verdict is PASS only when every criterion holds, nothing was blocked and no BLOCKING finding
   remains; otherwise NEEDS FIXES.
4. **Record** one phase 1 record per § Comment records, numbering **every** finding — suggestions on a PASS included,
   each blocked verification as BLOCKING — because phase 2 answers them by number. Give each its location where one
   exists (never invent one for an environment failure), impact and correction.
5. **Commit the record** per § Commits' phase 1 row — the empty marker in local mode — so `git log` shows the review
   ran, then write its SHA to `reviewHistoryCommit`, uncommitted, per the done rules. A failed commit never erases the
   saved record.

Fix nothing, and never write `status` or `reviewCodeCommit` or make a close commit: phase 2 closes, even after a clean
PASS. Report the record saved, the record committed with its SHA (in local mode, "local record saved; marker
committed"), and the SHA written to `reviewHistoryCommit`; then the verdict and the findings by number. Tell the user
phase 2 is next, even with zero findings, run by the coder in a fresh session.
