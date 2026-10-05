# Domain Docs

How the engineering skills consume this repo's glossary and decisions. Both live under `.mysdd/docs/`, which is
committed and outlives the feature directories under `.mysdd/features/`. `AGENTS.md` files hold conventions, never
terms or decisions; the first bullet of § Ground yourself first says which to read.

```
.mysdd/docs/
├── CONTEXT.md            the glossary, one for the whole repo
├── adr/0001-<slug>.md    one decision per file, scoped to the paths it binds
└── agents/domain.md      this file
```

## Ground yourself first

Grill, to-spec, to-issues and implement send you here before they start. Read the project's own documentation:

- every `AGENTS.md` from the repo root down to each directory the work touches, in order (e.g., `AGENTS.md`, then
  `apps/web/AGENTS.md`, then `apps/web/app/[locale]/admin/AGENTS.md`), including each one's `## Skills` and any
  verification it adds, plus every `AGENTS.md` a file on that chain routes a touched concern to (e.g., on the Supabase
  kit, the root's Key Patterns table routes server actions to `packages/next/AGENTS.md` and the admin client to
  `packages/supabase/AGENTS.md`). The root file is already loaded; read the rest directly, because not every agent
  loads nested files. Add any vendored Next.js docs for anything Next.js. They're small and targeted. Where they and
  the skill you are running differ, **follow the repo**.
- the glossary and the ADRs whose `scope` covers the touched paths, per § Before exploring, read these. ADRs are
  binding.
- the `README.md` of each app or package **actually involved** (`apps/*/README.md`, `packages/*/README.md`) — what that
  piece is and how it fits. Read directly, and only for the pieces the feature touches.
- the Makerkit docs under `docs/`, through a sub-agent, per § Makerkit docs.

## Makerkit docs

`docs/` is upstream Makerkit's product documentation when it holds `.mdoc` files, often 150+; if it is missing or
holds none, skip this. Never walk it in your own context: it would crowd out the work. Dispatch one sub-agent, name the
one or two topic directories the work touches (e.g., `docs/billing`, `docs/security`), and ask how the feature is
_meant_ to work there, answered briefly with the doc paths it relied on. Where its answer and the repo differ, follow
the repo.

Don't block on it: carry on with whatever doesn't depend on its answer — the frontier questions in a grilling, the
slices or spec sections it can't change, the implementation parts it can't touch — and pick the rest up when it
reports. Never hand a part that depends on its answer to another sub-agent before the answer is in.

## Before exploring, read these

- **`.mysdd/docs/CONTEXT.md`**, the glossary.
- **The binding ADRs** in `.mysdd/docs/adr/`: every ADR with no `scope` (or `scope` of `"/"`), plus every ADR with a
  `scope` entry matching a path you will touch. Skip any whose `status` begins `superseded`; read those only when
  reconciling decisions. An ADR with no frontmatter is repo-wide, and its status is its `**Status:**` line (`accepted`
  when there is none). Read every ADR's frontmatter first — only a `---` on its first line opens it — and open only
  the binding ones in full. A bracketed `scope` segment such as `[locale]` is a literal route segment, not a glob
  class.

If any of these don't exist, **proceed silently**. Don't flag their absence and don't suggest creating them upfront:
`makerkit-custom-domain-modeling` creates them lazily when terms or decisions actually get resolved.

## Use the glossary's vocabulary

When your output names a domain concept (an issue title, a refactor proposal, a hypothesis, a test name), use the term
as `CONTEXT.md` defines it. Don't drift to the synonyms it lists under `_Avoid_`.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't
use (reconsider) or there's a real gap (note it for `makerkit-custom-domain-modeling`).

## ADRs are binding

Within its scope, a binding ADR overrides the `AGENTS.md` rule it deviates from.

When your output contradicts an ADR in the binding set, don't silently override it. Flag it and ask the user whether to
change the plan or supersede the ADR:

> _Contradicts ADR-0007 (Admin pages use the service-role client), but worth reopening because…_

The ADR stands until the user agrees to supersede it, and `makerkit-custom-domain-modeling` does the superseding.
