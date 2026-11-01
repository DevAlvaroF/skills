# CONTEXT.md Format

The glossary is one file, `.mysdd/docs/CONTEXT.md`, for the whole repo. A TurboStarter repo is one domain, monorepo or not,
so there is no `CONTEXT-MAP.md` and no per-package glossary. Create it lazily, when the first term resolves.

## Structure

```md
# {Product name}

{One or two sentences on what the product is and who it's for.}

## Accounts

**Organization**:
A group of users, each through a membership carrying a role. Billing and data belong to the organization, not to any
member.
_Avoid_: team, workspace

**Seat**:
One paid place on an organization's subscription, held by one member at a time.
_Avoid_: licence, slot
```

## Rules

- **Be opinionated.** When several words exist for one concept, pick the best and list the rest under `_Avoid_` — but
  only the synonyms people actually drift to.
- **Keep definitions tight.** One or two sentences: what the thing **is**, not what it does or how it's built. Imports,
  patterns and file layout belong in the `AGENTS.md` files; decisions belong in ADRs.
- **Only terms specific to this project.** General programming concepts don't belong, however much the code uses them.
  A TurboStarter concept belongs only when this project uses it in a narrower or different sense than the kit's docs.
- **Group under subheadings** when clusters emerge — by area (Accounts, Billing) or by the app or package that owns
  them. A flat list is fine until then.
