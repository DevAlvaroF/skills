# agent-skills

Custom skills for Claude Code and Codex, installed per project with
[`npx skills`](https://github.com/vercel-labs/skills).

## Layout

```
skills/
  <skill-name>/
    SKILL.md          # required
    references/       # optional, loaded on demand
```

`TEMPLATE.md` is the starting point for a new skill. It lives at the repo
root, not under `skills/`, so it is not discovered as a skill itself.

## Installing into a project

```bash
cd /path/to/your-project
npx skills add DevAlvaroF/agent-skills -a claude-code codex --all
```

Install only what that project needs instead of everything:

```bash
npx skills add DevAlvaroF/agent-skills -a claude-code codex -s skill-one skill-two
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

## Updating a project after this repo changes

```bash
cd /path/to/your-project
npx skills update -p -y
git commit -am "Update agent skills"
```

Updates are per project. To sweep every project that has skills installed,
add this to your shell profile:

```bash
skills-refresh() {
  for d in ~/Coding/*/skills-lock.json; do
    (cd "${d%/skills-lock.json}" && echo "-> $PWD" && npx skills update -p -y)
  done
}
```

## Writing a skill

- `description` is the only text an agent sees before deciding whether to
  load the skill. Write it as trigger conditions ("Use when..."), not as a
  summary.
- Valid frontmatter keys in both agents: `name`, `description`, `license`,
  `allowed-tools`, `metadata`. Anything else fails Codex validation.
- Skill names share one namespace with bundled and third-party skills.
  Prefix yours if a collision is plausible.
- Keep `SKILL.md` short; push detail into `references/` so it loads only
  when needed.

## Gotchas

- Skills are loaded at session start. Restart Claude or Codex after
  installing or updating.
- Don't install the same skills globally (`-g`) as well, or both agents
  will see every skill twice.
