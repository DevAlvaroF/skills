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
   `kanban-brief:` marker, `issues/archive/`, the plan's
   `<job-record id="<jobId>">` block and the spec's `<spec-record>` block, and
   their `commits`. Other skills read the comment-record labels, the
   kanban-jobs and Spec Record attempt objects, commit subjects, the
   `Issue:`/`Spec:` trailers (final review finds the change by its `Issue:`
   trailer) and the ADR frontmatter. Change one and something downstream
   silently stops finding it.
2. **What counts as done.** Who sets each status; only a COMPLETE phase 2 sets
   `done-final-review`; a review or triage finishes only once no question is
   open; every review commits its record — 6 and D whatever the verdict, B
   once its questions are answered, the spec review (step 3) once the spec
   passes; in 7 and E every finding ends FIXED, REJECTED or DEFERRED by the
   user's decision, and the agent keeps asking rather than record one
   undecided; INCOMPLETE or BLOCKED is only for approved work that can't be
   finished, once the user agrees — except a commit holding a path that isn't
   the agent's, which stops at once and ends BLOCKED, as a hard limit, not a
   choice; a recorded SHA is the commit this session made. The board's columns
   are derived from these, so a vague done rule is a card in the wrong column.
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
`UPGRADE.md`, final-review's `PHASE-1.md`/`PHASE-2.md`, to-spec's `REVIEW.md`,
kanban-jobs' `STEP-A…E.md`). Formats go by example — the JSON issue, the Job
Record and Spec Record blocks and their attempt objects, the comment-record
examples — because an example is the cheapest exact definition.

## Self-contained skills

A skill gives the same result without prompt-kanban and with only its own
directory installed. No links into another skill's files; name another skill by
its invocation (`/modified-matt-implement`) instead.

## Size budget

prompt-kanban's `tests/unit/domain/skills-size-budget.test.ts` holds a ceiling
per file and per group (`modified-matt`, `makerkit-custom`, `kanban`), and
allows only `*.md` and `agents/openai.yaml` under `skills/`. Raise a ceiling
only in a commit that names the incident the extra text answers. Splitting text
into a new file moves its bytes, it doesn't earn a ceiling: the group still
pays for them.

## Measure a change by what it can move

Every change passes the size budget, `skill-check`, `npm run typecheck` and
`npm test`: they are cheap and deterministic. The harness in `evals/` (from a
prompt-kanban checkout, `npm run skill-evals`) runs only as far as a change can
move a graded result; `evals/README.md` holds the loop and the baseline.

- **Wording or procedure only:** no evals, because the checks grade formats,
  done rules and hard limits, never wording.
- **A parsed format, done rule, hard limit or verbatim command:** its seeded
  single-step scenario(s), new skills only, one run, against the README
  baseline. The checks grade formats, so they are stable and one run is
  evidence; re-run a failure once to tell a flake from a bug.
- **A contract bump or a release:** one full chain per affected group, new
  only, one run, because the chain is where steps hand each other the record.
- **Old against new** only when a change claims to save tokens, since tokens
  vary about 60% from run to run. Report a token delta only beyond ~50%;
  otherwise say "no measurable change".

After touching `kanban-jobs` or `to-spec`, or to check a plan or a spec an
agent wrote, run `npm run -s skill-check [plan.md… spec.md…]` from the
prompt-kanban checkout. It lives in `evals/`, never under `skills/`, so it is
not installed with the skills.
