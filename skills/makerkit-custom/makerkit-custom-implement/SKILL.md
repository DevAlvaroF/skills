---
name: makerkit-custom-implement
description: "Implements, verifies, commits and advances one or more issues from the project's issue tracker. Use when an issue under .mysdd/features/ is ready-for-agent and the user asks to implement it."
disable-model-invocation: true
---

Implement the issues the user names, working from each issue and the spec it came from.

Read `.mysdd/issue-tracker.md` whole before writing anything: its issue shape, comment records and commit rules are
the ones this skill writes to. It must hold exactly one `Tracker contract: 7` line; missing, lower or none → stop and
tell the user to re-run `/makerkit-custom-setup-skills`; higher → stop and tell them to run `npx skills update -p`.

Read each issue and work from its `whatToBuild`, `acceptanceCriteria`, `testBoundaries` and `spec`. An issue whose
`codeCommit` already holds a SHA has been implemented: a further change is a fix round, which belongs to phase 2 of
`/makerkit-custom-final-review`, so stop for that issue and say so. Start only once § Committed or local resolves to a
mode, and note which paths were already dirty: they are the user's, not the change.

**Context.** Keep this session lean, for orchestration, the user's decisions, commits and records: hand reading,
searching, checks and fixes (a review finding once weighed per [REVIEW.md](./REVIEW.md)) to sub-agents where that helps,
on the disjoint files § Build splits. Brief each one with what it needs and read what it returns, which is how you know
what is going on: ask for what you need to act on, not raw output. Its edits are your own paths to commit; it commits
nothing, as a recorded SHA must be a commit this session made.

## Ground yourself first

Before writing any code, read the project's own documentation, because where it and this skill differ, the repo wins:

- every `AGENTS.md` from the repo root down to each directory the work touches, plus any a file on that chain routes a
  touched concern to — read them directly, since not every agent loads nested files;
- the glossary and the binding ADRs, per `.mysdd/docs/agents/domain.md`;
- the `README.md` of each app or package the issue involves;
- the Makerkit docs, through one sub-agent, per `.mysdd/docs/agents/domain.md` § Makerkit docs; start on whatever
  doesn't depend on its answer while it works.

**Mobile app.** If `apps/native` exists and the issue may touch it, invoke `/makerkit-custom-mobile-app` and apply its
§ Tests and § Verify, so step 2 runs the mobile checks too.

## Build

- Use `/makerkit-custom-tdd` where possible, at the issue's `testBoundaries`. A boundary the issue doesn't list, or one
  that doesn't hold, is agreed with the user before you write the test, then added to `testBoundaries`: the final
  review checks against that list.
- A binding ADR the code can't honour is a stop: ask the user, never bend the code or rewrite the ADR yourself. If they
  agree to change it, supersede it per `/makerkit-custom-domain-modeling`; the changed ADRs join this issue's commit.
- Sub-agents get disjoint files and the boundaries they own, split before any is dispatched, because two agents editing
  one file lose work. Do what several slices share here first — a shared type, a migration or RLS policy, a contract
  two apps or packages change. Don't hand out a part that depends on the docs sub-agent before its answer is in. Work
  that won't split cleanly is done here, piece by piece. Review, commit and advancing stay in this context.
- Keep an explicit **inventory** of every path the work creates, edits or deletes, yours and each sub-agent's as its
  handoff names them — never inferred from `git status`, which also shows the user's work. A path that was already
  dirty goes in marked **mixed**. Files a `lint:fix` or typegen run rewrote join the change when they belong to it;
  list any other rewrite in the report, uncommitted. A convention line or routing row the issue carries is written
  into its `AGENTS.md`, which joins the inventory.
- An edit to a `packages/**` file Makerkit ships that the spec's Decision log doesn't name is agreed with the user
  first, since it costs a conflict on every upstream pull. Every edit to a file Makerkit ships carries a `kit-edit:`
  comment saying why, per the root `AGENTS.md` § Kit edits: `/makerkit-custom-kit-conformance` blocks on a missing one.
- Typecheck and run single test files often; run the full suite once at the end, in step 2.

## Finish

1. **Review the work** per [REVIEW.md](./REVIEW.md): spec fidelity always, standards by fallback only. It runs whether
   or not the repo lists anything like it.
2. **Verify** with the root `AGENTS.md` § Verification, in its order, plus whatever the nested `AGENTS.md` files on the
   chain add; if the section is missing or differs, follow the repo and say which list you ran. Send each whole-repo run
   (full suite, build, lint sweep) to a sub-agent that runs the exact command and reports only failures, pass/fail and
   under 200 words, because its output is noise here; fix, then re-run it. Weigh review-skill findings per
   [REVIEW.md](./REVIEW.md) § Assess refactors.
3. **Commit, then advance each issue** — in that order, because the issue records the commit's SHA.

### Commit

- An issue left partly done gets no commit: tick only verified criteria, say what is outstanding, leave it open.
- Scan the spec for secret-shaped strings first (keys, tokens, private keys, credentialed URLs, customer data): the
  `Spec:` trailer points history at it. On a hit, commit nothing and tell the user what and where.
- Make the `CODE:` commit per § Commits, with its `Issue:` and `Spec:` trailers, holding exactly the inventory: final
  review finds the change by that trailer.
- One commit per issue in dependency order; only work that genuinely can't be separated shares one commit, with an
  `Issue:` trailer per issue.
- Take each SHA from the commit you just made, straight away: `HEAD` names only the last one, and another agent may
  commit next.

### Advance

Rewrite each committed issue once, per § Issue shape: every criterion you verified `"done": true`,
`"status": "done-coding-awaiting-final-review"`, `codeCommit` its own SHA, and one appended implementation record per
§ Comment records, including its `Deviations and tradeoffs:` part — the coder who triages the review weighs each
finding against it. Record only what this run decided, and each ADR the user agreed to supersede, with its replacement:
the final review accepts that change only from this record. Every other field is carried over verbatim; add to
`testBoundaries` only what the user agreed. Each deferral the user approved goes where § Deferrals says — this issue's
one Sub-issue, or the live issue already covering it — and the record names it: a deferral nobody wrote down is lost.
Never write `reviewHistoryCommit` or `reviewCodeCommit`, and never set
`done-final-review`: those belong to the final review. If the write fails after the commit landed, report the SHA and
the error instead of committing again.

Report per issue: the SHA and subject, its mixed paths, any Sub-issue written, and which issues you advanced or left
open, each with a one-line reason. In committed mode the issue file is left dirty on purpose, per § Commits' done rules.
