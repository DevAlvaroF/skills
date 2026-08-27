# Vocabulary Format

Terms live in a `## Domain Vocabulary` section of the `AGENTS.md` that owns the concept. Create the section lazily: only when the first term is resolved.

## Structure

```md
## Domain Vocabulary

**Team account**:
A shared workspace with its own members, roles, and permissions. Owned data links to it via `account_id`.
_Avoid_: workspace, organization

**Personal account**:
An account whose id equals the `auth.users.id` of exactly one user. Has no members.
_Avoid_: user account, individual account

**Member**:
A user's membership row in a team account, carrying the role that permissions are derived from.
_Avoid_: collaborator, seat
```

## Rules

- **Be opinionated.** When multiple words exist for the same concept, pick the best one and list the others under `_Avoid_`.
- **Check existing usage before banning a word.** A word can already be doing legitimate work under a *different* concept elsewhere in the repo — e.g. "tenant" for the data-isolation property (RLS policies, `cross-tenant` checks) is compatible with "team account" as the product noun; banning "tenant" as a synonym for "team account" would silently contradict that other usage. Grep the `AGENTS.md` set and the codebase for a candidate `_Avoid_` word before adding it — if it's already load-bearing for something else, leave it out of the list.
- **Keep definitions tight.** One or two sentences max. Define what it IS, not what it does.
- **Only include terms specific to this project.** General programming concepts (timeouts, error types, utility patterns) don't belong even if the project uses them extensively. Framework nouns already documented elsewhere in the file (`authActionClient`, `enhanceRouteHandler`) belong in the pattern tables, not here. Before adding a term, ask: is this a concept unique to this project's domain, or a general one? Only the former belongs.
- **Group terms under sub-headings** when natural clusters emerge. If all terms belong to a single cohesive area, a flat list is fine.

## Choosing the file

Write the term into the `AGENTS.md` closest to the code that owns it:

- Cross-cutting terms (the account model, roles, permissions) → root `AGENTS.md`, near the existing **Multi-Tenant Architecture** section.
- Terms scoped to one surface → that package's or app's `AGENTS.md` (`packages/features/AGENTS.md`, `apps/web/supabase/AGENTS.md`, and so on).
- A path with no `AGENTS.md` → the nearest ancestor that has one. Only create a new file when the subtree has enough of its own conventions to justify it, and add it to the root file's monorepo table at the same time.

If it's unclear which file owns a term, ask rather than guessing — putting a package-scoped term in the root file dilutes both.
