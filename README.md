# skills

Custom skills for Claude Code and Codex, installed per project with
[`npx skills`](https://github.com/vercel-labs/skills).

The repo ships two flavours of the same eight skills. **Install one per
project, never both.**

| Flavour | Use it for |
|---|---|
| **Makerkit Custom Skills** (`makerkit-custom-*`) | [Makerkit](https://makerkit.dev) repos — knows its `AGENTS.md` layout, RLS, `.mdoc` docs and fork/upstream remotes |
| **Modified Matt Skills** (`modified-matt-*`) | Any other repo |

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
   *Select All*; that takes both flavours.
2. **Agents** — Claude Code (preselected), plus Codex if you use it.
3. **Method** — `Symlink`.
4. **Scope** — `Project`.

Commit what it wrote (`.agents/skills/`, `.claude/skills/`,
`skills-lock.json`) and restart your agents.

Finally, run the setup skill once in the project —
`/modified-matt-setup-skills` or `/makerkit-custom-setup-skills` (in Codex,
`$` instead of `/`). The other skills depend on the files it writes.

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

---

## For developers

### Layout

```
.claude-plugin/marketplace.json   # defines the picker's two groups — generated
scripts/gen-marketplace.mjs       # regenerates it
skills/
  makerkit-custom/<skill>/        # SKILL.md, optional references/ and agents/openai.yaml
  modified-matt/<skill>/
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
- Keep the flavour prefix on every skill name.
- `description` is all the agent sees before loading a skill — write it as
  trigger conditions ("Use when…"), not a summary.
- Keep `SKILL.md` short; put detail in `references/`.
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
`setup-skills`, `to-spec`, `to-issues`. Model-invoked: `domain-modeling`,
`tdd`.

---

## Attribution

The `modified-matt-*` skills and `makerkit-custom-setup-skills` are adapted
from [mattpocock/skills](https://github.com/mattpocock/skills) (MIT).
