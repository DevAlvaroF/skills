# Driver brief — skill E2E scenarios through Codex

You drive one scenario end to end. **Codex does the work; you only set up, feed prompts, answer its
questions, and verify.** Never edit the scenario repo's files yourself except where this brief says
(the hand-made plan/commit in mm-jobs-ignored, gitignore rules before setup), and never touch
the prompt-kanban checkout except to write under its `.skill-evals/`.

Read `vendor/skills/evals/README.md`, `evals.json` (your scenario) beside it, and skim
`cli.ts` / `verify.ts` for the command and check shapes. Run every harness
command from the prompt-kanban root as `npm run -s skill-evals -- …`. If the harness
fails to import (another agent may be mid-edit in `src/`), wait a minute and retry.

## Layout

- Repo: `/tmp/pk-e2e/<scenario>-<new|old>` (create with `repo … --skills new|old`).
- Run dir: `.skill-evals/iteration-<I>/eval-<eval_id>-<scenario>/<new_skill|old_skill>/run-1`.
- Write `eval_metadata.json` in the eval dir: `{"eval_id": <n>, "eval_name": "<scenario>", "prompt": "<one line>"}`.
- Per step: write a `subject.json` (featureTitle, featureDescription, specPath, issuePath, planPath,
  briefId, jobId, commitSha, skills) in the run dir's `steps/`, render with
  `prompt <step-key> --templates <new|old> --subject …`, save the prompt, run `step`.
- `skills` = the Skill directory names the app ticks for that step (the step's fixed floor plus the
  obvious supporting ones), e.g. grill → `<fl>-grill-with-docs`; spec-generate → `<fl>-to-spec`;
  spec-review → `<fl>-to-spec`; spec-to-issues → `<fl>-to-issues`; implement → `<fl>-implement`,
  `<fl>-tdd`; final-review → `<fl>-final-review`; review-fix → `<fl>-final-review`, `<fl>-tdd`;
  plan-generate → none; plan-review / code-review → `kanban-jobs`; code / code-fix → `kanban-jobs`, `<fl>-tdd`.
- Setup has no app prompt: run it with the prompt `$<fl>-setup-skills` (answer its questions).
- Steps 1 and 2 share one session: run 1 with `step`, then send step 2's rendered prompt with
  `answer … 1-grill @<prompt file>` — and record that in the step label notes.

## Answering

When Codex stops with a question, answer with `answer <repo> <run> <label> "<text>"`, using the
scenario's canned answers; otherwise pick the recommended option. Approval gates (steps 7, E, and
anything asking to approve a triage or plan): reply approving. Keep answers short and never tell
Codex how to do the Git work. Cap a step at 8 turns; if it is still asking, record that as a failure
and move on. A step that stops because a dependency is missing (tracker contract, skill file) is a
finding, not something to work around — record it, then decide whether the rest can run.

Codex steps can take many minutes: run `step`/`answer` with a 600000 ms Bash timeout, or in the
background and wait for it.

## Verifying

After each step, write a `checks-<label>.json` and run `verify` (it appends to the run's
`grading.json`). Always include, with `since` = the HEAD in `steps/<label>.head`:
`{"kind":"commits","since":…}` (with `paths`/`subjects`/`count` where the step's commits are
known), `{"kind":"sentinel"}`, `{"kind":"reflog","since":…}`. Then the step's own checks from
`evals.json` — Issue status and recorded fields (`issue`), plan records (`plan`), spec marker,
`recorded-subject` (the recorded SHA names the commit this step made), and `file` patterns for the
comment-record labels. Grade formats, done rules and hard limits, never wording. Where a check
cannot be expressed in `verify`, check by hand and append a
`{"text","passed","evidence"}` entry to `grading.json` yourself (keep the `summary` block
consistent).

Expected commit subjects: step 4 `SPEC: …`; step 5 `CODE: …` (+ `Issue:` trailer); step 6
`REVIEW HISTORY: Record final review attempt <N>`; step 7 `CODE REVIEW FIXES: …` when code changed,
`Closed Issue: <issue path>` on COMPLETE; B `REVIEW HISTORY: Record step B attempt <N>`; C `CODE: …`;
D `REVIEW HISTORY: Record step D attempt <N>`; E `CODE REVIEW FIXES: …` when code changed and
`JOB HISTORY: Record step E attempt <N>`. Local mode: no commit touches `.mysdd/features/`; the
review marker is an empty commit (tree equal to its parent).

At the end: `snapshot <repo> <run> .claude/plans`, then return a ≤300-word report: a pass/fail
table per step (passed/total, tokens, seconds), every failed assertion with its evidence, and
anything in the Codex transcripts (`steps/*/events-*.jsonl`) that looks like wasted turns (e.g.
re-deriving Git steps, re-reading the tracker many times, retry loops).
