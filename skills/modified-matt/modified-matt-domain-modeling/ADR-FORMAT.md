# ADR Format

ADRs live in `.mysdd/docs/adr/` at the repo root — one directory for the whole repo, including multi-context repos — one decision per file, with sequential numbering: `0001-slug.md`, `0002-slug.md`, etc.

Create the `.mysdd/docs/adr/` directory lazily: only when the first ADR is needed.

## Template

```md
---
status: accepted
scope:
  - "src/billing/**"
  - "src/shared/money.ts"
---

# {Short title of the decision}

{1-3 sentences: what's the context, what did we decide, and why.}
```

That's it. An ADR can be a single paragraph. The value is in recording *that* a decision was made and *why*, not in filling out sections.

## Frontmatter

- **`status`** (required): `accepted`; `superseded by ADR-NNNN` once another ADR replaces it; or `superseded` when nothing does.
- **`scope`** (optional): the repo-root-relative paths or globs the decision binds. Omit it, or write `"/"`, for a repo-wide decision. Consumers read an ADR only when its scope covers a path they touch, so scope it as narrowly as the decision genuinely holds: too wide and every session pays for it, too narrow and code it binds slips past. Quote each entry.

**Older ADRs** may have no frontmatter. Treat one as repo-wide, and read its status from a `**Status:**` line in the body (`accepted` when there is none). `/modified-matt-setup-skills` offers to add the frontmatter; nothing adds it silently.

## Optional sections

Only include these when they add genuine value. Most ADRs won't need them.

- **Considered Options**: only when the rejected alternatives are worth remembering
- **Consequences**: only when non-obvious downstream effects need to be called out

## Numbering

Take the highest number among the ADRs in `.mysdd/docs/adr/` and every ADR ever committed there (`git log --format= --name-only --no-renames --diff-filter=A -- .mysdd/docs/adr/`), and increment by one. Never reuse a number, not even a removed ADR's: the history is what remembers a removed one.

## Superseding and removing

Never delete an ADR that reached the code: the fact that the old approach was tried is itself the useful part. Write the replacement as a new ADR, then set the old one's `status` to `superseded by ADR-NNNN`. When nothing replaces it, set `status: superseded` and add one line saying what holds now. Leave the old body as it was. On an older ADR without frontmatter, change its `**Status:**` line the same way.

Remove an ADR outright only with the user's agreement, and only when the decision never reached the code.

## What qualifies

The three tests in `SKILL.md` decide. Decisions that typically pass them:

- **Architectural shape.** "We're using a monorepo." "The write model is event-sourced, the read model is projected into Postgres."
- **Integration patterns between contexts.** "Ordering and Billing communicate via domain events, not synchronous HTTP."
- **Technology choices that carry lock-in.** Database, message bus, auth provider, deployment target. Not every library: just the ones that would take a quarter to swap out.
- **Boundary and scope decisions.** "Customer data is owned by the Customer context; other contexts reference it by ID only." The explicit no-s are as valuable as the yes-s.
- **Deliberate deviations from the obvious path.** "We're using manual SQL instead of an ORM because X." Anything where a reasonable reader would assume the opposite. These stop the next engineer from "fixing" something that was deliberate.
- **Constraints not visible in the code.** "We can't use AWS because of compliance requirements." "Response times must be under 200ms because of the partner API contract."
- **Rejected alternatives when the rejection is non-obvious.** If you considered GraphQL and picked REST for subtle reasons, record it; otherwise someone will suggest GraphQL again in six months.

Anything verification already enforces, or you'd reverse without a second thought, doesn't qualify.
