# ADR Format

ADRs live in `.mysdd/docs/adr/`, one directory for the whole repo, one decision per file: `0001-slug.md`,
`0002-slug.md`, … Create the directory lazily, when the first ADR is needed. Number a new ADR one more than the highest
number there or ever committed there; never reuse a removed ADR's number, because its history still answers to it.

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

An ADR can be a single paragraph: the value is in recording _that_ a decision was made and _why_. Add **Considered
Options** or **Consequences** only when they're worth remembering.

## Frontmatter

- **`status`** (required): `accepted`; `superseded by ADR-NNNN` once another ADR replaces it; or `superseded` when
  nothing does.
- **`scope`** (optional): the repo-root-relative paths or globs the decision binds. Omit it, or write `"/"`, for a
  repo-wide decision. Readers open an ADR only when its scope covers a path they touch, so scope it as narrowly as the
  decision genuinely holds: too wide and every session pays for it, too narrow and code it binds slips past. Quote each
  entry. Brackets are literal Next.js route segments, not glob character classes.

An older ADR with no frontmatter is repo-wide and keeps its status in a `**Status:**` line (`accepted` when there is
none).

## Superseding and removing

Never delete an ADR that reached the code: the fact that the old approach was tried is itself the useful part. Write
the replacement as a new ADR, then set the old one's `status` to `superseded by ADR-NNNN`; when nothing replaces it,
`status: superseded` plus one line saying what holds now. Leave the old body as it was. On an older ADR, change its
`**Status:**` line the same way.

Remove an ADR outright only with the user's agreement, and only when the decision never reached the code.

## What qualifies

The three tests in `SKILL.md` decide. Decisions that typically pass them:

- **Architectural shape**: how a feature's data is modelled across accounts.
- **Integration patterns between packages**: "this feature talks to billing through its service, never its internals".
- **Technology choices that carry lock-in**: auth provider, mailer, deployment target — not every library.
- **Boundary and scope decisions**, including the explicit no-s: "feature tables reference accounts by `account_id`
  only".
- **Deliberate deviations from the documented path**: anything against a rule in an `AGENTS.md` or the Makerkit docs —
  a route handler where a server action is idiomatic. These stop the next engineer "fixing" something deliberate.
- **Constraints not visible in the code**: compliance requirements, a partner API's limits.
- **Rejected alternatives when the rejection is non-obvious**, so nobody suggests them again in six months.

Anything the verification steps already enforce, a migration already states plainly, or you'd reverse without a second
thought doesn't qualify.
