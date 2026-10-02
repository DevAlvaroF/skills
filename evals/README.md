# evals

Measures these skills end to end: prompt-kanban's own Step prompts, run
through the Codex CLI in disposable repos, checked with prompt-kanban's own
parsers. It exists so a change to a skill is measured — its pass rate, and
tokens and wall time where it claims a saving — rather than argued.

It runs from a **prompt-kanban checkout** holding this repo at
`vendor/skills`: it renders prompts and reads Issues, plans and commits with
the app's code (`@shared/domain`, `@main/services/git-history.service`), so a
check means what the app means. There, `npm run skill-evals` runs `cli.ts`.

## Loop

1. Pick the scenarios the change calls for (`../AGENTS.md`, "Measure a change
   by what it can move"). Only if one runs `old`, snapshot the skills you are
   about to change into the checkout's gitignored
   `.skill-evals/baseline/old_skill/`, and the prompt templates into
   `.skill-evals/baseline/old_prompts.json` (the `prompt --templates old`
   source).
2. For each of those scenarios, and each configuration it names:
   ```bash
   npm run skill-evals -- repo /tmp/pk-e2e/mm-jobs-new --flavour modified-matt --skills new
   npm run skill-evals -- seed-plan /tmp/pk-e2e/mm-jobs-new .claude/plans/word-count.md --job $JOB --at C
   npm run skill-evals -- prompt code --templates new --subject subject.json > prompt.txt
   npm run skill-evals -- step /tmp/pk-e2e/mm-jobs-new $RUN C-code prompt.txt --plan .claude/plans/word-count.md
   npm run skill-evals -- answer /tmp/pk-e2e/mm-jobs-new $RUN C-code "I approve your triage."
   npm run skill-evals -- verify /tmp/pk-e2e/mm-jobs-new $RUN checks.json
   npm run skill-evals -- snapshot /tmp/pk-e2e/mm-jobs-new $RUN .claude/plans
   ```
   with `RUN=.skill-evals/iteration-N/eval-<id>/<new_skill|old_skill>/run-1`.
   A seeded scenario runs its seed after `repo` (see Seeded steps); a chain
   has none. `DRIVER.md` is the brief for an agent driving one scenario.
3. `npm run skill-evals -- aggregate .skill-evals/iteration-N` writes
   `benchmark.json`/`.md` through skill-creator's `aggregate_benchmark`. Its
   delta compares configurations, so with `new` alone it means nothing:
   compare the pass rate with the baseline table below instead.
4. Review with skill-creator's `eval-viewer/generate_review.py` (Python ≥3.10;
   `--static <file>.html` writes a standalone page), and read the Codex
   transcripts (`steps/*/events-*.jsonl`) for wasted turns, not only outcomes.

`step` stages a fresh `SENTINEL.txt` first (skip with `--no-sentinel`): a step
that commits it, or unstages it, swept the user's work. With `--plan <path>` it
also copies the Job's plan, as the step finds it, to
`steps/<label>.plan-before`: the `plan` check's `before`, against which the Job
Record's attempts may only grow. The `plan` check also holds the record to
`job-record-check.ts`, the checker `npm run skill-check` runs (below). `--spec
<path>` does the same for a Feature's spec, as `steps/<label>.spec-before`, for
the `spec` check, which holds the Spec Record to `spec-record-check.ts`. The
`unchanged` check takes `paths` and passes while `git status` shows nothing
under them, staged, unstaged or untracked: a step still asking has changed no
code. Each step's `timing.json` sums the token usage Codex reports per turn;
the run's `timing.json` sums the steps.

## Seeded steps

A seed writes, without a Codex session, the state the step before leaves, so
one step can run alone. `seed.ts` builds it and checks it with the app's
parsers before it prints `<full path> <HEAD>`: plans against `JobRecordSchema`
and `job-record-check.ts`, specs against `spec-record-check.ts`, Issues against
`IssueFileSchema`. A seed the app can't read wastes a whole Codex run, and
`JSON.parse` alone once missed a schema break that hid a card.
prompt-kanban's `tests/unit/evals/seed-states.test.ts` builds every state and
checks that each recorded SHA is a commit holding what its subject says, that
the fixture's `npm test` passes, and that the tree is clean except for what the
step before leaves uncommitted.

| Step | Seed | What it holds |
|---|---|---|
| 3 | `seed-spec … --record empty` | `fixtures/specs/slugify.md` as step 2 leaves it, untracked, with one question open (a length cap) |
| 4 | `seed-feature … --at 4` | `specs/slugify.settled.md` with a finished first review (`seed-spec … recorded`) |
| 5 | `seed-feature … --at 5` | + `fixtures/issues/slugify/` (02 blocked by 01), committed with the spec as `SPEC: …` |
| 6 | `seed-feature … --at 6` | + `CODE: Add slugify` from `fixtures/code/slugify` with `Issue:` and `Spec:` trailers; issue 01 advanced as implement leaves it, uncommitted |
| 7 | `seed-feature … --at 7 --findings none\|some` | + a phase 1 record on issue 01, committed as `REVIEW HISTORY: Record final review attempt 1` and recorded; `some` uses `reviews/slugify.findings.txt` |
| B | `seed-plan … --job <uuid>` (`--at B`, the default) | `fixtures/plans/word-count.md` ending in the empty Job Record, untracked, with one question open |
| C | `seed-plan … --at C` | `plans/word-count.settled.md`, its question answered under Open questions, with a B attempt committed and recorded |
| D | `seed-plan … --at D` | + `CODE: Add wordCount` from `fixtures/code/word-count` and a COMPLETE C attempt |
| E | `seed-plan … --at E --findings none\|some` | + a D attempt committed and recorded: PASS with no findings, or NEEDS FIXES with `reviews/word-count.findings.json` |

`--findings some` holds one real defect planted in the code that its tests miss
(tab- and newline-separated words count as one; an underscore survives into the
slug) and one arguable suggestion, so a triage has one finding to fix and one
the user may reject. Scenarios 19, 23 and 24 approve the triage for finding 1
only, so the step keeps asking and changes nothing, which `unchanged` checks on
`src` and `test`; the `then` answer rejects finding 2, and the step records
COMPLETE with one FIXED and one REJECTED. The `plan` check's
optional `attempts` is the exact count, so a check can tell a step that
recorded from one still asking.
`seed-feature` needs `repo --setup committed|local`; in local mode the Feature
files stay untracked and each review commits the empty marker instead, as the
tracker says.

Steps 0, 1 and A have no seed: they start from nothing but a repo, a Brief or a
Job, and `repo --setup` already writes what comes before them. Step 2 writes the
spec from the grill's conversation, which exists only in that session, so 1 and
2 stay one session.

Per step, new skills, measured inside chains:

| Chain | Per step (tokens) | Chain total |
|---|---|---|
| mm-jobs, c6c | A 0.07M · B 0.79M · C 0.54M · D 0.29M · E 0.23M | 1.92M |
| mm-agile, iteration 1 | setup 0.17M · 1+2 0.76M · 3 0.26M · 4 0.41M · 5 0.79M · 6 0.35M · 7 0.32M | 3.06M |

A seeded step costs about what it costs inside a chain when the seed asks for
the same work (C, D, 4, 5 and 6 below), so targeting one step is 3–10× cheaper
than its chain, while seeding every step and running them all costs about a
chain. A triage seed asks for more: two findings, one of them fixed, over three
resumed turns, so E and 7 cost 4–7× their chain step, which had little or
nothing to triage, though still less than their chain.

Chains stay the release tier: a seed is the app's idea of what the step before
leaves behind, and only a chain tests what that step actually leaves, so a
contract bump or a release still runs one chain per group.

Run `old` on seeded steps only within one contract, because seeds are built
from the current templates and schemas and old fails them by construction
across a bump. Within one contract they are the right way to compare old with
new, because both start from byte-identical input, whereas a chain's B reads
the A output of its own configuration.

First runs (iteration `seeds`, 2026-10-02, new only, Codex CLI 0.159), every
one passing; tokens are input + output:

| Scenario | Passed | Tokens | Seconds |
|---|---|---|---|
| 17 mm-jobs-c | 19/19 | 0.65M | 234 |
| 18 mm-jobs-d | 20/20 | 0.30M | 217 |
| 19 mm-jobs-e-triage, ×3 | 43/43 ×3 | 1.23M / 1.48M / 1.32M | 285 / 260 / 261 |
| 20 mm-agile-4 | 22/22 | 0.33M | 128 |
| 21 mm-agile-5 | 16/16 | 0.62M | 221 |
| 22 mm-agile-6 | 19/19 | 0.38M | 161 |
| 23 mm-agile-7-triage | 33/33 | 1.58M | 197 |
| 24 mk-agile-7-triage | 33/33 | 1.42M | 224 |

Every triage run fixed finding 1 and then asked again about finding 2 rather
than record it, the branch the c6c chain left untested. D and 6 found their
planted defect unprompted; 6 also found one the seed did not plant
(lower-casing first turns `İ` and the Kelvin sign into ASCII letters).

Three runs of one seeded step spread 20% in tokens (1.23M to 1.48M), against
about 60% for a chain, where each step also inherits the previous steps'
variation. So on a seeded step a token delta beyond ~25% is worth reporting;
three runs are a small sample, so widen that again if a seeded step spreads
more.

## The Spec Record scenarios (contract 6)

Scenarios 7–15 in `evals.json` measure step 3's Spec Record and commit. They
start past setup and, except for the steps 1–4 chains, past step 2, so a run
costs one or two Codex sessions:

- `repo … --setup committed|local` writes what setup writes in a fresh repo —
  its tracker and `domain.md` seeds verbatim, from the skills under test so the
  contract matches its readers, plus the one `.mysdd/features/` ignore rule for
  `local` — into the initial commit.
- `seed-spec <repo> <spec path> --record <state> [--brief <id>] [--secret]`
  writes `fixtures/specs/slugify.md` as a scenario starts from it: `none` (a
  spec from before the record), `empty` (as step 2 leaves it), `saved`,
  `committed` or `recorded` (a passing review interrupted after saving its
  attempt, after committing it, or finished), `malformed` or `duplicate`.
  For an ignored spec, `committed` and `recorded` make the empty marker
  instead, as local mode does. `--secret` adds a secret-shaped line,
  uncommitted. The fixture leaves one question open (a length cap) for the
  review to ask.

Their checks are `verify` objects. `spec` reads the record with the app's
`readSpecRecord` and checks its attempts, its live key, its growth against
`before`, whether the SHA edit is still uncommitted (`worktree`) and whether
the recorded commit holds the attempt it made (`committedAttempt`); `history`
checks no commit added a line matching a pattern; `commits` takes `trailers`
too. For one scenario, with `RUN` as above and `S` its spec path:

```bash
npm run skill-evals -- repo /tmp/pk-e2e/mm-spec-local-new --flavour modified-matt --skills new --setup local
npm run skill-evals -- seed-spec /tmp/pk-e2e/mm-spec-local-new $S --record empty --brief <brief id>
npm run skill-evals -- prompt spec-review --templates new --subject subject.json > prompt.txt
npm run skill-evals -- step /tmp/pk-e2e/mm-spec-local-new $RUN 3-spec-review prompt.txt --spec $S
npm run skill-evals -- answer /tmp/pk-e2e/mm-spec-local-new $RUN 3-spec-review "No length cap: …"
npm run skill-evals -- verify /tmp/pk-e2e/mm-spec-local-new $RUN checks.json
```

## The open plan question (scenario 16)

`mm-jobs-b-open` runs step B alone on `seed-plan`'s default, `--at B` (see
Seeded steps). The fixture's Notes leave one question open (does `--` count as
a word?). Its step has `then`, so one session is verified twice: once B stops
with the answer withheld — no commit, no attempt, the question under `Open
questions` above the record — and again after the answer settles it: one `REVIEW HISTORY: Record step B attempt 1` commit holding
the plan alone, `plan-review` recorded, and no attempt carrying `openQuestions`.

## skill-check

`npm run -s skill-check` checks the skills' own statement of the Job Record —
`kanban-jobs` states the contract the app reads, shows exactly
`jobRecordTemplate('<jobId>')`, and each `STEP-<X>.md` example is an attempt
of its step that the schema accepts — and `npm run -s skill-check -- <plan.md>…`
checks any plan an agent wrote: each Job's block reads, every attempt carries
its step's fields and is numbered 1, 2, 3… per step, and every `commits` key
names the latest commit its step's attempts made. It checks the Spec Record the
same way: each flavour's `to-spec/SKILL.md` shows exactly
`specRecordTemplate()` once and links `REVIEW.md`, whose one example is a
first attempt the schema accepts, and no other skill file holds a column-zero
`<spec-record>` line. A file named `spec.md` is checked as a spec: its record
reads, its attempts are numbered 1, 2, 3…, each holds its commit,
`commits["spec-review"]` names the latest, and nothing follows the record. It
exits 1 on any problem.

It is a maintainer tool, not part of a skill: it sits here, outside `skills/`,
so `npx skills` never installs it and an installed skill stays prose-only. The
eval transcripts behind it showed agents writing their own block parser in
every recording step (37 of 452 commands across the contract-2 runs), never
getting one wrong — the evidence for a tool on the maintainer's side, not yet
for bundling one into the skill. It reads blocks with the app's own
`readJobRecord` and `readSpecRecord`, and `kanban-jobs-contract.test.ts` and
`tracker-contract.test.ts` run it, so `npm test` fails wherever it would.

## Rules

- Repos live under `/tmp/pk-e2e/`, never in a real project: Codex runs with
  `danger-full-access`.
- A scenario that clones a real project clones it with `--no-hardlinks` and
  removes the remote; the original is never touched.
- Run what the change calls for, by `../AGENTS.md`'s tiers: new only and one
  run by default, because the checks grade formats and are stable; re-run a
  failure once before calling it a bug. Old against new only for a claimed
  token saving, on seeded steps within one contract (see Seeded steps), since
  tokens vary about 60% run to run: report a delta only beyond ~50%, or ~25%
  on a seeded step (see Seeded steps), else "no measurable change". A new check runs `old` once to prove it discriminates,
  then new only.
- Grade what the skills promise — formats, done rules, hard limits — never
  wording. A check that passes for old and new alike measures nothing; prefer
  ones that caught a real failure (the trailer check in `verify.ts` did, and
  the Job Record's full-SHA check answers a SHA once retyped 3 characters
  short). The Job Record placement check went with Job Record contract 2: a
  `<job-record>` block that parses cannot hold a misplaced attempt.

## Baseline (contract 6, 2026-10-01)

Two runs per configuration, Codex CLI 0.159. Old is contract 5's skills and prompts, which make no
Spec Record, so their record checks fail by construction; 10–15 run new only.

| Scenario | Old (contract 5) | New (contract 6) |
|---|---|---|
| mm-spec, 1–4 | 28/34 ×2, 1.67M / 1.80M, 592 / 627 s | 62/63 ×2, 1.49M / 2.38M, 665 / 891 s |
| mk-spec, 1–4 | 31/36 ×2, 2.13M / 2.31M, 719 / 608 s | 62/63 ×2, 2.07M / 1.55M, 711 / 661 s |
| mm-spec-local, 3 | 6/9 ×2, 0.38M / 0.32M, 292 / 264 s | 24/24 ×2, 1.02M / 1.15M, 450 / 462 s |
| legacy, re-review, open, secret | — | 25/25, 26/26, 15/15, 16/16 (iteration e1b) |
| resume committed / saved | — | 16/16 / 25/25 ×2 (iteration c6b) |
| broken malformed / duplicate | — | 7/7, 7/7 |

The one new miss in mm-spec and mk-spec is a driver's own `paths` list: the `SPEC:` commit also
carried the glossary entry the grill left in `CONTEXT.md`. Secret first scored 15/16: the review
deleted the key unasked instead of naming it, and none reached history. Re-run in iteration e1 on the
trimmed to-spec, it did the same twice, so REVIEW.md now leaves removing it to the user; e1b, one run,
16/16, named the key and its line, stopped, and removed it only once the user answered.
Saved resume first failed 24/25 — the resume rewrote the saved attempt's summary — which is why
REVIEW.md says a resumed attempt keeps its text. Step 3's recording costs tokens the old skill never
spends; in mm-spec-local it is about 3× old's.

After the strict-triage fixes (iteration c6c, one run, new only): mm-spec-local 23/23, resume saved
25/25, mm-jobs A–E 82/82, all within the token noise band. b-open 29/29 new; old, once, 36/41,
failing the first pass by committing with the question open. In that A–E run D found nothing, so E's
triage went unexercised.

Strict triage (iteration e1, one run each, new only): with one finding still undecided, scenarios 19,
23 and 24 change nothing under `src` and `test`, as the new `unchanged` check confirms, then record
COMPLETE. 19: 44/44, 1.41M, 395 s. 23: 34/34, 1.39M, 344 s. 24: 34/34, 1.25M, 237 s.

## Baseline (contract 5, 2026-09-29)

One run per configuration, Codex CLI 0.158. Tokens are input + output.

| Scenario | Old (contract 4) | New (contract 5) |
|---|---|---|
| mm-agile, setup + 1–7 | 104/104, 4.83M, 1444 s | 100/100, 3.06M, 1105 s |
| mm-jobs, A–E | 82/85, 3.40M, 841 s | 93/93, 2.10M, 697 s |
| mk-agile, setup + 1–7 | 9.53M, 1974 s | 6.61M, 1328 s |
| mk-agile, A–E | 5.47M, 1125 s | 4.76M, 1048 s (iteration 2) |
| mm-local, mm-jobs-ignored, direct | — | 97/97, 68/68, 126/127 |
