# ADR Format

ADRs live in `.mysdd/docs/adr/`, one directory for the whole repo, one decision per file: `0001-slug.md`,
`0002-slug.md`, … Create the directory lazily, when the first ADR is needed. Number a new ADR as the highest `NNNN`
there or ever committed there (`git log --format= --name-only --no-renames --diff-filter=A -- .mysdd/docs/adr/`) + 1. Never reuse a number, not even a removed ADR's: the
history is what remembers a removed one.

## Template

The example is a Supabase-kit decision:

```md
---
status: accepted
scope:
  - "apps/web/app/[locale]/admin/**"
  - "packages/supabase/**"
---

# Admin pages use the service-role client, never the RLS-backed one

{1–3 sentences: the context, what was decided, and why.}
```

That's it. An ADR can be a single paragraph: the value is in recording *that* a decision was made and *why*, not in
filling out sections. Add **Considered Options** or **Consequences** only when the rejected alternatives or the
downstream effects are worth remembering.

## Frontmatter

- **`status`** (required): `accepted`; `superseded by ADR-NNNN` once another ADR replaces it; or `superseded` when
  nothing does.
- **`scope`** (optional): the repo-root-relative paths or globs the decision binds. Omit it, or write `"/"`, for a
  repo-wide decision. Consumers read an ADR only when its scope covers a path they touch, so scope it as narrowly as the
  decision genuinely holds: too wide and every session pays for it, too narrow and code it binds slips past. Quote each
  entry. Brackets are literal Next.js route segments, not glob character classes.

## Superseding and removing

Never delete an ADR that reached the code: the fact that the old approach was tried is itself the useful part. Write
the replacement as a new ADR, then set the old one's `status` to `superseded by ADR-NNNN`. When nothing replaces it,
set `status: superseded` and add one line saying what holds now. Leave the old body as it was. An older ADR with no
frontmatter is repo-wide and keeps its status in a `**Status:**` line: change that line the same way.

Remove an ADR outright only with the user's agreement, and only when the decision never reached the code.

## What qualifies

The three tests in `SKILL.md` decide. Decisions that typically pass them:

- **Architectural shape**: how a feature's data is modelled across accounts; server-rendered versus client-fetched when
  it isn't the obvious choice.
- **Integration patterns between packages**: "this feature talks to billing through its service, never its internals".
- **Technology choices that carry lock-in**: auth provider, mailer, analytics, deployment target — the ones that would
  take a quarter to swap out, not every library.
- **Boundary and scope decisions**, including the explicit no-s: "feature tables reference accounts by `account_id`
  only".
- **Deliberate deviations from the documented path**: anything against a rule in an `AGENTS.md` or the Makerkit docs —
  on the Supabase kit, the admin client instead of the RLS-backed one; a route handler where a server action is
  idiomatic. These stop the next engineer "fixing" something deliberate.
- **Constraints not visible in the code**: compliance requirements, contractual response times, a partner API's limits.
- **Rejected alternatives when the rejection is non-obvious**, so nobody suggests them again in six months.

Anything the verification steps already enforce, a migration already states plainly, or you'd reverse without a second
thought doesn't qualify.
