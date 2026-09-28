---
name: kanban-jobs
description: "Run one step of a Job — plan, review the plan, code, review the code, fix — recording each attempt in the plan's Job Record. Use when a prompt-kanban Job prompt names this skill, or to run the same cycle by hand in any project."
disable-model-invocation: true
---

# Kanban Jobs

Job Record contract: 1

A **Job** is one piece of work run as five steps: **A** plan it, **B** review the plan, **C** code it, **D** review the
code, **E** fix what the review found. B and D are the reviewer's work and A, C and E the coder's; every step works
from the plan's records, never from another session's memory. A Job has no issue file: its record lives in its own section of a markdown plan, headed
`## Job Record <jobId>`. Several Jobs may share one plan, each with its own section. The plan can live anywhere in the
repository; prompt-kanban binds plans under `.claude/plans`, but nothing here assumes that directory.

Read this file in full for every step, then the step's own file in full, before writing anything:

| Step | File | Read it when |
|---|---|---|
| A | [STEP-A.md](./STEP-A.md) | writing a new plan by hand (a prompt-kanban step A prompt carries its own instructions) |
| B | [STEP-B.md](./STEP-B.md) | reviewing the plan |
| C | [STEP-C.md](./STEP-C.md) | implementing the plan |
| D | [STEP-D.md](./STEP-D.md) | reviewing the code |
| E | [STEP-E.md](./STEP-E.md) | triaging and fixing the review's findings |

## Inputs

One procedure, two ways to get its inputs. A prompt-kanban prompt hands them over; invoked directly, you derive or ask.

| Input | From a prompt-kanban prompt | Invoked directly, in any project |
|---|---|---|
| Step (A–E) | named by the prompt | the user names it. If they don't, propose the next step from the Job's record (after C comes D) and ask them to confirm. |
| Plan path | given | the user names the file. If they don't, ask. Never pick the newest plan silently. |
| Job ID | given | read from the plan's `## Job Record <uuid>`. Exactly one → use it. Several → ask which. None → step A (or a B–E run on a plan without one) generates a UUID and adds the heading. |
| Agent label | given | your own name (Claude, Codex, …). |
| What was asked (B) | given | the goal the plan states; ask if it states none. |
| D's starting commit | given | optional: D reviews every code commit the record holds for the Job anyway. |
| Contract version | named by the prompt, and must match | nothing to check. |

Never reuse another Job's ID, and never guess between candidates: a wrong guess writes into another Job's history. A
generated ID is a lowercase UUID version 4 (`python3 -c 'import uuid; print(uuid.uuid4())'`, or `uuidgen` lowercased),
because that is the only shape the section heading is read in.

## Version

This file states `Job Record contract: 1`, the version of the record format below. A prompt that names another number
was written for another format: stop before writing anything and say which side is behind. A prompt expecting a
higher number needs a newer copy of this skill (`npx skills update -p`); one expecting a lower number comes from a tool
that needs updating.

## The Job Record

**The section.** This Job's section opens with the column-zero heading `## Job Record <jobId>`, wherever it sits in the
file, and runs to the next level-one or level-two heading or the end of the file. If the heading is missing, add it at
the end of the file. If the plan has more than one unquoted heading for this Job, stop and report the conflict instead
of guessing. Leave other Jobs' sections alone, and keep every earlier entry exactly as it is: a correction is a new
attempt, never an edit.

**The entry.** Each attempt appends one entry at the end of the section, in the skeleton its step file gives. Values in
angle brackets are placeholders, never literal text. Every block inside an entry is a level-four heading, because a
level-two one would end the Job's section. `<N>` is one more than the largest attempt number this Job's section already
holds for this step, or 1.

**The summary.** Prepare your final summary once. Store it under `#### CLI summary` with every line — blank lines and
lines already starting with ">" included — prefixed with exactly "> " and otherwise unchanged, then end your reply with
that same text. Quoting it that way means removing one prefix per line gives it back unchanged, and nothing quoted sits
at column zero, so a heading, a UUID or a recording line inside the summary can never pass for this section's
metadata. The summary says what was done or found, the actual final verification output rather than full logs, which
checks were blocked and why, deviations from the plan and open work.

**Line starts.** Keep every metadata line outside the quote. Never start a line of the text you write under a
level-four heading with "#", "kanban-commit" or "Superseded commit": quote such text inline in backticks instead. The
record is read line by line, and those starts are what it reads as headings and recordings.

**The user's answers.** When the user answers a question the plan leaves open, write the answer into the plan beside
the question, marked as the user's, in the same write as your entry. The next step runs in a fresh session and sees
only the plan: an answer kept in your entry alone reads to it as a question still open, or as your guess.

**One writer.** Only you, the coordinating session, write to the plan, after any agents you delegated to have
finished. Make each change from a fresh read as one write, then reread the plan to verify it; if it changed under you
in a way that conflicts with your edit, stop and report it.

## Recording lines

B, C, D and E each own one recording line, keyed by the step: `plan-review` (B), `code` (C), `code-review` (D) and
`code-fix` (E). It is exactly

```text
kanban-commit <jobId> <key>: <full SHA>
```

directly under the entry's heading, with the full 40-character SHA in place of `<full SHA>` and no indentation,
bullet, backticks or code fence: the line is read as a whole physical line, so any decoration hides it. Never write it
with an earlier SHA, an empty value, None or an example.

**Superseding.** In the same write that adds a live line, turn every earlier `kanban-commit <jobId> <key>:` line
anywhere in the plan, identical duplicates included, into `Superseded commit <jobId> <key>: <old value>` in place, so
your entry holds this Job's only live line for that key. Two live lines that disagree make the record unusable; the
demoted line still names its Job and step, so step D can attribute it in a shared plan. Leave every other step's lines
and other Jobs' lines alone. If an existing line for your key is malformed or two of them disagree, ask the user how to
resolve it before recording.

**Code steps (C, E)** record the code commit they made. The line goes in only when this attempt made one: after the code
commit succeeds, read back its full SHA. Without a code commit, leave the line out and change no existing recording
line.

**Review steps (B, D)** record the commit that holds their own review. The entry you commit has no recording line yet,
because a commit cannot contain its own SHA. After the record commit or marker succeeds, read back its full SHA — the
commit you made, never whatever `HEAD` is by then — add the line under your entry's heading, and leave that one change
uncommitted: never amend to carry it. The next step that commits the whole plan carries it. Without a record commit or
marker, leave the line out.

## Saving, retrying and reporting

Saving your entry, committing the plan and saving a commit's SHA in it are separate operations, because a review whose
commit failed still happened. If one fails, report which operation failed, its error, any commit's full SHA and the
exact entry, then retry only that operation, reusing the same attempt number, summary and commits — never duplicate an
entry or create another code commit, record commit or marker. An entry saved before a failed commit is reused, and a
SHA write that failed after its commit succeeded is retried with that exact commit. If a later session cannot
unambiguously identify a commit this attempt already made — neither `HEAD` nor a history commit's subject, which other
Jobs share, identifies one — stop and ask the user; never invent a recording or blindly retry.

Before the summary in your final reply, say on its own line whether the entry was saved, whether it was committed and
whether its commit's SHA was saved, or which failed; never put that status in the entry.

## Commits

Every commit here goes on the current branch. Never force-add, change ignore rules, untrack a file, amend, rebase or
push. Identify a commit you made by its parent (the `HEAD` you noted before committing) and its subject, never by
whatever `HEAD` is later: another agent may have committed since.

**Code commits (C, E).** The subject starts with the prefix the step file gives and, prefix included, is at most 72
characters, describing the change in the imperative; an optional body of one to three lines may say why. No trailers:
no `Co-Authored-By`, no tool or model attribution, generated-with footer or badge, so the history reads the same
whichever agent made it. Stage this step's relevant changes by path and leave unrelated staged or working-tree changes
alone; the Job's plan never goes into a code commit. With nothing to commit, make no commit — never an empty one. Right
after the commit, before any other, read its full SHA and confirm its subject, since the next commit would otherwise
be the `HEAD` a later lookup finds.

**History commits (B, D, E)** put the plan itself into history, so anyone coming back can see the step ran. After
saving, commit the whole plan file — its planning content and every Job Record section, not just your entry — alone:

1. Check whether Git ignores it: `git check-ignore --no-index -q -- <plan path>` exits 0 when it is ignored, 1 when it
   is not, and anything else is an error to report, never permission to commit.
2. If Git does not track it yet, add it: `git --literal-pathspecs add -- <plan path>`.
3. Commit it: `git --literal-pathspecs commit --only -m "<subject>" -- <plan path>`. A plain `git commit` would sweep in
   whatever else the user had staged; a separate index would leave the old plan in their index for their next commit
   to revert; and without literal mode a path holding `[`, `*` or `?` also matches its neighbours.
4. Verify the commit contains only the plan and that the user's other staged work is still staged.

The subject is `REVIEW HISTORY: Record step <B|D> attempt <N>` for a review and `JOB HISTORY: Record step E attempt
<N>` for a fix, `<N>` being your entry's attempt number, with no body, trailers or attribution. If this attempt's exact
entry is already committed, reuse that commit rather than making another, and never make an empty commit instead.

**An ignored plan.** A review (B, D) commits an **empty marker** in its place, so the review still leaves a trace.
Run exactly these commands, from the repository root, with the same subject:

```sh
parent=$(git rev-parse --verify HEAD)                 # noted before anything else
tree=$(git rev-parse "$parent^{tree}")
new=$(git commit-tree "$tree" -p "$parent" -m "<subject>")
git update-ref -m "<subject>" HEAD "$new" "$parent"   # refuses if HEAD moved
```

The marker's tree is its parent's by construction, and `update-ref` publishes it only while `HEAD` still names that
parent, so it can never land on another agent's commit and revert it; the user's index is never touched. If
`update-ref` refuses, stop and report it: never retry onto the new `HEAD` without deciding again. Hooks don't run,
which is acceptable for a commit that carries no content. The marker holds no review text; report "local record saved;
marker committed". It is only for a plan Git positively reports as ignored — never a fallback for an unclear ignore
state, permissions, hooks, a Git error or a failed save. A fix (E) makes no marker: it keeps its entry saved locally
and says plainly that no history commit was made.
