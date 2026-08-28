# skills

Custom skills for Claude Code and Codex, installed per project with
[`npx skills`](https://github.com/vercel-labs/skills).

```bash
cd /path/to/your-project
npx skills@latest add devalvarof/skills
```

That's the whole install. The CLI clones the repo, shows a picker, and writes
the skills you tick into the project.

The repo ships **three groups**. Two of them are full flavours of the same
engineering skill set — **install one or the other, never both**: a project
that installed both would offer the agent two copies of every skill. The third
is a small standalone group that sits happily alongside either.

**The two flavours are siblings, not mirrors.** `makerkit-custom` is adapted for
the specific architecture of the [makerkit.dev](https://makerkit.dev) SaaS
boilerplate — a highly opinionated stack (multi-tenant account model,
RLS-as-authorization, a distribution of `AGENTS.md` files instead of one doc,
Next.js Cache Components, adapter-pattern packages). `modified-matt` is
adapted for the same author's style but for repos that aren't Makerkit-based,
with no equivalent architecture assumed. Because they encode different
opinions about the underlying codebase, their content is expected to diverge,
not just their names — a fix, heuristic, or piece of embedded knowledge that's
correct for one flavour may not apply, or even make sense, for the other.
Don't assume parity between them; check what each actually contains.

| Group in the picker | Directory | Prefix | Skills | For |
|---|---|---|---|---|
| **Makerkit Custom Skills** | `skills/makerkit-custom/` | `makerkit-custom-*` | 7 | Makerkit repos; the skills know about `docs/` `.mdoc` files, the fork/upstream remote pair, and the monorepo `AGENTS.md` layout |
| **Modified Matt Skills** | `skills/modified-matt/` | `modified-matt-*` | 10 | Every other repo. Agent-written config goes in `.myprds/docs/agents/`, with ADRs in `.myprds/docs/adr/` |
| **Alvaro Skills** | `skills/alvaro/` | `alvaro-*` | 1 | Standalone extras, not part of the Matt Pocock set; safe next to either flavour |

Directory and prefix match in all three groups: `skills/<group>/` holds skills
prefixed `<group>-`. The directory name is what the scoped install URL wants;
the prefix is what you type to invoke a skill.

Names are prefixed either way so they can coexist with bundled and
third-party skills of the same origin (`implement`, `tdd` and
friends all exist upstream under bare names).

## Installing

### The menu

```bash
cd /path/to/your-project
npx skills@latest add devalvarof/skills
```

Four prompts, in order:

1. **Select skills.** All three groups are drawn as collapsible headings —
   move to **Makerkit Custom Skills** or **Modified Matt Skills** and hit space to
   take that whole flavour in one keystroke. Don't tick *Select All*: that's
   all 20 skills across all three groups, including both flavours at once.
2. **Which agents.** `Claude Code` is preselected. Add `Codex` if you use it.
   The Universal target (`.agents/skills`) is always included.
3. **Installation method.** Pick `Symlink` (Recommended). `Copy to all agents`
   is still available; see the note below before choosing it.
4. **Installation scope.** `Project` — committed with the repo, which is the
   point.

Two things silently skip the menu, so run this in a plain terminal:

- Running it from inside a Claude Code or Codex session. The CLI detects the
  agent and installs everything non-interactively.
- Passing `-s`/`--skill`, `-y`/`--yes`, or `--all`. Any of them takes all 20
  skills across all three groups with no prompt.

### Symlink or copy

Use the recommended symlink mode: the skill files live once under
`.agents/skills/`, and `.claude/skills/<name>` points to the same files. It
keeps both agents in sync and lets `npx skills update` handle later updates.

`Copy to all agents` writes independent real files into both trees. It can be
useful when symlinks do not survive the target platform or checkout, but
updating is harder: re-run `add` with `--copy` instead of using `update`, or
the copied Claude skill may be replaced by a symlink.

### What lands in the project

```
.agents/skills/<name>/     real files; Codex reads this directory natively
.claude/skills/<name>      symlink to the same skill under .agents/skills/
skills-lock.json           source + content hash per installed skill
```

**Commit all three.** Do *not* gitignore the skill directories and rely on
`npx skills experimental_install` to restore them — that command rebuilds
`.agents/skills/` only, so Codex keeps working while Claude silently sees
nothing.

Then restart Claude Code and Codex: both read skills at session start.

### Skipping the menu

For scripts and CI, scope to one group with a `tree/main/skills/<group>` URL.
`-a` targets those two agents, `-s '*'` takes every skill *in that group*,
and `-y` skips the prompts. Without `--copy`, the CLI uses symlinks:

```bash
# Makerkit repo
npx skills@latest add https://github.com/DevAlvaroF/skills/tree/main/skills/makerkit-custom \
  -a claude-code codex -s '*' -y

# any other repo
npx skills@latest add https://github.com/DevAlvaroF/skills/tree/main/skills/modified-matt \
  -a claude-code codex -s '*' -y

# the standalone extras, alongside either of the above
npx skills@latest add https://github.com/DevAlvaroF/skills/tree/main/skills/alvaro \
  -a claude-code codex -s '*' -y
```

**Never combine the bare `devalvarof/skills` name with `-s '*'` or `-y`.**
That walks into all three groups and installs all 20 skills. Either prompt (no
`-s`, no `-y`) or scope with the `tree/main/skills/<group>` URL.

Named subsets work too:

```bash
npx skills@latest add https://github.com/DevAlvaroF/skills/tree/main/skills/makerkit-custom \
  -a claude-code codex -s makerkit-custom-tdd makerkit-custom-implement
```

### Check what landed

```bash
npx skills list                       # everything, both scopes
npx skills ls -a claude-code          # what Claude sees
npx skills ls -a codex                # what Codex sees
```

If Claude's list is empty but Codex's isn't, `.claude/skills/` didn't get
written. Re-run `add` and pick `Symlink`.

## Updating

### This repo, after you edit a skill

```bash
git add -A && git commit -m "..." && git push
```

Nothing reaches a consuming project until it's pushed. The CLI fetches from
GitHub, not from your working copy.

### A project, after this repo changes

Run the updater from the consuming project:

```bash
cd /path/to/your-project
npx skills@latest update -p -y
git add -A && git commit -m "Update agent skills"
```

If this reports no tracked skills, reinstall once in symlink mode with the
scoped `add` command above; later updates can use `update` normally.

For a project intentionally installed with `Copy to all agents`, re-run the
scoped `add` command with `--copy` to refresh it. `skills-lock.json` does not
record copy mode, so `update` can replace the copied Claude skill with a
symlink instead of preserving the chosen layout.

Restart both agents afterwards.

### Every project at once

Updates are per project. To sweep every project that has skills installed,
add this to your shell profile:

```bash
skills-refresh() {
  for d in ~/Coding/*/skills-lock.json; do
    # skills-lock.json records a skillPath per skill; the group is in it
    group=$(grep -o '"skillPath": "skills/[a-z-]*' "$d" | head -1 | sed 's|.*skills/||')
    case "$group" in
      makerkit-custom|modified-matt|alvaro) ;;
      *) echo "-- skip ${d%/skills-lock.json} (not from this repo)"; continue ;;
    esac
    (cd "${d%/skills-lock.json}" && echo "-> $PWD ($group)" && \
      npx skills@latest update -p -y)
  done
}
```

Each project keeps the flavour it already had: the group is read back out of
its `skills-lock.json`, and projects holding skills from anywhere else are
skipped. The updater refreshes the installed selection recorded by each
project. Projects that use copy mode still need the scoped `add --copy`
command instead.

## Removing

`remove` has its own picker. Run it with no arguments in the project:

```bash
cd /path/to/your-project
npx skills remove
```

It lists what's installed, you tick what to drop, and it cleans up every
agent directory plus the `skills-lock.json` entries.

By name or in bulk, when you already know what you want:

```bash
npx skills remove makerkit-custom-tdd                 # one skill, all agents
npx skills remove -s '*' -a claude-code codex -y    # every skill, those agents
npx skills remove --all                             # every skill, everywhere (-y implied)
```

Switching a project from one flavour to the other is `remove --all` followed
by a fresh `add`.

## Using them

Same content in both agent trees, different invocation syntax per agent:

| Flavour | Claude Code | Codex |
|---|---|---|
| Makerkit | `/makerkit-custom-tdd` | `$makerkit-custom-tdd` |
| Modified Matt | `/modified-matt-tdd` | `$modified-matt-tdd` |

A skill fires on its own unless `disable-model-invocation: true` (Claude Code)
or `allow_implicit_invocation: false` (Codex).

Run the setup skill once per project before using the rest —
`/makerkit-custom-setup-skills` or `/modified-matt-setup-skills`.
It writes an `## Agent skills` block in the project's root `AGENTS.md` (or
`CLAUDE.md` if that's the real document) plus:

| Flavour | Files written |
|---|---|
| Makerkit | `.myprds/issue-tracker.md` |
| Modified Matt | `.myprds/docs/agents/issue-tracker.md`, `.myprds/docs/agents/domain.md` |

The other skills read those files. Makerkit has no generated project-docs file:
that flavour reads the repo's own `AGENTS.md` distribution — the root file, then
the nearest one to the code in hand — directly.

`issue-tracker.md` documents the issue lifecycle
(`ready-for-agent -> done-coding-awaiting-final-review -> done-final-review`).
No skill in this repo sets `done-final-review` — that's intentional, not a gap:
`implement` is explicitly forbidden from setting it, and the final-review step
is meant to be triggered by an external actor (a human, or a review process
outside these skills) so an issue can't reach "done" without a human actually
looking at it. An issue parked at `done-coding-awaiting-final-review` is
correctly waiting on that human, not stuck.

The two flavours no longer hold the same skill set, so they're listed
separately. Names are unprefixed below; in the picker each carries its group's
prefix (`makerkit-custom-tdd`, `modified-matt-tdd`).

**Makerkit Custom** (7) — user-invoked only: `grill-with-docs`, `implement`,
`setup-skills`, `to-spec`, `to-issues`. Model-invoked:
`domain-modeling`, `tdd`.

**Modified Matt** (10) — user-invoked only: `grill-with-docs`, `implement`,
`improve-codebase-architecture`, `setup-skills`, `to-spec`,
`to-issues`. Model-invoked: `code-review`, `codebase-design`,
`domain-modeling`, `tdd`.

`grill-with-docs` carries the interview itself — it used to delegate to a
separate `grilling` skill, which is now folded into it. It calls
`domain-modeling` alongside the interview so terms and decisions get recorded
as they crystallise.

`code-review`, `codebase-design` and `improve-codebase-architecture` exist only
in **Modified Matt**: the Makerkit flavour defers review to the repo's own
`/reviewer` and `/rls-review` skills instead.

**Alvaro Skills** (1) — `alvaro-adversarial-reviewer`, model-invoked, belongs
to neither flavour's list.

## Layout

```
.claude-plugin/
  marketplace.json        # declares the three groups; generated, see below
scripts/
  gen-marketplace.mjs     # regenerates it from what's on disk
skills/
  <group>/                # makerkit-custom | modified-matt | alvaro
    <prefixed-skill-name>/
      SKILL.md            # required
      references/         # optional, loaded on demand
      agents/openai.yaml  # optional, Codex-only metadata and policy
```

The group directory is not what the picker groups by. `marketplace.json` is:
the CLI reads `plugins[].skills` and tags each skill with the owning plugin
name, then title-cases that name into the heading you see. The directory only
matters for the scoped install URL above.

**Re-run `node scripts/gen-marketplace.mjs` after adding or renaming a
skill.** It rewrites the manifest from the filesystem. A skill missing from
the manifest still installs, but shows up under "Other" instead of its group.

## Writing a skill

- `description` is the only text an agent sees before deciding whether to
  load the skill. Write it as trigger conditions ("Use when..."), not as a
  summary.
- Frontmatter keys understood by both agents: `name`, `description`,
  `license`, `allowed-tools`, `metadata`. Stick to these unless you have a
  reason; unrecognised keys are at best ignored and at worst rejected.
- Skill names share one namespace with bundled and third-party skills.
  Keep the group prefix (`makerkit-custom-`, `modified-matt-`, or `alvaro-`).
- They are independent copies; a fix applied to `skills/makerkit-custom/` does
  not reach `skills/modified-matt/`. Mirror a fix in both only when it's about
  generic skill mechanics (frontmatter, tool usage, process bugs). A fix
  rooted in Makerkit-specific opinions (RLS, the `AGENTS.md` distribution,
  Cache Components, and the like) usually has no equivalent to apply to in
  `modified-matt`, and vice versa — don't reflexively port it over.
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
# skills/<group>/<skill-name>/agents/openai.yaml
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
- Running `npx skills add` from inside an agent session skips the picker and
  installs everything. Use a plain terminal.
- Copy-mode installs are harder to update: refresh them with
  `npx skills add ... --copy -y`; use `npx skills update -p -y` for symlink
  mode.
- Don't install the same skills globally (`-g`) as well, or both agents
  will see every skill twice.
- Do not use `--all` on `add`. It is shorthand for `--skill '*' --agent '*'`,
  and the `--agent '*'` part silently overrides `-a claude-code codex`,
  installing into every agent the CLI knows about and littering the project
  with directories like `agent/skills/`. Use `-s '*' -y` instead.
- Don't also install `mattpocock/skills` into the same project. These are
  adapted copies of those skills; you'd get both sets.
- Don't install both flavours into the same project. Same skills, two
  prefixes; the agent would see every skill twice. **Alvaro Skills** is not a
  flavour and is fine alongside either.
- The group headings in the picker come from `.claude-plugin/marketplace.json`,
  not from the `skills/<group>/` directories. Add a skill without
  regenerating the manifest and it lands under "Other".

## Attribution

The `*-matt-*` skills, plus `makerkit-custom-setup-skills` and
`modified-matt-setup-skills`, are adapted from
[mattpocock/skills](https://github.com/mattpocock/skills) (MIT).
