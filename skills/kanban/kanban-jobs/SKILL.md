---
name: kanban-jobs
description: "Run one step of a Job — plan, review the plan, code, review the code, fix — recording each attempt in the plan's Job Record. Use when a prompt-kanban Job prompt names this skill, or to run the same cycle by hand in any project."
disable-model-invocation: true
---

# Kanban Jobs

Job Record contract: 1

A prompt naming another number was written for another format: stop before writing anything and say which side is
behind (higher: run `npx skills update -p`; lower: update prompt-kanban).

A **Job** is five steps, each in a fresh session working from the plan's records: **A** plan, **B** review the plan,
**C** code, **D** review the code, **E** fix the findings. The record is the Job's own section of a markdown plan in
the repository. Read this file and the step's file in full before writing anything:

| Step | File | For |
|---|---|---|
| A | [STEP-A.md](./STEP-A.md) | writing the plan by hand |
| B | [STEP-B.md](./STEP-B.md) | reviewing the plan |
| C | [STEP-C.md](./STEP-C.md) | implementing it |
| D | [STEP-D.md](./STEP-D.md) | reviewing the code |
| E | [STEP-E.md](./STEP-E.md) | triaging and fixing the findings |

## Inputs

A prompt-kanban prompt hands them over. Invoked directly, ask for anything missing rather than guess. The step: the
user's, or propose the next from the record (after C comes D) and confirm. The plan: the user names it; never pick
the newest plan silently, as it may be another Job's. The Job ID: the plan's one `## Job Record <jobId>` heading;
with several, ask which; with none, generate a lowercase UUID v4 (the only shape the app reads) and add the heading.
A skeleton's `<agent>` is the prompt's label or, by hand, your own name (Claude, Codex, …).

## The Job Record

- **The section** opens with the column-zero heading `## Job Record <jobId>` and runs to the next level-one or
  level-two heading or the end of the file. Missing: add it at the end. Duplicated: stop and report. Leave other
  Jobs' sections alone.
- **An entry** is the step file's skeleton, appended at the section's end, with level-four blocks so none ends the
  section. `<N>` is one more than the section's largest attempt number for this step, or 1. Entries are never edited,
  so the history stays trustworthy: a correction is a new attempt, and the user's answers go beside their question in
  the planning content.
- **The summary** goes under `#### CLI summary` with every line — blank lines and lines already starting
  with ">" included — prefixed with exactly "> " and otherwise unchanged; end your reply with that same text. It
  gives what was done or found, the actual verification output, blocked checks and open work.
- **Line starts.** The app reads record lines and headings wherever they stand, fences included. So metadata stays
  outside the quote, and no line of text you write under a level-four heading starts with "#", "kanban-commit" or
  "Superseded commit": put such text in backticks.
- **One writer.** Only you, the coordinating session, write the plan, after delegates finish, from a fresh read, and
  reread to verify. If it changed under you in a conflicting way, stop.

## Recording lines

B, C, D and E each own one line, keyed `plan-review`, `code`, `code-review` and `code-fix`: exactly
`kanban-commit <jobId> <key>: <full SHA>` directly under the entry's heading, the full 40-character SHA, unindented
and bare — the app reads only that whole line. Write the SHA from Git's own output, never retyped: a run once dropped
three characters by hand, and a short SHA is an unusable record. In the same write, turn every earlier line for your key into
`Superseded commit <jobId> <key>: <old value>`, since two live lines that disagree are unreadable. If one is
malformed, or two disagree, ask before recording.

- **C and E** add the line after their code commit. No code commit, no line.
- **B and D** commit the entry without it, as a commit cannot hold its own SHA, then write that commit's SHA and leave
  that one change for the next history commit. Never amend to carry it: that changes the SHA you just wrote.

## Commits

| Step | Subject | Holds |
|---|---|---|
| B | `REVIEW HISTORY: Record step B attempt <N>` | the plan file alone |
| C | `CODE: <imperative summary>` | this step's changes, never the plan |
| D | `REVIEW HISTORY: Record step D attempt <N>` | the plan file alone |
| E | `CODE REVIEW FIXES: <imperative summary>` | the approved fixes, never the plan |
| E | `ATTEMPT PLANS: step E <jobId> attempt <N>` | the attempt's additional plans |
| E | `JOB HISTORY: Record step E attempt <N>` | the plan file alone |

Subjects are at most 72 characters. A code commit may add one to three lines of why; the rest have no body.

**An ignored plan** (matched by an ignore rule and untracked) can't be committed, so B and D record the review with
an **empty marker** under the same subject: parent the `HEAD` you noted, tree that parent's, published only while
`HEAD` still names that parent, index untouched, signed if the repository signs. (A marker built from a stale tree
once reverted another agent's commit.) Report "local record saved; marker committed". Only for a plan Git reports as
ignored, never to cover a Git error or a failed commit. E makes no marker and says no history commit was made.

**Hard limits**, each protecting the user's repository or a SHA already recorded:

- Commit on the current branch, whichever it is. Mid merge, rebase, cherry-pick or revert, stop: a commit would
  finish it for the user.
- Commit only your own paths, by path; the user's staged work stays staged and out, as it is theirs. A bare
  `git commit` sweeps it in, and zsh globs unquoted `[locale]` or `(group)` paths.
- Never force-add, change ignore rules, untrack, amend, rebase, reset or push, and never roll anything back:
  rewriting history orphans a SHA the app may hold, and the rest overrule the user's choices.
- No empty commit except the marker: nothing to commit means no commit.
- No `Co-Authored-By`, tool or model attribution or other trailer on any commit: the history is the user's.

**Done rules:**

- A recorded SHA is the commit this session made — parent the `HEAD` you noted, subject yours — never a later `HEAD`,
  which another agent or a hook may have moved.
- A commit holding a path that isn't yours (a hook can add one) has failed isolation: never record it. Stop, report
  its SHA and the foreign paths, end the attempt BLOCKED and commit nothing more; undoing it is the user's call.
- B and D commit their record whatever changed or the verdict, so every review leaves a trace in history.

## Reporting

Saving the entry, committing it and writing its SHA can each fail alone: before the summary in your reply, say on its
own line which happened and which failed. A rerun reuses the saved entry, attempt number and commit, never
duplicating them; if you can't tell which commit an earlier attempt made, ask.
