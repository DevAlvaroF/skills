# CONTEXT.md Format

## Structure

```md
# {Context Name}

{One or two sentence description of what this context is and why it exists.}

## Language

**Order**:
{A one or two sentence description of the term}
_Avoid_: Purchase, transaction

**Invoice**:
A request for payment sent to a customer after delivery.
_Avoid_: Bill, payment request
```

## Rules

- **Be opinionated.** When multiple words exist for the same concept, pick the best one and list the others under `_Avoid_`.
- **Keep definitions tight.** One or two sentences: what it IS, not what it does. Implementation detail belongs in the code, decisions in ADRs.
- **Only terms specific to this project.** General programming concepts (timeouts, error types, utility patterns) don't belong, however much the project uses them.
- **Group terms under subheadings** when natural clusters emerge. A flat list is fine until then.

## Single vs multi-context repos

**Single context (most repos):** one `CONTEXT.md` at the repo root, created lazily when the first term resolves.

**Multiple contexts:** a `CONTEXT-MAP.md` at the repo root lists the contexts, where they live, and how they relate:

```md
# Context Map

## Contexts

- [Ordering](./src/ordering/CONTEXT.md): receives and tracks customer orders
- [Billing](./src/billing/CONTEXT.md): generates invoices and processes payments

## Relationships

- **Ordering → Billing**: Ordering emits `OrderPlaced` events; Billing consumes them to generate invoices
```

When `CONTEXT-MAP.md` exists, read it to find the contexts and infer which one the current topic belongs to. If unclear, ask.
