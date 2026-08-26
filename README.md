# agent-skills-makerkit

Custom skills for Claude Code and Codex, installed per project with
[`npx skills`](https://github.com/vercel-labs/skills).

Skill names are prefixed `makerkit-alvaro-*` so they can coexist with
bundled and third-party skills of the same origin (`triage`, `implement`,
`tdd` and friends all exist upstream under bare names).

## Layout

```
skills/
  <skill-name>/
    SKILL.md            # required
    references/         # optional, loaded on demand
    agents/openai.yaml  # optional, Codex-only metadata and policy
```

## Installing into a project

Both agents in one command. `-a claude-code codex` targets exactly those
two; `-s '*'` takes every skill; `-y` skips the prompts.

```bash
cd /path/to/your-project
npx skills add DevAlvaroF/agent-skills-makerkit -a claude-code codex -s '*' -y
```

Install only what that project needs instead of everything:

```bash
npx skills add DevAlvaroF/agent-skills-makerkit -a claude-code codex \
  -s makerkit-alvaro-matt-tdd makerkit-alvaro-matt-implement
```

This writes into the project:

```
.agents/skills/<name>/     real files; Codex reads this directory natively
.claude/skills/<name>   -> ../../.agents/skills/<name>   (relative symlink)
skills-lock.json           source + content hash per installed skill
```

**Commit all three.** Git stores the symlink correctly (mode `120000`) and
the path is relative, so a fresh `git clone` gives a working setup for both
agents with no install step.

Do *not* gitignore the skill directories and rely on
`npx skills experimental_install` to restore them. That command rebuilds
`.agents/skills/` but does not recreate the `.claude/skills/` symlink, so
Codex keeps working while Claude silently sees nothing.

Then restart Claude Code and Codex: both read skills at session start.

### Check what landed

```bash
npx skills list                       # everything, both scopes
npx skills ls -a claude-code          # what Claude sees
npx skills ls -a codex                # what Codex sees
```

If Claude's list is empty but Codex's isn't, the `.claude/skills/` symlink
is missing or broken. Re-run `add`.

## Using them

Same files, different invocation syntax per agent:

| | Claude Code | Codex |
|---|---|---|
| Invoke by name | `/makerkit-alvaro-matt-tdd` | `$makerkit-alvaro-matt-tdd` |
| Fires on its own | unless `disable-model-invocation: true` | unless `allow_implicit_invocation: false` |

Run `/makerkit-alvaro-setup-matt-pocock-skills` once per project before
using the rest. It writes `agents-docs/{issue-tracker,triage-labels,project-docs}.md`
and an `## Agent skills` block in the project's root `AGENTS.md` (or
`CLAUDE.md` if that's the real document), which the other skills read.

**User-invoked only** (you have to ask for them by name):
`grill-me`, `grill-with-docs`, `handoff`, `implement`,
`improve-codebase-architecture`, `setup-matt-pocock-skills`, `to-spec`,
`to-tickets`, `triage`, `wayfinder`

**Model-invoked** (the agent may reach for them on its own):
`code-review`, `codebase-design`, `diagnosing-bugs`, `domain-modeling`,
`grilling`, `prototype`, `research`, `resolving-merge-conflicts`, `tdd`

(all with the `makerkit-alvaro-matt-` / `makerkit-alvaro-` prefix)

## Updating

### This repo, after you edit a skill

```bash
git add -A && git commit -m "..." && git push
```

Nothing reaches a consuming project until it's pushed. `npx skills update`
fetches from GitHub, not from your working copy.

### A project, after this repo changes

```bash
cd /path/to/your-project
npx skills update -p -y
git commit -am "Update agent skills"
```

`-p` limits it to project-scoped skills, `-y` skips prompts. It re-fetches
from GitHub and updates every skill in `skills-lock.json`, both agents at
once; name one to narrow it:

```bash
npx skills update -p -y makerkit-alvaro-matt-tdd
```

Restart both agents afterwards.

### Every project at once

Updates are per project. To sweep every project that has skills installed,
add this to your shell profile:

```bash
skills-refresh() {
  for d in ~/Coding/*/skills-lock.json; do
    (cd "${d%/skills-lock.json}" && echo "-> $PWD" && npx skills update -p -y)
  done
}
```

### Removing

```bash
npx skills remove makerkit-alvaro-matt-tdd          # one skill, both agents
npx skills remove -s '*' -a claude-code codex -y    # all of them
```

## Writing a skill

- `description` is the only text an agent sees before deciding whether to
  load the skill. Write it as trigger conditions ("Use when..."), not as a
  summary.
- Frontmatter keys understood by both agents: `name`, `description`,
  `license`, `allowed-tools`, `metadata`. Stick to these unless you have a
  reason; unrecognised keys are at best ignored and at worst rejected.
- Skill names share one namespace with bundled and third-party skills.
  Keep the `makerkit-alvaro-` prefix.
- Keep `SKILL.md` short; push detail into `references/` so it loads only
  when needed.

### User-invoked only

To stop a skill from firing on its own, you have to say it twice, once per
agent. They read different files and neither honours the other's:

- Claude Code: `disable-model-invocation: true` in `SKILL.md` frontmatter.
- Codex: `policy.allow_implicit_invocation: false` in
  `<skill-name>/agents/openai.yaml`. Codex ignores
  `disable-model-invocation` entirely, so without this file the skill stays
  model-invocable there.

```yaml
# skills/<skill-name>/agents/openai.yaml
interface:
  display_name: "Human Readable Name"   # shown in Codex's skill picker
  short_description: "One line"
policy:
  allow_implicit_invocation: false
```

Keep the two in sync: a skill is user-invoked in both agents or neither.
`agents/openai.yaml` is inert for Claude Code, so it costs nothing to ship.
Skills that are fine to trigger automatically need neither.

## Gotchas

- Skills are loaded at session start. Restart Claude or Codex after
  installing or updating.
- Don't install the same skills globally (`-g`) as well, or both agents
  will see every skill twice.
- Do not use `--all`. It is shorthand for `--skill '*' --agent '*'`, and the
  `--agent '*'` part silently overrides `-a claude-code codex`, installing
  into every agent the CLI knows about and littering the project with
  directories like `agent/skills/`. Use `-s '*' -y` instead.
- Don't also install `mattpocock/skills` into the same project. These are
  adapted copies of those skills; you'd get both sets.

## Attribution

The `makerkit-alvaro-matt-*` skills and
`makerkit-alvaro-setup-matt-pocock-skills` are adapted from
[mattpocock/skills](https://github.com/mattpocock/skills) (MIT).
