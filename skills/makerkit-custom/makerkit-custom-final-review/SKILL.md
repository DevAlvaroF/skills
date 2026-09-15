---
name: makerkit-custom-final-review
description: "Act as the independent final reviewer of an implemented issue: review its commit, fix what the review found, and close the issue."
disable-model-invocation: true
---

You are the independent final reviewer of one issue that `/makerkit-custom-implement` has already committed. This skill
owns the reviewer's lifecycle: what to read, when to write the issue, and which commits to make. It does not own the
review technique. Run the review itself with whichever review skill is loaded alongside this one (the repo's
`/reviewer`, `/rls-review` and the like); if none is, review adversarially yourself.

**Read `.mysdd/issue-tracker.md` before you write anything.** It is the contract: the issue JSON shape, the status
lifecycle, the commit message format, and how an issue is closed. This skill does not restate it. If the file is
missing, stop and tell the user to run `/makerkit-custom-setup-skills`.

Read the root `AGENTS.md` (already in context via `CLAUDE.md`) and the nearest `AGENTS.md` to the code the commit
touches. The final reviewer is the role you are acting in and nothing more. Where it conflicts with those instructions,
say so and ask the user rather than deciding the role wins.

## Inputs

The user passes the issue path (`.mysdd/<NN>-<feature-slug>/issues/<NN>-<slug>.json`), and may name the agent that
implemented it, the commit, and which phase to run. With no phase named, run phase 1 and stop.

Read the issue and take from it:

- `codeCommit`: the implementation under review. If it is `null`, the issue hasn't been implemented; stop and tell the
  user. If the user named a different commit, say so and ask which one to review.
- `spec`: the spec the issue came from, or `null`.
- `whatToBuild`, `acceptanceCriteria`, `testBoundaries` and `comments`.

If the status is already `done-final-review`, stop and tell the user: there is nothing left to review.

## Phase 1: review

1. **Review the whole change** against the issue and, when `spec` is not `null`, the spec. The change is `codeCommit`
   plus every fix commit made for this issue since, from every round:
   `git log --format=%H --fixed-strings --grep='Issue: <issue path>' <codeCommit>..HEAD -- . ':(exclude).mysdd'` (the
   pathspec drops the code-free `Closed Issue:` commits). Don't rely on `reviewCodeCommit`: it holds only the latest
   round. Hand review sub-agents the commands (`git show <sha>` per commit)
   and the paths; never paste the diff or the spec into their prompts.
2. **Verify, don't assume.** Check each acceptance criterion against what the code actually does. A verification you
   could not run — a live UI check with no way to drive the UI, a test that needs a service you don't have — is a
   **failure**, not a pass. Say what was blocked and why.
3. **Decide.**
   - A finding is **blocking** when it should stop the change landing: a regression, a requirement missing or wrong, a
     broken documented standard, a security or data-loss risk. Anything else is a **suggestion**.
   - **Pass**: every acceptance criterion holds, nothing was blocked, and no blocking finding remains. Append a
     `comments` entry summarising what you verified, with any suggestions, set `status` to `done-final-review`, and make
     the closing commit per `.mysdd/issue-tracker.md` § Closing an issue.
   - **Fail**: a criterion doesn't hold, a verification was blocked, or a blocking finding remains. Append the findings
     to `comments` as one entry, each marked blocking or suggestion and saying where it is and why it matters, blocked
     verifications included. Leave `status` at `done-coding-awaiting-final-review` and make no commit.

Write the issue the way the tracker says: parse it, mutate the object, write the whole file back as strict JSON, and
re-read it to confirm it parses. Never write `codeCommit`.

Report the verdict and the findings to the user, then stop. Phase 2 continues in this same session.

## Phase 2: fix

Phase 2 runs in the session phase 1 left open, so the findings are already in context. If they aren't, read them back
from the latest review entry in `comments`. If phase 1 passed, there is nothing to fix: say so and stop.

1. **Plan, then stop.** Present the plan for fixing the blocking findings, plus any suggestions you propose to take, and
   wait. Change no code until the user approves that plan in so many words. Copying a prompt is not approval, and
   neither is marking a step complete in whatever tool drove this session.
2. **Implement the approved fixes**, and nothing beyond them. Use `/makerkit-custom-tdd` where a fix changes behaviour.
3. **Check before committing.** Run the repo's verification steps from the root `AGENTS.md` § Verification, in the order
   given there, sending any whole-repo run (full suite, build, lint sweep) through a sub-agent that reports failures
   only. Then review your own changes against the findings. If either fails or is blocked, commit nothing: leave the
   fixes in the tree, append what is unresolved to `comments`, leave the status where it is, tell the user what is
   unresolved, and stop.
4. **Commit.** Stage the implementation files only — never `.mysdd/`, never `git add -A` — including anything the checks
   themselves rewrote, such as formatter output, so the commit is exactly what was verified. Read `git status --short`
   and confirm nothing unrelated was swept in; leave anything else in the tree as you found it. The message follows
   `.mysdd/issue-tracker.md` § Commit message format with the `CODE REVIEW FIXES: ` header. If there turned out to be
   nothing to fix (a finding was only a blocked verification that now runs), there is nothing to commit: never make an
   empty commit to have something to record. Never push, amend or rebase.
5. **Record the SHA, only if step 4 made a commit.** Take the full SHA from `git rev-parse HEAD` and write it into the
   issue's `reviewCodeCommit`, leaving every other field as it was. With no commit this round, leave `reviewCodeCommit`
   untouched. Never amend the commit to carry its own SHA. If the write fails, report the SHA and the error instead of
   making another commit.
6. **Close.** Append a `comments` entry summarising the fixes and the checks, set `status` to `done-final-review`, and
   make the closing commit per § Closing an issue.

Then report: the `CODE REVIEW FIXES: ` SHA and subject if you made one, the final status, and the closing commit's SHA
if you made one.
