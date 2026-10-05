# ADR Format

ADRs live in `.mysdd/docs/adr/` at the repo root — one directory for the whole repo, even with several contexts — one decision per file, numbered `0001-slug.md`, `0002-slug.md`, … Create the directory lazily, when the first ADR is needed.

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

That's it. An ADR can be a single paragraph: the value is in recording _that_ a decision was made and _why_. Add **Considered Options** or **Consequences** only when the rejected alternatives or the downstream effects are worth remembering.

## Frontmatter

- **`status`** (required): `accepted`; `superseded by ADR-NNNN` once another ADR replaces it; or `superseded` when nothing does.
- **`scope`** (optional): the repo-root-relative paths or globs the decision binds. Omit it, or write `"/"`, for a repo-wide decision. Readers open an ADR only when its scope covers a path they touch, so scope it as narrowly as the decision genuinely holds: too wide and every session pays for it, too narrow and code it binds slips past. Quote each entry.

An older ADR with no frontmatter is repo-wide and keeps its status in a `**Status:**` line (`accepted` when there is none). Leave it as it is: `/modified-matt-setup-skills` offers to add frontmatter.

## Numbering

One more than the highest number in `.mysdd/docs/adr/` or ever committed there. Never reuse a removed ADR's number: its history still answers to it.

## Superseding and removing

Never delete an ADR that reached the code: the fact that the old approach was tried is itself the useful part. Write the replacement as a new ADR, then set the old one's `status` to `superseded by ADR-NNNN`; when nothing replaces it, `status: superseded` plus one line saying what holds now. Leave the old body as it was. On an older ADR, change its `**Status:**` line the same way.

Remove an ADR outright only with the user's agreement, and only when the decision never reached the code.

## What qualifies

The three tests in `SKILL.md` decide. Decisions that typically pass them:

- **Architectural shape**: "The write model is event-sourced, the read model is projected into Postgres."
- **Integration patterns between contexts**: "Ordering and Billing communicate via domain events, not synchronous HTTP."
- **Technology choices that carry lock-in**: the ones that would take a quarter to swap out, not every library.
- **Boundary and scope decisions**, including the explicit no-s: "other contexts reference a Customer by ID only."
- **Deliberate deviations from the obvious path**, which stop the next engineer "fixing" something deliberate.
- **Constraints not visible in the code**: compliance, a partner API's response-time contract.
- **Rejected alternatives when the rejection is non-obvious**, so nobody suggests them again in six months.

Anything verification already enforces, or you'd reverse without a second thought, doesn't qualify.
