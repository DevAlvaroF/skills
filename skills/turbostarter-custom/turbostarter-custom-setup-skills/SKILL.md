---
name: turbostarter-custom-setup-skills
description: "Configures a TurboStarter repo (Core, AI, AI combined with Core, or Edge) for the engineering skills: sets up its issue tracker and domain docs under .mysdd/, keeps the tracker, docs and board file out of .gitignore, maps its AGENTS.md conventions and records which kit it is. Use when first adopting the engineering skills in a repo, or when another skill reports the tracker is behind and asks for a re-run."
disable-model-invocation: true
---

# Setup the TurboStarter engineering skills

Scaffold what the engineering skills assume:

- `.mysdd/issue-tracker.md`, from [issue-tracker-local.md](./issue-tracker-local.md): JSON issues under
  `.mysdd/features/`, their formats and commit rules, at `Tracker contract: 7`.
- `.mysdd/docs/agents/domain.md`, from [domain.md](./domain.md): how to ground yourself in the repo's `AGENTS.md`
  files, READMEs and the TurboStarter docs, and where the glossary (`.mysdd/docs/CONTEXT.md`) and scoped ADRs live.
- An `## Agent skills` block in the root instruction file pointing at both, and naming the kit.
- On request, TurboStarter's docs MCP server in `.mcp.json` and `.codex/config.toml`.

Conventions need nothing generated: the repo's own `AGENTS.md` files are their documentation, and TurboStarter keeps
its product docs online, not in the repo. Don't seed `CONTEXT.md` or `adr/`: domain-modeling creates them when they're
needed. Explore, present, confirm, then write. Commit nothing: the user commits.

**Context.** Keep this session lean, for orchestration, the user's decisions, commits and records: hand reading,
searching, checks and fixes to sub-agents where that helps. Brief each one with what it needs and read what it returns,
which is how you know what is going on: ask for what you need to act on, not raw output. Its edits are your own paths to
commit; it commits nothing, as a recorded SHA must be a commit this session made.

## 1. Explore

Read what exists; don't assume: the root `AGENTS.md` and `CLAUDE.md` (is `CLAUDE.md` a real document or just an
`@AGENTS.md` import?) and any `## Agent skills` block; every other `AGENTS.md` outside `node_modules`; the kit's agent
files under `.agents/` and `skills-lock.json`, and which skills are installed; the root `AGENTS.md`'s commit rules; the
root `package.json` scripts; the MCP servers `.mcp.json` and `.codex/config.toml` register; `.mysdd/issue-tracker.md`
and its `Tracker contract:` line; `.mysdd/docs/agents/domain.md`; Features and issues under `.mysdd/features/`;
old-layout Feature directories directly under `.mysdd/`; and what Git ignores and tracks under `.mysdd/`.

**Which kit.** `git remote get-url upstream` naming `turbostarter/core`, `/ai` or `/edge` is the strongest signal.
The files decide otherwise: Edge has `wrangler.jsonc` and `src/routeTree.gen.ts` and no `apps/`; AI has
`packages/ai/core`; Core has `packages/billing/web` or `packages/auth/src/rbac`. AI and Core signals together are AI
combined with Core: which kit the repo started from is the base, and a missing `upstream` leaves that for the user.

If you found a tracker not at contract 7, existing issues, or an `AGENTS.md` with a `## Vocabulary` or `## Decisions`
section, read [UPGRADE.md](./UPGRADE.md) now; a fresh repo never needs it.

**Mobile app, extension.** If `apps/mobile` exists, invoke `/turbostarter-custom-mobile-app` and apply its § Setup; if
`apps/extension` exists, invoke `/turbostarter-custom-extension` and apply its § Setup. Either one not installed: say
so, and give its install line, run at the project root:
`npx skills@latest add https://github.com/DevAlvaroF/skills/tree/main/skills/turbostarter-custom --skill <name>`.

## 2. Present and ask

Summarise what's there and what's missing, then one section at a time, leading with the recommended answer so the user
can accept it in a word. Skip a section exploration already settled.

**Kit.** The kit found and why. For AI combined with Core, confirm the base: the other skills treat only the base's
tree as upstream-owned.

**Committed or local.** Name the mode found (the seed's § Committed or local); either is fine. If it is unresolved,
show each responsible rule with its file and line. In a committed `.gitignore`, offer to replace it with
`.mysdd/features/` (local) or remove it (committed); for `.git/info/exclude` or a global excludes file, which aren't
the repo's, show the user the line to change. Never untrack or force-add. After a rule change, check the effective
result, not the edit. Report each old-layout directory: the other skills stop on it, and setup never moves it.

**Conventions map.** Show every `AGENTS.md` found, each with a one-line note on what its subtree owns, taken from the
file's own opening lines: that is the map the other skills navigate, and it shows the user any undocumented subtree.
List the kit's agents and commands under `.agents/` too. When the root `CLAUDE.md` is a real document without
`@AGENTS.md`, an agent reading only it never sees the root `AGENTS.md`: ask whether to add the import or write the
block into both. With no `AGENTS.md` at all, ask whether to seed a root one, since the block needs a home.

**Verification.** The kit's `AGENTS.md` lists commands but no `## Verification` the other skills can run in order (Edge
has `### Verify before you finish`). Propose one from the scripts the root `package.json` actually has — the kit's
files name some that don't exist, such as `pnpm typecheck`, and its lint is type-aware: Core `pnpm lint`,
`pnpm format`, `pnpm test`; AI `pnpm lint`, `pnpm format`, and no test script to name; Edge `pnpm check:fix` then
`pnpm test`, plus `pnpm build` after touching routes or SSR. Then the two lines below, last: the auth one only when
its skill is installed (`better-auth-best-practices` on Core and AI, `create-auth` on Edge), as the reviews run only
the specialist § Verification names. With neither installed, say so.

**Commits.** The kit's `AGENTS.md` has its own commit convention and commits only when asked, while the skills commit
with the tracker's subjects: propose the block's `### Commits` exception, so agents never choose between them.

**Docs MCP server.** The kit ships no MCP config. Unless both files already register
`https://www.turbostarter.dev/mcp`, offer to add TurboStarter's docs server: public and read-only (`search_docs`,
`read_doc`), nothing to install or run, and the other skills use it beside the website. Declined: they use the website
alone. Merge into an existing file, keeping its other servers:

```json
{ "mcpServers": { "turbostarter": { "type": "http", "url": "https://www.turbostarter.dev/mcp" } } }
```

```toml
[mcp_servers.turbostarter]
url = "https://www.turbostarter.dev/mcp"
```

Codex reads a project's `.codex/config.toml` only once the project is trusted. Both take effect in the next session.

**Upgrades.** Each section of [UPGRADE.md](./UPGRADE.md) that applies.

## 3. Confirm

Draft the `## Agent skills` block, the § Verification section, both generated files, any agreed MCP entries and every
agreed rule change or migration. For a file that exists, show the delta, not the whole file. Let the user edit
before writing.

## 4. Write

Edit the root `AGENTS.md` if it exists — Claude Code reads it through `CLAUDE.md`'s import, Codex directly — else a
root `CLAUDE.md`; with neither, ask which to create. Never create a second root file, and never put this block in a
nested `AGENTS.md`: it is repo-wide. The kit ships the root `AGENTS.md` and updates it, so append at the end, where an
upstream merge rarely touches, under one `<!-- kit-edit: engineering skills setup -->` line. Update an existing block
in place, leaving the rest of the file alone:

```markdown
## Agent skills

### Issue tracker

[one-line summary of where issues are tracked]. See `.mysdd/issue-tracker.md` (issue schema, status lifecycle, and
commit message format).

### Domain docs

Glossary in `.mysdd/docs/CONTEXT.md`, decisions as scoped ADRs in `.mysdd/docs/adr/`. See `.mysdd/docs/agents/domain.md`.

### Commits

The commits the engineering skills make take their subjects, trailers and timing from `.mysdd/issue-tracker.md`
§ Commits, an agreed exception to the kit's commit convention: running such a skill is the request to commit. Every
other commit follows the kit's rules.

### Project docs

Conventions live in a distribution of `AGENTS.md` files (root, per app/package, and deeper). Read every `AGENTS.md`
from the root down to each directory you touch, in order, plus every one those files route a concern you touch to: the
root is already loaded; read the rest directly, because not every agent loads nested files. Invoke the skills a nested
`AGENTS.md` names when writing code there, and run any verification it adds.

### Kit edits

TurboStarter [Core | AI | Edge | AI, combined with Core ported in | Core, combined with AI ported in]. Prefer the kit's
extension points, and edit a file TurboStarter ships under [`packages/**` or `tooling/**` | `src/lib/**`] only once
the user agrees none fits. Mark every edit to a file the kit ships with a `kit-edit:` comment, in the file's own syntax
at the changed lines, saying why and naming the issue or ADR: the next `git pull upstream main` conflicts there, and
`git grep kit-edit:` lists every local change before one. [`apps/*/src/config/`, navigation and
`packages/i18n/src/translations/` | `src/config/`, `messages/` and `src/content/`] are meant to be edited and need
none; code ported from the other kit is the app's own; a file that can't hold a comment (JSON) or a deleted one is
named, with its why, in the commit body.
```

Pick each bracket's choice for this kit. The § Verification section goes in the same file — the agreed list, or the
existing section with these lines added once each, replacing an older one ending `, when installed.`:

```markdown
- Run `/turbostarter-custom-kit-conformance` on the change.
- When the change touches auth, roles or the schema, run `/better-auth-best-practices` on it.
```

On Edge the second line names `/create-auth`.

Write each generated file from its seed. An existing `domain.md` takes the seed's changes and keeps the user's own
sections, named in the report; an existing tracker follows [UPGRADE.md](./UPGRADE.md). The tracker must hold
exactly one `Tracker contract: 7` line, directly under the title: every reader stops on anything else. Beyond the
block, its § Verification lines, a root file seeded on request, the UPGRADE.md moves and approved mobile or extension stubs,
leave every `AGENTS.md` alone. Write the agreed MCP entries last, merged as § 2 shows.

## 5. Done

Report per file what was written, kept, dropped or migrated, any follow-up left open, and what the user should
commit. Re-running this skill upgrades in place and asks before changing anything.
