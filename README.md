# skills

Custom skills for Claude Code and Codex, installed per project with
[`npx skills`](https://github.com/vercel-labs/skills).

```bash
cd /path/to/your-project
npx skills@latest add devalvarof/skills
```

That's the whole install. The CLI clones the repo, shows a picker, and writes
the skills you tick into the project.

The same skill set ships in two flavours, one per group. **Install one or the
other, never both**: they are the same skills under different names, and a
project that installed both would offer the agent two copies of every skill.

| Group in the picker | Prefix | For |
|---|---|---|
| **Makerkit Skills** | `makerkit-*` | Makerkit repos; the skills know about `docs/` `.mdoc` files, the fork/upstream remote pair, and the monorepo `AGENTS.md` layout |
| **Alvaro Skills** | `alvaro-*` | Everything else |

Names are prefixed either way so they can coexist with bundled and
third-party skills of the same origin (`triage`, `implement`, `tdd` and
friends all exist upstream under bare names).

## Installing

### The menu

```bash
cd /path/to/your-project
npx skills@latest add devalvarof/skills
```

Four prompts, in order:

1. **Select skills.** Both groups are drawn as collapsible headings —
   move to **Makerkit Skills** or **Alvaro Skills** and hit space to take
   that whole flavour in one keystroke. Don't tick *Select All*: that's all
   40 skills across both groups.
2. **Which agents.** `Claude Code` is preselected. Add `Codex` if you use it.
   The Universal target (`.agents/skills`) is always included.
3. **Installation method.** Symlink is labelled "Recommended" — **pick
   `Copy to all agents` anyway.** See below.
4. **Installation scope.** `Project` — committed with the repo, which is the
   point.

Two things silently skip the menu, so run this in a plain terminal:

- Running it from inside a Claude Code or Codex session. The CLI detects the
  agent and installs everything non-interactively.
- Passing `-s`/`--skill`, `-y`/`--yes`, or `--all`. Any of them takes all 40
  skills across both groups with no prompt.

### Why "Copy", not "Symlink"

Symlink mode points `.claude/skills/<name>` at `.agents/skills/<name>`. That
works on your machine and breaks for anyone who clones the repo on a platform
or in a checkout where the link doesn't survive. Copy mode writes real files
into both trees, so a fresh `git clone` gives a working setup for both agents
with no install step.

The cost is that the two trees are independent: an edit under
`.claude/skills/` does not reach Codex, and vice versa. Edit skills here in
this repo and reinstall; treat the copies in a consuming project as build
output.

### What lands in the project

```
.agents/skills/<name>/     real files; Codex reads this directory natively
.claude/skills/<name>/     real files; an independent copy, not a link
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
`--copy` gives each agent real files, `-y` skips the prompts:

```bash
# Makerkit repo
npx skills@latest add https://github.com/DevAlvaroF/skills/tree/main/skills/makerkit \
  -a claude-code codex -s '*' --copy -y

# any other repo
npx skills@latest add https://github.com/DevAlvaroF/skills/tree/main/skills/alvaro \
  -a claude-code codex -s '*' --copy -y
```

**Never combine the bare `devalvarof/skills` name with `-s '*'` or `-y`.**
That walks into both groups and installs all 40 skills. Either prompt (no
`-s`, no `-y`) or scope with the `tree/main/skills/<group>` URL.

Named subsets work too:

```bash
npx skills@latest add https://github.com/DevAlvaroF/skills/tree/main/skills/makerkit \
  -a claude-code codex --copy -s makerkit-matt-tdd makerkit-matt-implement
```

### Check what landed

```bash
npx skills list                       # everything, both scopes
npx skills ls -a claude-code          # what Claude sees
npx skills ls -a codex                # what Codex sees
```

If Claude's list is empty but Codex's isn't, `.claude/skills/` didn't get
written. Re-run `add` and pick `Copy to all agents`.

## Updating

### This repo, after you edit a skill

```bash
git add -A && git commit -m "..." && git push
```

Nothing reaches a consuming project until it's pushed. The CLI fetches from
GitHub, not from your working copy.

### A project, after this repo changes

Re-run `add`, don't use `update`:

```bash
cd /path/to/your-project
npx skills@latest add https://github.com/DevAlvaroF/skills/tree/main/skills/<group> \
  -a claude-code codex -s '*' --copy -y
git commit -am "Update agent skills"
```

`npx skills update` looks like the right command here, but it is not.
`skills-lock.json` does not record that you installed with copy mode, so
update re-runs `add ... -y` without `--copy` and **replaces
`.claude/skills/<name>` with a symlink**, silently undoing it. (Verified
against `skills@1.5.23`.) Re-running `add --copy` refreshes the content and
keeps both trees as real files.

Restart both agents afterwards.

### Every project at once

Updates are per project. To sweep every project that has skills installed,
add this to your shell profile:

```bash
skills-refresh() {
  local base=https://github.com/DevAlvaroF/skills/tree/main/skills
  for d in ~/Coding/*/skills-lock.json; do
    # skills-lock.json records a skillPath per skill; the group is in it
    group=$(grep -o '"skillPath": "skills/[a-z]*' "$d" | head -1 | sed 's|.*skills/||')
    case "$group" in
      makerkit|alvaro) ;;
      *) echo "-- skip ${d%/skills-lock.json} (not from this repo)"; continue ;;
    esac
    (cd "${d%/skills-lock.json}" && echo "-> $PWD ($group)" && \
      npx skills@latest add "$base/$group" -a claude-code codex -s '*' --copy -y)
  done
}
```

Each project keeps the flavour it already had: the group is read back out of
its `skills-lock.json`, and projects holding skills from anywhere else are
skipped. This reinstalls every skill in that group. If some projects are meant
to have only a subset, refresh those by hand instead.

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
npx skills remove makerkit-matt-tdd                 # one skill, all agents
npx skills remove -s '*' -a claude-code codex -y    # every skill, those agents
npx skills remove --all                             # every skill, everywhere (-y implied)
```

Switching a project from one flavour to the other is `remove --all` followed
by a fresh `add`.

## Using them

Same content in both agent trees, different invocation syntax per agent.
`<group>` is whichever flavour you installed, `makerkit` or `alvaro`:

| | Claude Code | Codex |
|---|---|---|
| Invoke by name | `/<group>-matt-tdd` | `$<group>-matt-tdd` |
| Fires on its own | unless `disable-model-invocation: true` | unless `allow_implicit_invocation: false` |

Run `/<group>-setup-matt-pocock-skills` once per project before
using the rest. It writes `agents-docs/{issue-tracker,triage-labels,project-docs}.md`
and an `## Agent skills` block in the project's root `AGENTS.md` (or
`CLAUDE.md` if that's the real document), which the other skills read.

**User-invoked only** (you have to ask for them by name):
`grill-me`, `grill-with-docs`, `handoff`, `implement`,
`improve-codebase-architecture`, `setup-matt-pocock-skills`, `to-spec`,
`to-tickets`, `triage`, `wayfinder`

**Model-invoked** (the agent may reach for them on its own):
`adversarial-reviewer`, `code-review`, `codebase-design`, `diagnosing-bugs`,
`domain-modeling`, `grilling`, `prototype`, `research`,
`resolving-merge-conflicts`, `tdd`

(all prefixed `<group>-matt-`, except `adversarial-reviewer` and
`setup-matt-pocock-skills`, which are `<group>-adversarial-reviewer` and
`<group>-setup-matt-pocock-skills`)

## Layout

```
.claude-plugin/
  marketplace.json        # declares the two groups; generated, see below
scripts/
  gen-marketplace.mjs     # regenerates it from what's on disk
skills/
  <group>/                # makerkit | alvaro
    <group>-<skill-name>/
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
  Keep the group prefix (`makerkit-` or `alvaro-`).
- Edit both groups, or neither. They are independent copies; a fix applied
  to `skills/makerkit/` does not reach `skills/alvaro/`.
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
- `npx skills update` reverts copy mode to symlinks. Refresh with
  `npx skills add ... --copy -y` instead.
- Don't install the same skills globally (`-g`) as well, or both agents
  will see every skill twice.
- Do not use `--all` on `add`. It is shorthand for `--skill '*' --agent '*'`,
  and the `--agent '*'` part silently overrides `-a claude-code codex`,
  installing into every agent the CLI knows about and littering the project
  with directories like `agent/skills/`. Use `-s '*' -y` instead.
- Don't also install `mattpocock/skills` into the same project. These are
  adapted copies of those skills; you'd get both sets.
- Don't install both groups into the same project. Same skills, two
  prefixes; the agent would see every skill twice.
- The group headings in the picker come from `.claude-plugin/marketplace.json`,
  not from the `skills/<group>/` directories. Add a skill without
  regenerating the manifest and it lands under "Other".

## Attribution

The `*-matt-*` skills and `*-setup-matt-pocock-skills`, in both groups, are
adapted from [mattpocock/skills](https://github.com/mattpocock/skills) (MIT).
