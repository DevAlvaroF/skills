---
name: modified-matt-implement
description: "Implements, verifies, commits and advances one or more issues from the project's issue tracker. Use when an issue under .mysdd/features/ is ready-for-agent and the user asks to implement it."
disable-model-invocation: true
---

Implement the issues the user names, working from each issue and the spec it came from.

## Before you start

- Read `.mysdd/issue-tracker.md` whole; it must hold exactly one `Tracker contract: 5` line: with none (or no file) or
  a lower number, stop and tell the user to re-run `/modified-matt-setup-skills`; with a higher one, stop and tell them
  to run `npx skills update -p`. Its § Issue shape, § Comment records and § Commits are the formats and rules this
  skill writes by, and § Committed or local must resolve before you write: unresolved, stop and list the paths.
- Read each issue and work from its `whatToBuild`, `acceptanceCriteria`, `testBoundaries` and `spec`. An issue whose
  `codeCommit` already holds a SHA has been implemented: further change is a fix round for phase 2 of
  `/modified-matt-final-review`, so stop for that issue and say so.
- Read the glossary and the binding ADRs for the paths you touch, per `.mysdd/docs/agents/domain.md`. Work the code
  can't do without contradicting a binding ADR is a stop: ask the user rather than bend the code or rewrite the ADR.
  If they agree to change it, supersede it by `/modified-matt-domain-modeling`'s rules; the changed ADRs join this
  issue's commit.
- Note which files are already dirty before you edit anything: they are the user's, not your work.

## Do the work

Use `/modified-matt-tdd` at each issue's `testBoundaries`. A boundary the issue doesn't list, or a listed one that
doesn't hold, is agreed with the user before you write the test, then added to `testBoundaries`.

Sub-agents each get a disjoint set of files and the boundaries they own, with shared work (a type, schema or contract
two slices change) done here first: two agents editing one file overwrite each other. Work that won't split cleanly is
done here, piece by piece. Each handoff names every path it created, edited or deleted.

Keep an **inventory** of every path the work creates, edits or deletes — yours and each handoff's — and never infer it
from `git status`, which also shows the user's work. A path that was already dirty and that you also edit is **mixed**:
report it, because its commit carries the user's earlier edits too. An `AGENTS.md` convention line the issue carries
is part of the work. The review covers exactly the inventory, and the commit holds exactly its paths.

Run typecheck and single test files often, to drive each cycle. Run the full suite once at the end through a
sub-agent reporting only failures (test, file, assertion) and a verdict, under 200 words: the rest is noise.

Then run the two-axis review in [REVIEW.md](./REVIEW.md) on the inventory, before any commit: the commit is what the
final review is pointed at, so it should already be the reviewed change.

## Commit the work

- Don't commit an issue you left partly done: say what's outstanding and leave it open.
- Before a commit whose `Spec:` trailer names a spec, read that spec for anything secret-shaped (keys, tokens,
  credentialed URLs, PII) and stop if you find it: the trailer puts its path in history for good.
- Make the `CODE:` commit per § Commits, with its `Issue:` and `Spec:` trailers: final review finds the change by the
  `Issue:` trailer. One issue, one commit, in dependency order; only work that genuinely can't separate shares one
  commit, with an `Issue:` trailer per issue and the same SHA recorded on each.
- Take each SHA from the commit you just made, before the next one: `HEAD` later names only the last commit, and
  another agent may commit meanwhile. A commit holding a path that isn't yours is never recorded (§ Commits).

## Advance the issues

After the commits, write each committed issue once, as the whole object with every other field carried over verbatim
— `comments` and the review fields may be the only copy:

- tick each `acceptanceCriteria` entry you verified (never one you didn't);
- set `status` to `done-coding-awaiting-final-review` and `codeCommit` to that issue's own SHA;
- append the implementation record from § Comment records: the verification and its final output, the review outcome,
  anything left open, each ADR the user agreed to supersede with its replacement (the final review accepts a
  supersession only from this record), and a part opening `Deviations and tradeoffs:` naming each deviation from the
  issue or spec and each deliberate tradeoff with its reason, or `Deviations and tradeoffs: None.` Phase 2's coder
  weighs findings against it in a fresh session, so record only what this run decided.

`testBoundaries` may only grow, by boundaries the user agreed. Never write `reviewHistoryCommit` or `reviewCodeCommit`, and
never set `done-final-review`: they belong to the final review. If writing an issue fails after its commit landed, report the SHA
and the error; don't commit again.

Report per issue: the SHA and subject, any mixed paths, which issues advanced and which stayed open, with a one-line
reason. In committed mode the issue file is now dirty and outside the commit, because a commit can't hold its own SHA;
say so and leave it for the issue's next commit.
