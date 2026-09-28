---
name: kanban-jobs
description: "Run one step of a Job — plan, review the plan, code, review the code, fix — recording each attempt in the plan's Job Record. Use when a prompt-kanban Job prompt names this skill, or to run the same cycle by hand in any project."
disable-model-invocation: true
---

# Kanban Jobs

Job Record contract: 1

A prompt that names another number was written for another format: stop before writing anything and say which side
is behind (a higher number needs `npx skills update -p`, a lower one a newer tool).

A **Job** runs as five steps — **A** plan, **B** review the plan, **C** code, **D** review the code, **E** fix the
findings — each from the plan's records, never from memory. Its record is its own section of a markdown plan in the
repository; prompt-kanban uses `.claude/plans`, but nothing here assumes that directory. Read this file, then
the step's own file, in full before writing anything:

| Step | File | For |
|---|---|---|
| A | [STEP-A.md](./STEP-A.md) | writing the plan by hand |
| B | [STEP-B.md](./STEP-B.md) | reviewing the plan |
| C | [STEP-C.md](./STEP-C.md) | implementing it |
| D | [STEP-D.md](./STEP-D.md) | reviewing the code |
| E | [STEP-E.md](./STEP-E.md) | triaging and fixing the findings |

## Inputs

A prompt-kanban prompt hands them over. Invoked directly: the user names the step; if not, propose the next step from
the Job's record (after C comes D) and ask them to confirm. For the plan, the user names the file. If they don't, ask.
Never pick the newest plan silently. The Job ID comes from the plan's `## Job Record <uuid>`. Exactly one → use it.
Several → ask which. None → step A (or a B–E run on a plan without one) generates a UUID and adds the heading. Never
reuse another Job's ID, and never guess between candidates. New IDs are lowercase UUID v4
(`python3 -c 'import uuid; print(uuid.uuid4())'`), the only shape read. A skeleton's `<agent>` is the prompt's label
or, invoked directly, your own name (Claude, Codex, …).

## The Job Record

**The section** opens with the column-zero heading `## Job Record <jobId>` and runs to the next level-one or level-two
heading or the end of the file. If the heading is missing, add it at the end of the file; if there is more than one
unquoted heading for this Job, stop and report the conflict. Leave other Jobs' sections alone and earlier entries
unedited: a correction is a new attempt.

**The entry** follows the step file's skeleton, appended at the section's end; angle brackets mark placeholders and
blocks are level-four headings. `<N>` is one more than the largest attempt number this Job's section already holds for
this step, or 1.

**The summary**, prepared once, goes under `#### CLI summary` with every line — blank lines and lines already starting
with ">" included — prefixed with exactly "> " and otherwise unchanged; end your reply with that same text. It gives
what was done or found, the actual final verification output, blocked checks and why, deviations and open work.

**Line starts.** Keep every metadata line outside the quote. Never start a line of the text you write under a
level-four heading with "#", "kanban-commit" or "Superseded commit": quote such text inline in backticks instead.

**The user's answers** go beside their question in the planning content, marked as the user's, in the same write as your
entry, never inside an entry: entries are never edited.

**One writer.** Only you, the coordinating session, write to the plan, after your delegates finish: each change from a
fresh read as one write, then reread the plan to verify it. If it changed under you in a conflicting way, stop.

## Recording lines

B, C, D and E each own one line, keyed `plan-review`, `code`, `code-review` and `code-fix`: exactly
`kanban-commit <jobId> <key>: <full SHA>` directly under the entry's heading — the full 40-character SHA, with no
indentation, bullet, backticks or fence. Never write it with an earlier SHA, an empty value, None or an example. In the
same write, turn every earlier `kanban-commit <jobId> <key>:` line in the plan, identical duplicates included, into
`Superseded commit <jobId> <key>: <old value>` in place. Leave every other step's lines and other Jobs' lines alone; if
a line for your key is malformed or two of them disagree, ask the user how to resolve it before recording.
**Code steps (C, E)** add the line after their code commit. Without a code commit, leave the line out and change no
existing recording line. **Review steps (B, D)** commit the entry without it, since a commit cannot hold its own SHA,
then add the record commit's or marker's SHA — the commit you made, never whatever `HEAD` is by then — and leave that
one change uncommitted: never amend to carry it. Without a record commit or marker, leave the line out.

## Saving, retrying and reporting

Saving the entry, committing the plan and saving a SHA are separate operations: a review whose commit failed still
happened. If one fails, report which operation failed, its error, any commit's full SHA and the exact entry, then retry
only that operation — a saved entry is reused, a SHA write retried with that exact commit — reusing the same attempt
number, summary and commits; never duplicate an entry or make another commit or marker. If a later session cannot tell
which commit this attempt made — neither `HEAD` nor a history commit's subject, which other Jobs share, identifies one —
stop and ask. Before the summary in your final reply, say on its own line whether the entry was saved, whether it was
committed and whether its commit's SHA was saved, or which failed; never put that status in the entry.

## Commits

Commit on the current branch, whichever it is. Never force-add, change ignore rules, untrack a file, amend, rebase or
push, and never roll anything back. No `Co-Authored-By`, no tool or model attribution or other trailer, on any
commit. Identify your commit by its parent (the `HEAD` you noted first) and subject, never by a later `HEAD`.

**The route**, for every commit that carries files, single-quotes each path (zsh otherwise globs `[locale]` or
`(group)`):

1. A merge, cherry-pick, revert or rebase in progress (`git status`): stop and report. A detached `HEAD`: commit there
   and say so.
2. Note the staged paths that aren't yours: `git diff --cached --name-only`.
3. `git --literal-pathspecs add -- '<path>'` each path that exists; a deleted, `git rm`ed or `git mv`ed path gets no
   `add`, and a rename commits both its paths.
4. `git --literal-pathspecs commit --only -m "<subject>" -- '<paths>'`. Nothing to commit means no commit, never an
   empty one.
5. Verify `git diff-tree --no-commit-id --name-only -r HEAD` lists exactly your paths, that
   `git --literal-pathspecs diff --cached --quiet HEAD -- '<those paths>'` succeeds, and that every noted path is still
   staged.
6. If a hook (lint-staged, a formatter) added paths or left the index disagreeing, name what it added and
   `git --literal-pathspecs reset -q -- '<path>'` each such path not noted; for a noted one, stop and report.

**Code commits (C, E):** the step's prefix and an imperative subject, at most 72 characters in all, and optionally one
to three lines of why. Stage this step's changes by path, never the Job's plan or unrelated changes, by the route.
Straight after it, read its full SHA and confirm its subject.

**History commits (B, D, E)** commit the whole plan file, alone, by the route, when
`git check-ignore --no-index -q -- '<plan path>'` exits 1; 0 means ignored, anything else is an error to report. The
subject is `REVIEW HISTORY: Record step <B|D> attempt <N>` or `JOB HISTORY: Record step E attempt <N>`, with no body.
If this attempt's exact entry is already committed, reuse that commit.

**An ignored plan (B, D)** gets an **empty marker** under the same subject, so the review leaves a trace:

```sh
parent=$(git rev-parse --verify HEAD)                 # noted before anything else
tree=$(git rev-parse "$parent^{tree}")
[ "$(git config --bool commit.gpgsign)" = true ] && sign=-S || sign=
new=$(git commit-tree "$tree" -p "$parent" -m "<subject>" $sign) &&
git update-ref -m "<subject>" HEAD "$new" "$parent"   # refuses if HEAD moved
```

It keeps its parent's tree and is published only onto that parent, so it can't revert another agent's commit or touch
the user's index. `commit-tree` runs no hooks and ignores `commit.gpgsign`, hence `-S`: if signing fails, nothing is
published; stop and report, never retry unsigned. If `update-ref` refuses, stop and report; never retry onto the new
`HEAD`. Report "local record saved; marker committed". It is only for a plan Git positively reports as ignored — never a
fallback for an unclear ignore state, permissions, hooks, a Git error or a failed save. A fix (E) makes no marker and
says no history commit was made.
