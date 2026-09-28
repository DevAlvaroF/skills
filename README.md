# skills

Custom skills for Claude Code and Codex, installed per project with
[`npx skills`](https://github.com/vercel-labs/skills).

The repo ships two flavours of the same eight skills. **Install one per
project, never both.**

| Flavour | Use it for |
|---|---|
| **Makerkit Custom Skills** (`makerkit-custom-*`) | [Makerkit](https://makerkit.dev) repos — knows its `AGENTS.md` layout, RLS and `.mdoc` docs; keeps the glossary and scoped, binding ADRs under `.mysdd/docs/`, out of the always-loaded `AGENTS.md` |
| **Modified Matt Skills** (`modified-matt-*`) | Any other repo — root `CONTEXT.md` glossary, scoped and binding ADRs under `.mysdd/docs/adr/` |

A third group, **Prompt-kanban companion**, holds one flavour-neutral skill,
`kanban-jobs`, installed *alongside* whichever flavour you use — see below.

---

## For users

### Install

In a **plain terminal** (not inside Claude Code or Codex — the CLI detects
the agent and skips the menu), from your project:

```bash
npx skills@latest add devalvarof/skills
```

Then, in the menu:

1. **Skills** — highlight *one* flavour's heading and press space. Don't use
   *Select All*; that takes both flavours. Using prompt-kanban's Simple
   board? Also tick *Prompt-kanban companion*.
2. **Agents** — Claude Code (preselected), plus Codex if you use it.
3. **Method** — `Symlink`.
4. **Scope** — `Project`.

Commit what it wrote (`.agents/skills/`, `.claude/skills/`,
`skills-lock.json`) and restart your agents.

Finally, run the setup skill once in the project —
`/modified-matt-setup-skills` or `/makerkit-custom-setup-skills` (in Codex,
`$` instead of `/`). The other skills depend on the files it writes.

### With prompt-kanban's Simple board, also install `kanban-jobs`

The Simple board's Job prompts (steps B–E) name `kanban-jobs` and read it
before writing anything: the skill owns how each step records its attempt in
the plan's Job Record and commits it, and the prompts stop if it is missing
or states another contract version. Install it the same way, ticking the
*Prompt-kanban companion* group, or directly:

```bash
npx skills@latest add https://github.com/DevAlvaroF/skills/tree/main/skills/kanban --skill kanban-jobs
```

It works without prompt-kanban too: `/kanban-jobs` (`$kanban-jobs` in Codex)
runs one step of the plan → review → code → review → fix cycle on a plan you
name, asking for whatever a prompt would have handed it.

### Update

```bash
npx skills@latest update -p
```

Commit the changes and restart your agents.

### Remove or switch flavour

```bash
npx skills remove
```

Tick what to drop in the menu. To switch flavours, remove everything, then
install the other one.

### Gotchas

- Agents load skills at startup — restart after any install or update.
- Don't add `-y`, `-s` or `--all` to `add`: they skip the menu and install
  both flavours.
- Don't also install the same skills globally, or `mattpocock/skills` in the
  same project — the agent will see every skill twice.

### Where work lives (both flavours)

- Each feature is a directory, `.mysdd/features/<NN>-<feature-slug>/`, holding
  its `spec.md` and one JSON file per issue under `issues/`. The agent
  creates `.mysdd/features/` with the first feature. The tracker schema,
  `.mysdd/issue-tracker.md`, and the docs under `.mysdd/docs/` sit beside
  it, not inside it.
- The tracker, `.mysdd/docs/` and the board file `.mysdd/kanban-boards.json`
  are always committed, never gitignored.
- Feature files are either all committed or all local. To keep them local,
  ignore the whole root with the one rule `.mysdd/features/`; the skills
  then write specs and issues but never stage them, skip the `SPEC:` and
  `Closed Issue:` bookkeeping commits for them, and still name their paths
  in `Issue:` / `Spec:` trailers. The one exception is the final review's
  `REVIEW HISTORY:` record: in local mode it becomes an isolated empty
  marker commit, so the review still shows in history without its text.
- Anything in between — a rule on one feature or its issues, a broad
  `.mysdd/` rule, a tracked file under an ignore rule — stops the skills
  until you resolve it. Setup reports each rule by file and line and can
  replace an overbroad rule in a committed `.gitignore` with
  `.mysdd/features/`, then re-checks the result. It never edits
  `.git/info/exclude` or a global excludes file, and no skill force-adds
  or untracks a file.

### Where decisions live (both flavours)

- Decisions go one per file in `.mysdd/docs/adr/`, created the first time
  one is needed. Each ADR's `scope` frontmatter lists the paths it binds
  (none = the whole repo), so a skill reads only the ADRs covering what it
  touches. `.mysdd/docs/agents/domain.md`, written by setup, holds the
  reading rules.
- No term or decision goes in `CLAUDE.md` / `AGENTS.md`: they load into
  every session, so every entry there would be a permanent context cost.
- The docs stand alone: they never point at an issue, a user story, a spec
  or a feature directory, which get deleted while the docs stay.
- `.mysdd/docs/` is never gitignored, even when feature files are local.
- Decisions are binding. Every skill stops to ask rather than contradict
  one; the final reviewer blocks on an unagreed contradiction. An ADR that
  reached the code is superseded, never deleted, and a supersession you
  agreed to outranks the spec, which is never edited.
- The grill writes terms and ADRs; `to-issues` commits them with the spec in
  the `SPEC:` commit (alone, when feature files are local), and retires the
  ones the spec dropped; `implement` and `final-review` commit a
  supersession with the code that needed it.

**Modified Matt:** the glossary stays at the repo root — `CONTEXT.md`, or
`CONTEXT-MAP.md` plus one `CONTEXT.md` per context. ADRs written before
`scope` existed still work as repo-wide, reading their `**Status:**` line;
re-run setup to add frontmatter to them.

**Makerkit:** the glossary is `.mysdd/docs/CONTEXT.md`, one for the whole
repo, and `AGENTS.md` keeps conventions only. Upgrading from the version
that kept `## Vocabulary` / `## Decisions` in `AGENTS.md`? Re-run setup: it
offers to move them out.

---

## Workflows

What each step is supposed to do: who runs it, what it reads and writes, and
what it commits. prompt-kanban numbers the steps and hands over the prompts —
on the Agile board steps 1–4 run once per Feature and 5–7 once per Issue; on
the Simple board A–E run once per Job. A step names a *role*, not an agent:
the Feature or Job picks which CLI codes and which reviews. The app ticks the
skills listed below on each step, and refuses to copy a prompt without the
ones marked *required*. Every step also needs your **Mark as complete** there.

### Steps 1–7: a Feature and its Issues

Run once first: setup writes `.mysdd/issue-tracker.md` (the tracker: issue
shape, statuses, record and commit formats) and
`.mysdd/docs/agents/domain.md`, and commits nothing. The gates the steps
share:

- **Tracker contract.** `to-spec`, `to-issues`, `implement` and `final-review`
  stop before writing unless the tracker holds exactly one
  `Tracker contract: 2` line; prompts 6 and 7 check the same line. Missing or
  lower: re-run setup. Higher: update the skills or the app.
- **Status.** `ready-for-agent` → `done-coding-awaiting-final-review` →
  `done-final-review`. Step 4 seeds the first, step 5 sets the second, and
  only a COMPLETE step 7 sets the last. Step 6 never touches `status`.
- **Committed or local.** The tracker's ignore probe runs before every write.
  With the single rule `.mysdd/features/`, specs and issues are written but
  never staged: the `SPEC:` commit carries only glossary and ADR changes
  (none, no commit), there is no `Closed Issue:` commit, and step 6's record
  commit becomes an empty marker (`commit-tree` on `HEAD`'s own tree,
  published by a checked `update-ref`). Any other ignore state stops the
  skill.
- **Review scope.** Step 6 reviews exactly the change: `codeCommit` plus every
  later commit whose `Issue:` trailer names the issue, minus bookkeeping
  commits. A loaded review skill gets those SHAs, never its default diff.
- **Approval.** Step 7 changes no code until you reply approving its triage.
  Copying the prompt or marking the step is not approval; a review with zero
  findings has nothing to approve.

| Step | Run by | Skills (app) | Reads | Writes | Commits |
|---|---|---|---|---|---|
| **1 Grill** | coder, auto mode | `grill-with-docs` (required, editable in Settings); it loads `domain-modeling` | glossary, ADRs scoped to the touched paths | glossary terms and ADRs as they settle, one question round at a time | nothing — step 4 commits them |
| **2 PRD Spec** | coder, **same session** as 1 | `to-spec` (warns if missing) | the grill conversation, tracker | `.mysdd/features/<NN>-<slug>/spec.md`: `US-NNN` stories, test boundaries you confirmed, a redacted Decision log; you bind it in the app | nothing |
| **3 Review PRD Spec** | reviewer, fresh session | `reviewer` (warns if missing), `to-spec` | `spec.md` | edits `spec.md` in place; never cuts User Stories or renumbers an ID | nothing |
| **4 Spec to Issues** | coder, fresh session | `to-issues` | spec, existing issues (reconciled by `slug`, never regenerated) | one issue JSON per vertical slice: `ready-for-agent`, `blockedBy`, `testBoundaries`, `covers`, commit fields `null`; after your approval, ADRs for the spec's standing decisions | `SPEC: <subject>`, no trailers — spec, issues, glossary, ADRs |
| **5 Implement** | coder, auto mode | `implement`, `tdd` | issue, its spec when `spec` isn't `null`, ADRs | code, its own two-axis review (`REVIEW.md`); then the issue: criteria ticked, `done-coding-awaiting-final-review`, `codeCommit`, an implementation record with `Deviations and tradeoffs:` | `CODE: <subject>` + `Issue:`/`Spec:` trailers — code and agreed ADRs only; the issue file stays uncommitted |
| **6 Final Review** (phase 1) | reviewer, fresh session | `reviewer`, `final-review` (required) | issue, the change's commits, spec, ADRs, implementation record | phase 1 record in `comments`: attempt, `Reviewed commits`, `Verdict: PASS` or `NEEDS FIXES`, every finding numbered `BLOCKING`/`SUGGESTION`; then `reviewHistoryCommit`, left uncommitted. Fixes nothing | `REVIEW HISTORY: Record final review attempt <N>` + `Issue:` — the whole issue file (local: empty marker) |
| **7 Fix Findings** (phase 2) | coder, fresh session, plan mode | `final-review` (required), `tdd` | latest phase 1 record, implementation record, earlier phase 2 records answering it | FIX / REJECT / DEFER per finding → your approval → fixes, checks; phase 2 record (`Outcome`, `Verdicts`, `Checks`, `Fix commit`, `Attempt plans`); `reviewCodeCommit`; `done-final-review` only on COMPLETE | `CODE REVIEW FIXES: <subject>` if code changed; `ATTEMPT PLANS: final review <issue path> attempt <K>` for plans it created; on COMPLETE, `Closed Issue: <issue path>` (issue + board file; none in local mode) |

Step 7 always runs, even after a PASS with zero findings: the checks still
have to pass, and only phase 2 closes an Issue. On the Agile board the card
reaches Done once the file says `done-final-review` and steps 5–7 are marked.

**Without prompt-kanban**, invoke the skills in the same order:
`/modified-matt-grill-with-docs`, then `/modified-matt-to-spec` in that
session, `/modified-matt-to-issues`, `/modified-matt-implement`, and
`/modified-matt-final-review` — phase 1 unless you name phase 2, which you run
in a fresh coder session. Step 3 is the app's prompt around your review skill;
by hand, ask any reviewer to edit `spec.md` in place.

### Where Makerkit differs

Same steps, gates and commits under `makerkit-custom-*`, except:

- **Glossary** is `.mysdd/docs/CONTEXT.md`, one for the repo, not a root
  `CONTEXT.md` or `CONTEXT-MAP.md`; the `SPEC:` commit carries that file.
- **Grounding.** Grill, to-spec, to-issues and implement read every
  `AGENTS.md` from the root down to each touched directory — its `## Skills`
  and any verification it adds included — plus the README of each app or
  package involved, and follow the repo where it differs. Final-review and tdd
  read the same `AGENTS.md` chain.
- **Makerkit docs** (`docs/`, 150+ `.mdoc` files) are asked of a sub-agent,
  never walked in context, and are never searched for a spec.
- **Checks.** Step 5 and step 7 run root `AGENTS.md` § Verification in its
  order, plus what nested files add, whole-repo runs through a sub-agent, and
  say which list they actually ran.
- **Reviews.** Step 5's `REVIEW.md` always runs the spec axis; standards
  belong to the `/reviewer` that § Verification names. Its Standards fallback
  (the smell baseline) runs only when no general review skill is named or
  installed, or only a specialist one like `/rls-review`. Step 6 reviews
  with whichever of the repo's `/reviewer`, `/rls-review` and the like is
  loaded.
- **Slicing.** A slice crossing migration, policy, types, action, page and
  tests is still one slice; a shared migration or RLS policy is done before
  work is split across sub-agents.

### Steps A–E: a Job (`kanban-jobs`)

Flavour-neutral, installed beside either flavour. B–E require `kanban-jobs`,
and their prompts stop unless its `SKILL.md` states `Job Record contract: 1`
(the skill stops too on a prompt naming another number). Step E, like 7,
changes no code before you approve its triage, and always runs. Step D
reviews every code commit the plan records for this Job, live or superseded —
never `HEAD` or a range.

| Step | Run by | Skills (app) | Reads | Writes | Commits |
|---|---|---|---|---|---|
| **A Generate Plan** | coder, fresh session, plan mode | none | the Job's title and description | a plan under `.claude/plans` ending with an empty `## Job Record <jobId>`; you bind it in the app | nothing |
| **B Review Plan** | reviewer, fresh session | `reviewer`, `kanban-jobs` (required) | the plan, the code as it stands | edits the plan in place, open questions under `Open questions` above the record; entry `### Step B, attempt <N>` (Changes, Open questions), then its `plan-review` line | `REVIEW HISTORY: Record step B attempt <N>` — the plan alone (ignored plan: empty marker) |
| **C Code** | coder, fresh session | `tdd`, `kanban-jobs` (required) | the plan and its answered questions | code, checks, self-review; entry (`Outcome`, Deviations and tradeoffs) and a `code` line when it committed | `CODE: <subject>` — code only, and only when COMPLETE; never the plan |
| **D Review Code** | reviewer, fresh session | `reviewer`, `kanban-jobs` (required) | the Job's recorded code commits, the plan | no source change; entry (`Reviewed commits`, `Verdict`, numbered Findings), then its `code-review` line | `REVIEW HISTORY: Record step D attempt <N>` — the plan, whatever the verdict (ignored: marker) |
| **E Fix Findings** | coder, fresh session, plan mode | `tdd`, `kanban-jobs` (required) | latest D entry's findings, latest C entry's deviations | FIX / REJECT / DEFER → your approval → fixes, checks; entry (`Outcome`, `Attempt plans`, Verdicts) and a `code-fix` line when it committed | `CODE REVIEW FIXES: <subject>` if COMPLETE with code; `ATTEMPT PLANS: step E <jobId> attempt <N>` for plans it created; `JOB HISTORY: Record step E attempt <N>` — the plan, every outcome (ignored: none, no marker) |

**The Job Record.** Each Job owns one section of its plan, opened by the
column-zero heading `## Job Record <jobId>` and running to the next level-one
or level-two heading. Every attempt appends one entry,
`### Step <X>, attempt <N>`, ending in a `#### CLI summary`; earlier entries
are never edited, so a correction is a new attempt. B–E each own one
recording line, `kanban-commit <jobId> <key>: <full SHA>`, keyed
`plan-review`, `code`, `code-review` or `code-fix`. Writing one turns every
earlier line for that key into `Superseded commit <jobId> <key>: <old SHA>`,
so one stays live. Code steps add theirs after the code commit; review steps
commit the entry first and then record that commit's SHA, left uncommitted.
The app reads these lines to select each step's commit; marking E moves the
Job to Done.

**Without prompt-kanban**, `/kanban-jobs` (`$kanban-jobs` in Codex) runs any
step on a plan you name: it proposes the next step from the record, asks for
what a prompt would have handed it, and follows `STEP-A.md` for a plan written
by hand.

---

## For developers

### Layout

```
.claude-plugin/marketplace.json   # defines the picker's three groups — generated
scripts/gen-marketplace.mjs       # regenerates it
skills/
  makerkit-custom/<skill>/        # SKILL.md, optional references/ and agents/openai.yaml
  modified-matt/<skill>/
  kanban/kanban-jobs/             # the flavour-neutral Job procedure: SKILL.md and STEP-A…E.md
matt_submodule/skills             # upstream mattpocock/skills, for reference
```

### Changing a skill

1. Edit the skill under `skills/<flavour>/`.
2. If you added, removed or renamed a skill, run
   `node scripts/gen-marketplace.mjs` — otherwise it shows up under "Other"
   in the picker.
3. Commit and push. Projects only see changes after the push, when they run
   `npx skills@latest update -p`.

### Rules of thumb

- **The flavours are independent copies, not mirrors.** Port a fix to the
  other flavour only if it's about generic skill mechanics; Makerkit-specific
  fixes usually don't apply to `modified-matt`, and vice versa.
- Keep the flavour prefix on every flavour skill's name; `kanban-jobs` belongs
  to no flavour.
- `description` is all the agent sees before loading a skill — write it as
  trigger conditions ("Use when…"), not a summary.
- Keep `SKILL.md` short (well under 500 lines) and put detail in reference
  files linked one level deep from it. State each rule once and point at it
  rather than copying it into every skill.
- Stick to frontmatter keys both agents understand: `name`, `description`,
  `license`, `allowed-tools`, `metadata`.

### Making a skill user-invoked only

Each agent needs its own switch — keep them in sync:

- **Claude Code:** `disable-model-invocation: true` in `SKILL.md` frontmatter.
- **Codex:** `agents/openai.yaml` beside `SKILL.md`:

  ```yaml
  interface:
    display_name: "Human Readable Name"
    short_description: "One line"
  policy:
    allow_implicit_invocation: false
  ```

Currently user-invoked: `grill-with-docs`, `implement`, `final-review`,
`setup-skills`, `to-spec`, `to-issues`, and `kanban-jobs`. Model-invoked:
`domain-modeling`, `tdd`.

---

## Attribution

The `modified-matt-*` skills and `makerkit-custom-setup-skills` are adapted
from [mattpocock/skills](https://github.com/mattpocock/skills) (MIT).
