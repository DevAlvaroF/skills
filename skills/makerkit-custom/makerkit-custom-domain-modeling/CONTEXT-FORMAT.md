# CONTEXT.md Format

The glossary is one file, `.mysdd/docs/CONTEXT.md`, for the whole repo. A Makerkit monorepo is one domain, so there is
no `CONTEXT-MAP.md` and no per-package glossary. Create it lazily, when the first term resolves.

## Structure

```md
# {Product name}

{One or two sentences on what the product is and who it's for.}

## Accounts

**Team account**:
An account several users share, each through a membership carrying a role. Billing and data belong to the account,
not to any member.
_Avoid_: organisation, workspace

**Seat**:
One paid place on a team account's subscription, held by one member at a time.
_Avoid_: licence, slot
```

## Rules

- **Be opinionated.** When several words exist for one concept, pick the best and list the rest under `_Avoid_` — but
  only the synonyms people actually drift to.
- **Keep definitions tight.** One or two sentences: what the thing **is**, not what it does or how it's built. Imports,
  patterns and file layout belong in the `AGENTS.md` files; decisions belong in ADRs.
- **Only terms specific to this project.** General programming concepts don't belong, however much the code uses them.
  A Makerkit concept belongs only when this project uses it in a narrower or different sense than Makerkit's docs.
- **Group under subheadings** when clusters emerge — by area (Accounts, Billing) or by the app or package that owns
  them. A flat list is fine until then.
