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
