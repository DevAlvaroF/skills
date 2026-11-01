---
name: makerkit-custom-setup-skills
description: "Configures a Makerkit repo for the engineering skills: sets up its issue tracker and domain docs under .mysdd/, keeps the tracker, docs and board file out of .gitignore, and maps its AGENTS.md conventions. Use when first adopting the engineering skills in a repo, or when another skill reports the tracker is behind and asks for a re-run."
disable-model-invocation: true
---

# Setup the Makerkit engineering skills

Scaffold what the engineering skills assume:

- `.mysdd/issue-tracker.md`, from [issue-tracker-local.md](./issue-tracker-local.md): JSON issues under
  `.mysdd/features/`, their formats and commit rules, at `Tracker contract: 7`.
- `.mysdd/docs/agents/domain.md`, from [domain.md](./domain.md): how to ground yourself in the repo's `AGENTS.md`
  files, READMEs and Makerkit docs, and where the glossary (`.mysdd/docs/CONTEXT.md`) and scoped ADRs live.
- An `## Agent skills` block in the root instruction file pointing at both.

Conventions need nothing generated: the repo's own `AGENTS.md` distribution is their documentation. Never write config
into `docs/`, which is Makerkit's upstream product documentation, and don't seed `CONTEXT.md` or `adr/`:
domain-modeling creates them when they're needed. Explore, present, confirm, then write. Commit nothing: the user
commits.

**Context.** Keep this session lean, for orchestration, the user's decisions, commits and records: hand reading,
searching, checks and fixes to sub-agents where that helps. Brief each one with what it needs and read what it returns,
which is how you know what is going on: ask for what you need to act on, not raw output. Its edits are your own paths to
commit; it commits nothing, as a recorded SHA must be a commit this session made.

## 1. Explore

Read what exists; don't assume: the root `AGENTS.md` and `CLAUDE.md` (is `CLAUDE.md` a real document or just an
`@AGENTS.md` import?) and any `## Agent skills` block; every other `AGENTS.md` outside `node_modules`, and other
convention sources such as `.cursor/rules`; which skills are installed; `.mysdd/issue-tracker.md` and its
`Tracker contract:` line;
`.mysdd/docs/agents/domain.md`; Features and issues under `.mysdd/features/`; old-layout Feature directories directly
under `.mysdd/`; and what Git ignores and tracks under `.mysdd/`.

If you found a tracker not at contract 7, existing issues, or an `AGENTS.md` with a `## Vocabulary` or `## Decisions`
section, read [UPGRADE.md](./UPGRADE.md) now; a fresh repo never needs it.

**Mobile app.** If `apps/native` exists, invoke `/makerkit-custom-mobile-app` and apply its § Setup.

## 2. Present and ask

Summarise what's there and what's missing, then one section at a time, leading with the recommended answer so the user
can accept it in a word. Skip a section exploration already settled.

**Committed or local.** Name the mode found (the seed's § Committed or local); either is fine. If it is unresolved,
show each responsible rule with its file and line. In a committed `.gitignore`, offer to replace it with
`.mysdd/features/` (local) or remove it (committed); for `.git/info/exclude` or a global excludes file, which aren't
the repo's, show the user the line to change. Never untrack or force-add. After a rule change, check the effective
result, not the edit. Report each old-layout directory: the other skills stop on it, and setup never moves it.

**Conventions map.** Show every `AGENTS.md` found, each with a one-line note on what its subtree owns, taken from the
file's own opening lines: that is the map the other skills navigate, and it shows the user any undocumented subtree.
List the other convention sources too. When the root `CLAUDE.md` is a real document without `@AGENTS.md`, an agent
reading only it never sees the root `AGENTS.md`: ask whether to add the import or write the block into both. With no
`AGENTS.md` at all, ask whether to seed a root one, since the block needs a home.

**Upgrades.** Each section of [UPGRADE.md](./UPGRADE.md) that applies.

## 3. Confirm

Draft the `## Agent skills` block, the § Verification lines, both generated files and every agreed rule change or
migration. For a file that exists, show the delta, not the whole file. Let the user edit before writing.

## 4. Write

Edit the root `AGENTS.md` if it exists — Claude Code reads it through `CLAUDE.md`'s import, Codex directly — else a
root `CLAUDE.md`; with neither, ask which to create. Never create a second root file, and never put this block in a
nested `AGENTS.md`: it is repo-wide. Update an existing block in place, leaving the rest of the file alone:

```markdown
## Agent skills

### Issue tracker

[one-line summary of where issues are tracked]. See `.mysdd/issue-tracker.md` (issue schema, status lifecycle, and
commit message format).

### Domain docs

Glossary in `.mysdd/docs/CONTEXT.md`, decisions as scoped ADRs in `.mysdd/docs/adr/`. See `.mysdd/docs/agents/domain.md`.

### Project docs

Conventions live in a distribution of `AGENTS.md` files (root, per app/package, and deeper). Read every `AGENTS.md`
from the root down to each directory you touch, in order, plus every one those files route a concern you touch to: the
root is already loaded; read the rest directly, because not every agent loads nested files. Invoke the skills a nested
`AGENTS.md` names when writing code there, and run any verification it adds.

### Kit edits

Prefer the kit's extension points, and edit a `packages/**` file Makerkit ships only once the user agrees none fits.
Mark every edit to a file Makerkit ships with a `kit-edit:` comment, in the file's own syntax at the changed lines,
saying why and naming the issue or ADR: the next upstream merge conflicts there, and `git grep kit-edit:` lists every
local change before one. The app's `config/`, navigation and i18n files are meant to be edited and need none; a file
that can't hold a comment (JSON) or a deleted one is named, with its why, in the commit body.
```

Add these lines once each to the same file's `## Verification`, creating the section if missing and replacing an older
one ending `, when installed.`. The second names the installed data specialist (`/rls-review` on the Supabase kits,
`/drizzle-expert` on Drizzle), as the reviews run only the one § Verification names; with neither installed, leave it
out and say so.

```markdown
- Run `/makerkit-custom-kit-conformance` on the change.
- When the change touches the schema, migrations or policies, run `/rls-review` on it.
```

Write each generated file from its seed. An existing `domain.md` takes the seed's changes and keeps the user's own
sections, named in the report; an existing tracker follows [UPGRADE.md](./UPGRADE.md). The tracker must hold
exactly one `Tracker contract: 7` line, directly under the title: every reader stops on anything else. Beyond the
block, its § Verification lines, a root file seeded on request, the UPGRADE.md moves and approved mobile stubs, leave
every `AGENTS.md` alone.

## 5. Done

Report per file what was written, kept, dropped or migrated, any follow-up left open, and what the user should
commit. Re-running this skill upgrades in place and asks before changing anything.
