# evals

Measures these skills end to end: prompt-kanban's own Step prompts, run
through the Codex CLI in disposable repos, checked with prompt-kanban's own
parsers. It exists so a change to a skill is measured — pass rate, tokens and
wall time, new against old — rather than argued.

It runs from a **prompt-kanban checkout** holding this repo at
`vendor/skills`: it renders prompts and reads Issues, plans and commits with
the app's code (`@shared/domain`, `@main/services/git-history.service`), so a
check means what the app means. There, `npm run skill-evals` runs `cli.ts`.

## Loop

1. Snapshot the skills you are about to change into the checkout's gitignored
   `.skill-evals/baseline/old_skill/`, and the prompt templates into
   `.skill-evals/baseline/old_prompts.json` (the `prompt --templates old`
   source).
2. For each scenario in `evals.json`, and for `new` and `old`:
   ```bash
   npm run skill-evals -- repo /tmp/pk-e2e/mm-jobs-new --flavour modified-matt --skills new
   npm run skill-evals -- prompt code --templates new --subject subject.json > prompt.txt
   npm run skill-evals -- step /tmp/pk-e2e/mm-jobs-new $RUN C-code prompt.txt --plan .claude/plans/word-count.md
   npm run skill-evals -- answer /tmp/pk-e2e/mm-jobs-new $RUN C-code "I approve your triage."
   npm run skill-evals -- verify /tmp/pk-e2e/mm-jobs-new $RUN checks.json
   npm run skill-evals -- snapshot /tmp/pk-e2e/mm-jobs-new $RUN .claude/plans
   ```
   with `RUN=.skill-evals/iteration-N/eval-<id>/<new_skill|old_skill>/run-1`.
   `DRIVER.md` is the brief for an agent driving one scenario.
3. `npm run skill-evals -- aggregate .skill-evals/iteration-N` writes
   `benchmark.json`/`.md` through skill-creator's `aggregate_benchmark`.
4. Review with skill-creator's `eval-viewer/generate_review.py` (Python ≥3.10;
   `--static <file>.html` writes a standalone page), and read the Codex
   transcripts (`steps/*/events-*.jsonl`) for wasted turns, not only outcomes.

`step` stages a fresh `SENTINEL.txt` first (skip with `--no-sentinel`): a step
that commits it, or unstages it, swept the user's work. With `--plan <path>` it
also copies the Job's plan, as the step finds it, to
`steps/<label>.plan-before`: the `plan` check's `before`, against which the Job
Record's attempts may only grow. Each step's
`timing.json` sums the token usage Codex reports per turn; the run's
`timing.json` sums the steps.

## Rules

- Repos live under `/tmp/pk-e2e/`, never in a real project: Codex runs with
  `danger-full-access`.
- A scenario that clones a real project clones it with `--no-hardlinks` and
  removes the remote; the original is never touched.
- Grade what the skills promise — formats, done rules, hard limits — never
  wording. A check that passes for old and new alike measures nothing; prefer
  ones that caught a real failure (the trailer check in `verify.ts` did, and
  the Job Record's full-SHA check answers a SHA once retyped 3 characters
  short). The Job Record placement check went with Job Record contract 2: a
  `<job-record>` block that parses cannot hold a misplaced attempt.

## Baseline (contract 5, 2026-09-29)

One run per configuration, Codex CLI 0.158. Tokens are input + output.

| Scenario | Old (contract 4) | New (contract 5) |
|---|---|---|
| mm-agile, setup + 1–7 | 104/104, 4.83M, 1444 s | 100/100, 3.06M, 1105 s |
| mm-jobs, A–E | 82/85, 3.40M, 841 s | 93/93, 2.10M, 697 s |
| mk-agile, setup + 1–7 | 9.53M, 1974 s | 6.61M, 1328 s |
| mk-agile, A–E | 5.47M, 1125 s | 4.76M, 1048 s (iteration 2) |
| mm-local, mm-jobs-ignored, direct | — | 97/97, 68/68, 126/127 |
