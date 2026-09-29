---
name: kanban-jobs
description: "Run one step of a Job — plan, review the plan, code, review the code, fix — recording each attempt in the plan's Job Record. Use when a prompt-kanban Job prompt names this skill, or to run the same cycle by hand in any project."
disable-model-invocation: true
---

# Kanban Jobs

Job Record contract: 2

A prompt naming another number was written for another format: stop before writing anything and say which side is
behind (higher: run `npx skills update -p`; lower: update prompt-kanban).

A **Job** is five steps, each in a fresh session working from the plan's record: **A** plan, **B** review the plan,
**C** code, **D** review the code, **E** fix the findings. The record is the Job's `<job-record>` block in a markdown
plan in the repository. Read this file and the step's file in full before writing anything:

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
the newest plan silently, as it may be another Job's. The Job ID: the id of the plan's one `<job-record>` block; with
several, ask which; with none, generate a lowercase UUID v4 (the only shape the app reads) and add the block at the
plan's end. An attempt's `agent` is the prompt's label or, by hand, your own name (Claude, Codex, …).

## The Job Record

A new Job's block, in exactly the shape the app reads (both tags at column zero, one `json` fence between them):

<job-record id="<jobId>">

```json
{
  "commits": { "plan-review": null, "code": null, "code-review": null, "code-fix": null },
  "attempts": []
}
```

</job-record>

- **`commits`** holds the live SHA per key, `null` or a full 40-character lowercase SHA; it is all the app reads.
  B, C, D and E own `plan-review`, `code`, `code-review` and `code-fix`. A newer commit overwrites its key; the old
  SHA survives in its attempt's `commit`.
- **`attempts`** gets one object per attempt, appended, never edited or removed, so the history stays trustworthy:
  a correction is a new attempt, and the user's answers go beside their question in the planning content. Each
  holds `step`, `attempt` (the number `<N>`: one more than the largest `attempt` for that step, or 1), `agent`,
  `commit` (the commit this attempt made, or `null`), `summary` and its step's fields, as its step file shows.
- **`summary`** is your final summary as one JSON string: what was done or found, the actual verification output,
  blocked checks and open work. End your reply with that same text.
- **Writing it.** Parse the block, change only your attempt and your `commits` key, write the whole block back as
  valid JSON with 2-space indent, then re-parse it. A block that doesn't parse or match this shape, or a second
  block for the Job, stops the step before you write: it may hold the only copy of earlier attempts. Leave other
  Jobs' blocks alone.
- **One writer.** Only you, the coordinating session, write the plan, after delegates finish, from a fresh read, and
  reread to verify. If it changed under you in a conflicting way, stop.

## Recording commits

Write every SHA from Git's own output, never retyped: a run once dropped three characters, making the record
unusable.

- **C and E** set `commit` and their key after their code commit. No code commit: `commit` stays `null` and the
  key untouched.
- **B and D** commit their attempt with `commit` still `null`, as a commit cannot hold its own SHA, then write that
  commit's SHA into `commit` and their key and leave that one change for the next history commit. Never amend to
  carry it: that changes the SHA you just wrote.

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

Saving the attempt, committing it and writing its SHA can each fail alone: before the summary in your reply, say on
its own line which happened and which failed. A rerun reuses the saved attempt, its number and commit, never
duplicating them; if you can't tell which commit an earlier attempt made, ask.
