# Writing rules for these skills

These skills aim for Matt Pocock–level simplicity (`matt_submodule/skills` is the
style reference). They grew to three times that size once, mostly as procedure
and guards around one choice, and every later reader paid for it in tokens and
in agents following a recipe instead of the outcome. These rules keep them small.

## State interfaces, not procedures

Be **exact** only about three things, because a program or another skill
depends on them:

1. **Formats something else parses.** prompt-kanban reads the Issue JSON
   fields, the three statuses, `comments[{author, body}]`, the
   `kanban-brief:` marker, `issues/archive/`, the plan's `## Job Record
   <jobId>` section and its `kanban-commit <jobId> <key>: <sha>` and
   `Superseded commit …` lines. Other skills read the comment-record labels,
   the kanban-jobs entry skeletons, commit subjects, the `Issue:`/`Spec:`
   trailers (final review finds the change by its `Issue:` trailer) and the ADR
   frontmatter. Change one and something downstream silently stops finding it.
2. **What counts as done.** Who sets each status; only a COMPLETE phase 2 sets
   `done-final-review`; every review commits its record; a recorded SHA is the
   commit this session made. The board's columns are derived from these, so a
   vague done rule is a card in the wrong column.
3. **Hard limits.** Current branch only; only your own paths, the user's staged
   work stays staged and out; never amend, rebase, reset, push, force-add or
   untrack; no empty commit except the local-mode review marker; no attribution
   trailers. Each protects the user's repo or a SHA already recorded.

Be **loose** about everything else. State the outcome and why it matters, and
let the agent choose the Git and shell steps: Claude and Codex may take
different routes to the same exactly-defined result, and a recipe written for
one breaks on the other.

## Write every rule with its reason

One clause of *why* per rule ("never amend: the app has already recorded that
SHA, and amending orphans it"). A reason is what lets an agent handle a case the
skill never mentions. No ALL-CAPS MUSTs, and no rule without its purpose.

## Guards and scripts come from evidence

Add a guard only after a real incident, and name the incident beside it. Bundle
a script only when eval transcripts show agents re-deriving the same
deterministic step, or getting it wrong, across runs — never pre-emptively. An
adversarial review imagining a failure is not an incident.

## Progressive disclosure

`SKILL.md` holds the workflow every run needs. What only some runs need goes in
a reference file one level deep, with a line saying when to read it (setup's
`UPGRADE.md`, final-review's `PHASE-1.md`/`PHASE-2.md`, kanban-jobs'
`STEP-A…E.md`). Formats go by example — the JSON issue, the skeletons, the
comment-record examples — because an example is the cheapest exact definition.

## Self-contained skills

A skill gives the same result without prompt-kanban and with only its own
directory installed. No links into another skill's files; name another skill by
its invocation (`/modified-matt-implement`) instead.

## Size budget

prompt-kanban's `tests/unit/domain/skills-size-budget.test.ts` holds a ceiling
per file and per group (`modified-matt`, `makerkit-custom`, `kanban`), and
allows only `*.md` and `agents/openai.yaml` under `skills/`. Raise a ceiling
only in a commit that names the incident the extra text answers.

## Measure every change

A change to a skill runs the harness in `evals/` (from a prompt-kanban checkout,
`npm run skill-evals`) — at least the affected scenario, new against old — and the
size budget, and reports the pass rate and the token delta. A change that costs
tokens needs a result that pays for them. `evals/README.md` holds the loop and the
last baseline.
