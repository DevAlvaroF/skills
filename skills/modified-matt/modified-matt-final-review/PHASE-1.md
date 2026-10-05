# Phase 1: review

If the latest phase 1 record already reviewed the change as it stands but its `REVIEW HISTORY:` commit or
`reviewHistoryCommit` is missing, finish that attempt from step 5: one review never gets a second record or commit.

1. **Review the whole change** — `codeCommit` and the later commits whose `Issue:` trailer names this issue,
   bookkeeping aside (SKILL.md) — and nothing else. Run two passes as parallel sub-agents, each given the SHAs, a
   `git show <sha>` per commit and the binding ADRs' paths, never the pasted diff:
   - **Standards**: the repo's documented standards for the touched paths (root and nested `AGENTS.md`, `CLAUDE.md`),
     plus Fowler's smells as judgement calls a documented rule can override: Mysterious Name, Duplicated Code, Feature
     Envy, Data Clumps, Primitive Obsession, Repeated Switches, Shotgun Surgery, Divergent Change, Speculative
     Generality, Message Chains, Middle Man, Refused Bequest.
   - **Spec**: the issue's scope, the spec and its Decision log when `spec` isn't `null`, and the binding ADRs. An ADR
     change in the diff stands only if the implementation record shows the user agreed; its replacement then outranks
     the spec line. `Deviations and tradeoffs:` gives the implementer's reasons, not proof. Report each acceptance
     criterion met, unmet or unverified, with its evidence.

   A loaded review skill (such as `/modified-matt-implement`'s review) may run the passes instead, on exactly these
   commits: override a default of `git diff HEAD` or `git show HEAD`, since another diff is another review.

2. **Verify, don't assume.** Every acceptance criterion needs evidence: take it from the Spec pass and verify here only
   what it left open. One nobody could verify (no way to drive the UI, a missing service) is a failure, not a pass: say
   what was blocked and why.
3. **Decide.** BLOCKING is what should stop the change landing: a regression, a missing or wrong requirement, a broken
   documented standard, a contradiction of a live ADR or an unsuperseded spec decision, a security or data-loss risk, a
   blocked required verification. The rest is SUGGESTION. `Verdict: PASS` needs every criterion verified, nothing
   blocked and no BLOCKING finding; otherwise `Verdict: NEEDS FIXES`.
4. **Record** one phase 1 record per § Comment records: `Final review, phase 1, attempt <N>`, `Reviewed commits:`,
   the verdict, and `Findings:` with every finding numbered, suggestions on a PASS included, each with severity,
   location (never invented for an environment failure), impact and correction; `Findings: None.` only when there are
   none. Phase 2 answers findings by number, so an unnumbered one is never triaged.
5. **Commit the record** as `REVIEW HISTORY: Record final review attempt <N>` per § Commits (the empty marker in local
   mode), so `git log` alone shows the review ran. Then write that commit's SHA to `reviewHistoryCommit`, uncommitted:
   a commit can't hold its own SHA. A failed commit never erases the saved record, and the marker is never its
   fallback.

Fix nothing, never change `status` or write `reviewCodeCommit`, and never close, whatever the verdict: untriaged
findings can't close an issue. Report the record saved, its commit's SHA (in local mode "local record saved; marker
committed"), the SHA written to `reviewHistoryCommit`, the verdict and the findings by number. Phase 2 is next, even
with zero findings, run by the coder in a fresh session.
