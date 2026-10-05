---
name: makerkit-custom-kit-conformance
description: "Reviews a change in a Makerkit repo for whether it embraces the kit or fights it — bypassed kit wrappers, re-implemented kit features, edited upstream-owned or generated code, broken tenancy or schema workflow, deprecated APIs — on the Supabase, Prisma or Drizzle kits. Reports findings and changes nothing. Use after implementing a feature in a Makerkit project, when the user asks whether work follows Makerkit's conventions or architecture, or when a review names it."
---

A Makerkit kit already answers actions, data access, tenancy, authorization, schema workflow, UI and i18n. Code that
bypasses those answers is code the kit's updates stop protecting, a conflict on the next upstream pull, or a guarantee
— RLS, the action middleware, a tenant filter — silently lost. This review looks only for that.

## Scope

Review exactly what the caller names: SHAs, a range, paths or an issue. Commits a caller hands over (final-review
phase 1, `/kanban-jobs` step D) are the whole scope, overriding any default diff: a review of another diff is not that
review. With nothing named, review the uncommitted changes; on a clean tree, the current branch since it left the
default branch; if that is unclear, ask.

Report only: change no file and make no commit, because whoever fixes should weigh the findings, and the user's tree
may be mid-work.

## Detect the flavour

| Flavour | Signals |
|---|---|
| Supabase | `apps/web/supabase/`, `@kit/supabase` |
| Prisma | `schema.prisma`, a `prisma` dependency |
| Drizzle | `drizzle-orm`, `packages/database/src/schema/` |

Then read [SUPABASE.md](./SUPABASE.md) or, for Prisma and Drizzle, [BETTER-AUTH.md](./BETTER-AUTH.md): it holds the
concrete names the checks below look for. For another kit (TanStack Start, React Router), read the file for the same
data layer and say so in the report.

## Ground in the sources, in this order

1. Binding ADRs under `.mysdd/docs/adr/` whose scope covers the path.
2. Every `AGENTS.md` from the root down to each touched directory, plus the files it routes a concern to.
3. The kit's own current code doing the same job — the version you'll merge with. Name the exemplar path.
4. The Makerkit docs, through one sub-agent you don't wait on: `docs/*.mdoc`, else
   `https://makerkit.dev/docs/md/<kit>/<path>` (kits `next-supabase-turbo`, `nextjs-prisma`, `nextjs-drizzle`). Ask
   how the touched concern is meant to work, answered briefly with the pages it used.
5. The kit's builder skills.

The kit contradicts itself — some docs and builder skills still show deprecated APIs — so the higher source wins, and a
disagreement between sources goes in the report as a note, never as a finding against the code. Every finding cites its
source, a file and its rule or an exemplar path: with no source there is no finding, because a reviewer's taste is not
the kit's architecture. The flavour file is a map to these sources, not one of them: cite what it points at, or, where
the repo ships none of it, cite the flavour file and say so.

## What fighting the kit looks like

1. **Editing upstream-owned code.** A changed path that exists in the upstream tree is kit code (`git remote -v` for
   the Makerkit remote, then its tree; with none, `packages/**` minus paths the repo's own history added). Also a
   hand-edited generated file, or a migration already applied. Name the extension point the kit offers instead.
2. **Bypassing a kit primitive:** action clients, the route-handler wrapper, data and auth clients, the logger, the
   mailer, i18n, `@kit/ui`, forms.
3. **Re-implementing what the kit ships.** Search the kit before accepting anything new.
4. **Wrong layer:** business logic in actions rather than services; actions used for fetching; `server-only` or the
   client/server split missing; a new package for app-only code; files outside the kit's route layout.
5. **Breaking tenancy or authorization:** data not owned by an account or organization; authorization in the wrong
   layer for the flavour; a privileged client in a user flow.
6. **Skipping the flavour's schema workflow.**
7. **APIs or patterns the current kit version deprecated,** and the platform rules `AGENTS.md` adds (e.g. Cache
   Components).

Bugs, general quality and RLS isolation proofs belong to `/reviewer` and `/rls-review`, not here. When the change
touches the schema, recommend `/rls-review`.

## Running it

Split a large change by path across sub-agents, handing each the commands that reproduce its diff
(`git show <sha> -- <paths>`, a whole read of each new file), never the diff itself: pasting it pays for it twice.

## Report

```
Kit conformance: Supabase · <what was reviewed>
Verdict: CONFORMS | FIGHTS THE KIT
1. BLOCKING — apps/web/app/[locale]/home/(user)/notes/actions.ts:4 — raw 'use server' function with a manual getUser check
   Rule: packages/next/AGENTS.md — "ALWAYS use `authActionClient` for authenticated actions"
   Kit's way: authActionClient from @kit/next/safe-action — see packages/features/accounts/src/server/personal-accounts-server-actions.ts
2. SUGGESTION — …
Notes: source conflicts; checks skipped and why; /rls-review recommended or not.
```

A finding is **BLOCKING** when the change edits upstream-owned or generated code without need, loses a security
guarantee, breaks a MUST, ALWAYS or NEVER rule in an ADR or `AGENTS.md`, or uses a deprecated kit API. Anything else is
a **SUGGESTION**. The verdict is CONFORMS only when no finding is BLOCKING. The labels match final-review's, so its
phase 1 takes the findings as they are.
