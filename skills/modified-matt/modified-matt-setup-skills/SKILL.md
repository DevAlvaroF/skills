---
name: modified-matt-setup-skills
description: "Configures a repo for the engineering skills: sets up its local JSON issue tracker under .mysdd/ and its domain doc layout. Use when first adopting the engineering skills in a repo, or when another skill reports the tracker is behind and asks for a re-run."
disable-model-invocation: true
---

# Setup Matt Pocock's Skills

Scaffold what the engineering skills assume:

- `.mysdd/issue-tracker.md`, from [issue-tracker-local.md](./issue-tracker-local.md): JSON issues under
  `.mysdd/features/`, their formats and commit rules, at `Tracker contract: 6`.
- `.mysdd/docs/agents/domain.md`, from [domain.md](./domain.md): where the glossary and the scoped ADRs live.
- An `## Agent skills` block pointing at both.

Explore, present what you found, confirm with the user, then write. Commit nothing: the user commits.

## 1. Explore

Read what exists; don't assume: `CLAUDE.md` and `AGENTS.md` at the root and any `## Agent skills` block in them;
`CONTEXT.md` and `CONTEXT-MAP.md`; `.mysdd/issue-tracker.md` and its `Tracker contract:` line;
`.mysdd/docs/agents/domain.md`; ADRs in `.mysdd/docs/adr/`; Features and issues under `.mysdd/features/`; old-layout
Feature directories directly under `.mysdd/`; monorepo signals (`pnpm-workspace.yaml`, a `workspaces` field, a
populated `packages/*`); and what Git ignores and tracks under `.mysdd/`.

If you found a tracker not at contract 6, existing issues or ADRs without frontmatter, read [UPGRADE.md](./UPGRADE.md)
now; a fresh repo never needs it.

## 2. Present and ask

Summarise what's there and what's missing, then one section at a time, leading with the recommended answer so the user
can accept it in a word. Skip a section exploration already settled.

**Committed or local.** Name the mode found (the seed's § Committed or local); either is fine. If it is unresolved,
show each responsible rule with its file and line. In a committed `.gitignore`, offer to replace it with
`.mysdd/features/` (local) or remove it (committed); for `.git/info/exclude` or a global excludes file, which aren't
the repo's, show the user the line to change. Never untrack or force-add. After a rule change, check the effective
result, not the edit. Report each old-layout directory: the other skills stop on it, and setup never moves it.

**Domain docs.** Single-context (one root `CONTEXT.md`, ADRs in `.mysdd/docs/adr/`) fits almost every repo; write it
without asking. Offer multi-context (a root `CONTEXT-MAP.md` pointing at per-context `CONTEXT.md` files) only with
monorepo signals.

**Upgrades.** Each section of [UPGRADE.md](./UPGRADE.md) that applies.

## 3. Confirm

Draft the `## Agent skills` block, both generated files and every agreed rule change or migration. For a file that
exists, show the delta, not the whole file. Let the user edit before writing.

## 4. Write

Edit `CLAUDE.md` if it exists, else `AGENTS.md`; with neither, ask which to create. Never create one beside the other.
Update an existing `## Agent skills` block in place, leaving the rest of the file alone:

```markdown
## Agent skills

### Issue tracker

[one-line summary of where issues are tracked]. See `.mysdd/issue-tracker.md` (issue schema, status lifecycle, and commit message format).

### Domain docs

[one-line summary of layout: "single-context" or "multi-context"], with scoped, binding ADRs in `.mysdd/docs/adr/`. See `.mysdd/docs/agents/domain.md`.
```

Write each generated file from its seed. An existing `domain.md` takes the seed's changes and keeps the user's own
sections, named in the report; an existing tracker follows [UPGRADE.md](./UPGRADE.md). The tracker must end with
exactly one `Tracker contract: 6` line, directly under the title: every reader stops on anything else.

## 5. Done

Report per file what was written, kept, dropped or migrated, any follow-up left open, and what the user should
commit. Re-running this skill upgrades in place and asks before changing anything.
