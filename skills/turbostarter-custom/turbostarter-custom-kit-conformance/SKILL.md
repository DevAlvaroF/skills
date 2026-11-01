---
name: turbostarter-custom-kit-conformance
description: "Reviews a change in a TurboStarter repo for whether it embraces the kit or fights it — bypassed kit middleware and clients, re-implemented kit features, edited upstream-owned or generated code, broken tenancy, credits or schema workflow — on the Core, AI and Edge kits, and on AI combined with Core. Reports findings, and where these skills have fallen behind the kit, and changes nothing. Use after implementing a feature in a TurboStarter project, when the user asks whether work follows TurboStarter's conventions or architecture, or when a review names it."
---

A TurboStarter kit already answers the API layer, data access, tenancy, authorization, billing or credits, schema
workflow, UI and i18n. Code that bypasses those answers is code the kit's updates stop protecting, a conflict on the
next `git pull upstream main`, or a guarantee — an `enforce*` middleware, an `organizationId` filter, a credit charge
before the model call — silently lost. This review looks only for that.

**Context.** Keep this session lean, for orchestration, the user's decisions and the report: hand reading, searching and
checks to sub-agents where that helps, split as § Running it says. This review changes no file (§ Scope), so it hands
out no fixes. Brief each one with what it needs and read what it returns, which is how you know what is going on: ask
for what you need to act on, not raw output.

## Scope

Review exactly what the caller names: SHAs, a range, paths or an issue. Commits a caller hands over (final-review
phase 1, `/kanban-jobs` step D) are the whole scope, overriding any default diff: a review of another diff is not that
review. With nothing named, review the uncommitted changes; on a clean tree, the current branch since it left the
default branch; if that is unclear, ask.

Report only: change no file and make no commit, because whoever fixes should weigh the findings, and the user's tree
may be mid-work.

## Detect the kit

TurboStarter ships three kits that share little structure, and the AI kit is often combined with Core. The `upstream`
remote (`git remote get-url upstream` naming `turbostarter/core`, `/ai` or `/edge`) is the strongest signal, because
the kit's own docs set it up; the files decide when it is missing:

<!-- oxfmt-ignore -->
| Shape | Signals | Read |
|---|---|---|
| Edge | `wrangler.jsonc` with `d1_databases`, `src/routeTree.gen.ts`, no `apps/` | [EDGE.md](./EDGE.md) |
| AI | `packages/ai/core` (`@workspace/ai`), no Core signal | [AI.md](./AI.md) |
| Core | `packages/billing/web`, `packages/auth/src/rbac`, `apps/extension/wxt.config.ts`, no AI signal | [CORE.md](./CORE.md) |
| AI + Core | AI and Core signals together | [CORE.md](./CORE.md), [AI.md](./AI.md) and [AI-CORE.md](./AI-CORE.md) |

Each kit file ends with its row: the upstream, the docs base, the upstream-owned paths, the kit's skills, and the
upstream commit it was checked at. No file or no row is skill drift: review from the sources alone.

**Mobile app, extension.** If the change touches `apps/mobile` or `packages/ui/mobile`, invoke
`/turbostarter-custom-mobile-app` and apply its § Review there; if it touches `apps/extension`, invoke
`/turbostarter-custom-extension` and apply its § Review. Either one not installed (in the session's skills or under the
repo's `.agents/skills/` or `.claude/skills/`, never searched for elsewhere): review those paths from CORE.md alone and
say in the notes which skill to install.

## Ground in the sources, in this order

1. Binding ADRs under `.mysdd/docs/adr/` whose scope covers the path.
2. Every `AGENTS.md` from the root down to each touched directory, plus the files it routes a concern to.
3. The kit's own current code doing the same job — the version you'll merge with. Name the exemplar path.
4. The TurboStarter docs, through one sub-agent you don't wait on. The kit ships none in the repo yet: use both the
   docs MCP server's `search_docs` and `read_doc`, when the session has it, and
   `https://www.turbostarter.dev/<docs base>/<page>.md` with the kit row's docs base (any page is served as markdown
   with `.md`; `/llms.txt` lists them), since either can hold what the other misses.
   Ask how the touched concern is meant to work, answered briefly with the pages it used.
5. The kit's own skills and agents (`.agents/skills/`, `.agents/agents/`).

The kit contradicts itself — its `AGENTS.md` files and docs name commands and paths the code no longer has — so the
higher source wins, a command `AGENTS.md` names that `package.json` lacks is a note rather than an instruction, and a
disagreement between sources goes in the report as a note, never as a finding against the code. Every finding cites its
source, a file and its rule or an exemplar path: with no source there is no finding, because a reviewer's taste is not
the kit's architecture. The kit files are a map to these sources, not one of them: cite what they point at, or, where
the repo ships none of it, cite the kit file and say so.

## What fighting the kit looks like

1. **Editing upstream-owned code without need.** Upstream-owned is a changed path the kit file marks so that exists in
   the upstream tree (`git remote get-url upstream`, then its tree; with none, the kit row's upstream, fetched without
   adding a remote; if that fails too, those paths minus what the repo's own history added), a hand-edited generated
   file, or a migration already applied. Name the extension point the kit offers instead. Need is when none exists and
   avoiding the edit would leave the kit's version unused, duplicated or shadowed: a parallel copy (a second auth
   client beside the kit's, the original left dead) costs more than a conflict on the next pull, so edit in place. The
   kit file names the app paths meant to be edited — config, navigation, translations: no finding there.
2. **An unmarked kit edit.** Every change to a file the upstream tree holds (rule 1's test, over every path, minus the
   kit file's editable paths) carries a `kit-edit:` comment at it, in the file's syntax, saying why and naming the
   issue or ADR — one per change, the imports it needs included: the next upstream merge conflicts there, and the diff
   against upstream shows only what changed. A file that can't hold a comment (JSON) or a deleted one is exempt when
   the commit body names it with its why. In AI + Core, only the base kit's tree is upstream (AI-CORE.md).
3. **Bypassing a kit primitive:** the API layer's middleware and validation, the auth client, the database client, the
   logger, the mailer, i18n, the kit's UI packages, the billing or credits entry point — each kit file lists them.
4. **Re-implementing what the kit ships.** Search the kit before accepting anything new. Organizations, subscriptions
   or an admin built by hand in an AI-only repo re-implement Core: the kit's answer is its integrate-Core recipe
   (AI.md).
5. **Wrong layer:** business logic in a router, a route or a component rather than the module or package that owns it;
   app UI calling a hand-rolled endpoint where the kit's typed API client or server function exists; a new package for
   app-only code; files outside the kit's layout.
6. **Breaking tenancy, authorization or metering:** data not scoped to its owner — organization, user or anonymous
   session, per the kit file; a check done only on the client or by navigation; an AI call that can run before its
   credit or plan check.
7. **Skipping the schema workflow:** a hand-written or hand-edited migration, or a table in a generator-owned file.
8. **APIs or patterns the current kit deprecated,** and the platform rules `AGENTS.md` adds (e.g. Next.js 16's
   `proxy.ts`, Edge's Workers-only APIs).

Bugs, general quality and tenant-isolation proofs belong to `/reviewer` and the auth specialist the root `AGENTS.md`
§ Verification names (`better-auth-best-practices` or `create-auth` where the kit installs one), not here. When the
change touches auth or the schema, recommend that specialist, never one the repo doesn't install.

## Running it

Split a large change by path across sub-agents, handing each the commands that reproduce its diff
(`git show <sha> -- <paths>`, a whole read of each new file), never the diff itself: pasting it pays for it twice.

## Report

```
Kit conformance: Core · <what was reviewed>
Verdict: CONFORMS | FIGHTS THE KIT
1. BLOCKING — packages/api/src/modules/projects/router.ts:12 — org route without a permission check
   Rule: packages/api/src/middleware.ts — enforceOrganizationPermission guards every organization route
   Kit's way: enforceOrganizationPermission — see packages/api/src/modules/organization/router.ts
2. SUGGESTION — …
Notes: source conflicts; checks skipped and why; the auth specialist recommended or not; skill drift, last.
```

A finding is **BLOCKING** when the change edits upstream-owned or generated code without need, copies kit code to avoid
a needed edit, edits a kit file without its `kit-edit:` comment, loses a security or metering guarantee, breaks a MUST,
ALWAYS or NEVER rule in an ADR or `AGENTS.md`, breaks an AI-CORE.md rule, or uses a deprecated kit API. Anything else
is a **SUGGESTION**. The verdict is CONFORMS only when no finding is BLOCKING. The labels match final-review's, so its
phase 1 takes the findings as they are.

## Skill drift

TurboStarter ships continuously, without version numbers or a changelog, and these skills go stale unseen. The user
wants to know when they conflict with the kit, so they can update them; nothing more.

- **Check** when the kit has moved past the row: the kit's date is that of `git merge-base HEAD upstream/main` once
  `upstream` is fetched, and it is newer than the row's "checked at" date, or there is no row. Then verify against the
  code the names this review relies on, and read the kit skills (`.agents/skills/` minus this pack and `kanban-jobs`)
  the row's list lacks for overlap with a step these skills own. The list only marks which are new; it is not a roster
  to keep in sync. With no `upstream` remote the kit's date is unknown, so don't go looking; and at the same date
  re-checking every run costs more than it finds. A name the review relied on that the code contradicts is drift
  either way. An older kit has not caught up with the row, so its names may not exist there yet: follow the repo and
  report no drift. In AI + Core only the base kit has a date.
- **Drift** is a name, path, command or workflow these skills give that the repo lacks, renamed or contradicts; a kit
  with no file or row; a kit skill they call that is gone, renamed or changed how it is called; a new kit skill
  covering a step they own, whose entry names that step and what overlaps and leaves the user to call it, defer to it
  or ignore it, with no `Fix:`, because the list missing a name is not the conflict. A kit skill that touches nothing
  these skills do is not drift. Prove it from exports, `AGENTS.md` or source, because docs lag code. A change the
  repo's own history made is the user's, not drift (suggest an ADR via `/turbostarter-custom-domain-modeling`); a
  better wording never is.
- Drift is never a finding, never changes the verdict or stops the review, and never edits the installed skills:
  `npx skills update` overwrites them. With none, write nothing; else end the notes with:

```
Skill drift — turbostarter-custom conflicts with this kit
1. turbostarter-custom-kit-conformance/CORE.md says "org routes use enforceOrganizationPermission"
   Repo shows: packages/api/src/middleware.ts exports enforceOrgPermission
   Cause: upstream change — <sha> "refactor(api): rename org middleware"
   Fix: rename it in CORE.md
```

`Fix:` only when it is obvious. The other turbostarter-custom skills report drift in this same block.
