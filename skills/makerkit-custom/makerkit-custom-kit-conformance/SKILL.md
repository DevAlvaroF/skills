---
name: makerkit-custom-kit-conformance
description: "Reviews a change in a Makerkit repo for whether it embraces the kit or fights it — bypassed kit wrappers, re-implemented kit features, edited upstream-owned or generated code, broken tenancy or schema workflow, deprecated APIs — on the Next.js and TanStack Start kits, with Supabase, Drizzle or Prisma. Reports findings, and where these skills have fallen behind the kit, and changes nothing. Use after implementing a feature in a Makerkit project, when the user asks whether work follows Makerkit's conventions or architecture, or when a review names it."
---

A Makerkit kit already answers actions, data access, tenancy, authorization, schema workflow, UI and i18n. Code that
bypasses those answers is code the kit's updates stop protecting, a conflict on the next upstream pull, or a guarantee
— RLS, the action middleware, a tenant filter — silently lost. This review looks only for that.

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

A kit is a framework and a data layer; read one file for each:

<!-- oxfmt-ignore -->
| | Signals | Read |
|---|---|---|
| Next.js | `next` in `apps/web/package.json`, `apps/web/app/` | [NEXTJS.md](./NEXTJS.md) |
| TanStack Start | `@tanstack/react-start`, `apps/web/src/routes/` | [TANSTACK.md](./TANSTACK.md) |
| Supabase | `apps/web/supabase/`, `@kit/supabase` | [SUPABASE.md](./SUPABASE.md) |
| Drizzle, Prisma | `drizzle-orm`; `schema.prisma` | [BETTER-AUTH.md](./BETTER-AUTH.md) |

The framework file's row for your data layer holds what depends on both — auth primitives, upstream, docs slug, the
kit's skills — and the kit version it was checked at. No file or no row is skill drift: review from the sources alone.

**Mobile app.** If the change touches `apps/native` or `packages/mobile-ui`, invoke `/makerkit-custom-mobile-app` and
apply its § Review there.

## Ground in the sources, in this order

1. Binding ADRs under `.mysdd/docs/adr/` whose scope covers the path.
2. Every `AGENTS.md` from the root down to each touched directory, plus the files it routes a concern to.
3. The kit's own current code doing the same job — the version you'll merge with. Name the exemplar path.
4. The Makerkit docs, through one sub-agent you don't wait on: `docs/*.mdoc`, else
   `https://makerkit.dev/docs/md/<slug>/<path>` with the kit row's slug. Ask how the touched concern is meant to
   work, answered briefly with the pages it used.
5. The kit's own skills.

The kit contradicts itself — some docs and kit skills still show deprecated APIs — so the higher source wins, and a
disagreement between sources goes in the report as a note, never as a finding against the code. Every finding cites its
source, a file and its rule or an exemplar path: with no source there is no finding, because a reviewer's taste is not
the kit's architecture. The kit files are a map to these sources, not one of them: cite what they point at, or, where
the repo ships none of it, cite the kit file and say so.

## What fighting the kit looks like

1. **Editing upstream-owned code without need.** Upstream-owned is a changed `packages/**` path that exists in the
   upstream tree (`git remote -v` for the Makerkit remote, then its tree; with none, the kit row's upstream, fetched
   without adding a remote; if that fails too, `packages/**` minus paths the repo's own history added), a hand-edited
   generated file, or a migration already applied. Name the extension point the kit offers instead. Need is when none
   exists and avoiding the edit would leave the kit's version unused, duplicated or shadowed: a parallel copy (a second
   admin sidebar beside the kit's, the original left dead) costs more than a conflict on the next pull, so edit in
   place. `apps/**` is the app's starting point, and its `config/` files, navigation configs and i18n messages are
   meant to be edited: no finding.
2. **An unmarked kit edit.** Every change to a file the upstream tree holds (rule 1's test, over every path, so
   `apps/**` too, minus those config, navigation and i18n files) carries a `kit-edit:` comment at it, in the file's
   syntax, saying why and naming the issue or ADR — one per change, the imports it needs included: the next upstream
   merge conflicts there, and the diff against upstream shows only what changed. A file that can't hold a comment
   (JSON) or a deleted one is exempt when the commit body names it with its why.
3. **Bypassing a kit primitive:** action clients or server-function middleware, the route-handler wrapper, data and
   auth clients, the logger, the mailer, i18n, `@kit/ui`, forms.
4. **Re-implementing what the kit ships.** Search the kit before accepting anything new.
5. **Wrong layer:** business logic in actions or server functions rather than services; mutations used for fetching;
   the framework file's server/client split missing; a new package for app-only code; files outside the kit's route
   layout.
6. **Breaking tenancy or authorization:** data not owned by an account or organization; authorization in the wrong
   layer for the data layer; a privileged client in a user flow.
7. **Skipping the data layer's schema workflow.**
8. **APIs or patterns the current kit version deprecated,** and the platform rules `AGENTS.md` adds (e.g. Cache
   Components).

Bugs, general quality and tenant-isolation proofs belong to `/reviewer` and the data specialist the root `AGENTS.md`
§ Verification names (`/rls-review` on the Supabase kits, `/drizzle-expert` on Drizzle), not here. When the change
touches the schema, recommend that specialist, never one the repo doesn't install.

## Running it

Split a large change by path across sub-agents, handing each the commands that reproduce its diff
(`git show <sha> -- <paths>`, a whole read of each new file), never the diff itself: pasting it pays for it twice.

## Report

```
Kit conformance: Next.js · Supabase · <what was reviewed>
Verdict: CONFORMS | FIGHTS THE KIT
1. BLOCKING — apps/web/app/[locale]/home/(user)/notes/actions.ts:4 — raw 'use server' function with a manual getUser check
   Rule: packages/next/AGENTS.md — "ALWAYS use `authActionClient` for authenticated actions"
   Kit's way: authActionClient from @kit/next/safe-action — see packages/features/accounts/src/server/personal-accounts-server-actions.ts
2. SUGGESTION — …
Notes: source conflicts; checks skipped and why; the data specialist recommended or not; skill drift, last.
```

A finding is **BLOCKING** when the change edits upstream-owned or generated code without need, copies kit code to avoid
a needed edit, edits a kit file without its `kit-edit:` comment, loses a security guarantee, breaks a MUST, ALWAYS or
NEVER rule in an ADR or `AGENTS.md`, or uses a deprecated kit API. Anything else is a **SUGGESTION**. The verdict is
CONFORMS only when no finding is BLOCKING. The labels match final-review's, so its phase 1 takes the findings as they
are.

## Skill drift

Makerkit ships often, TanStack fastest, and these skills go stale unseen. The user wants to know when they conflict
with the kit, so they can update them; nothing more.

- **Check** when the kit's version — the higher of the root `CHANGELOG.md`'s top `## [x.y.z]` and the root
  `package.json`'s, as Makerkit doesn't always bump both — is newer than the row's "checked at", or there is no row:
  verify against the code the names this review relies on, and read the kit skills (`.agents/skills/` minus this pack
  and `kanban-jobs`) the row's list lacks for overlap with a step these skills own. The list only marks which are new;
  it is not a roster to keep in sync. At the same version don't go looking, since re-checking every run costs more
  than it finds; but a name the review relied on that the code contradicts is drift there too, as the version can lag
  the code. An older kit has not caught up with the row, so its names may not exist there yet: follow the repo and
  report no drift.
- **Drift** is a name, path, command or workflow these skills give that the repo lacks, renamed or contradicts; a kit
  with no file or row; a kit skill they call that is gone, renamed or changed how it is called; a new kit skill
  covering a step they own, whose entry names that step and what overlaps and leaves the user to call it, defer to it
  or ignore it, with no `Fix:`, because the list missing a name is not the conflict. A kit skill that touches nothing
  these skills do is not drift. Prove it from exports, `AGENTS.md` or source, because docs lag code. A change the
  repo's own history made is the user's, not drift (suggest an ADR via `/makerkit-custom-domain-modeling`); a better
  wording never is.
- Drift is never a finding, never changes the verdict or stops the review, and never edits the installed skills:
  `npx skills update` overwrites them. With none, write nothing; else end the notes with:

```
Skill drift — makerkit-custom conflicts with this kit
1. makerkit-custom-kit-conformance/TANSTACK.md says "org functions use organizationFunctionMiddleware"
   Repo shows: packages/function-middleware/src/functions.ts exports orgFunctionMiddleware
   Cause: upstream change — CHANGELOG.md [1.4.0] "Rename function middleware tuples"
   Fix: rename it in the Drizzle row
```

`Fix:` only when it is obvious. The other makerkit-custom skills report drift in this same block.
