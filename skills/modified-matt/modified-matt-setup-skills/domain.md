# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root, or
- **`CONTEXT-MAP.md`** at the repo root if it exists: it points at one `CONTEXT.md` per context. Read each one relevant to the topic.
- **The binding ADRs** in `.mysdd/docs/adr/` (one directory for the whole repo, including multi-context repos): every ADR with no `scope` (or a `scope` of `"/"`), plus every ADR with a `scope` entry matching a path you will touch. Skip any whose `status` begins `superseded`; read those only when reconciling decisions. An ADR with no frontmatter is repo-wide, and its status is its `**Status:**` line (`accepted` when there is none).

  Read every ADR's frontmatter first — only a `---` on its first line opens it — and open only the binding ones in full.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The domain-modeling skill (reached via `/modified-matt-grill-with-docs`) creates them lazily when terms or decisions actually get resolved.

## File structure

Single-context repo (most repos):

```
/
├── CONTEXT.md
├── .mysdd/
│   └── docs/
│       └── adr/
│           ├── 0001-event-sourced-orders.md
│           └── 0002-postgres-for-write-model.md
└── src/
```

Multi-context repo (presence of `CONTEXT-MAP.md` at the root):

```
/
├── CONTEXT-MAP.md
├── .mysdd/
│   └── docs/
│       └── adr/        ← all decisions, whichever context they belong to
└── src/
    ├── ordering/
    │   └── CONTEXT.md
    └── billing/
        └── CONTEXT.md
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for the domain-modeling skill).

## ADRs are binding

Within its scope, a binding ADR overrides the `AGENTS.md` rule it deviates from.

When your output contradicts an ADR in the binding set, don't silently override it. Flag it and ask the user whether to change the plan or supersede the ADR:

> _Contradicts ADR-0007 (event-sourced orders), but worth reopening because…_

The ADR stands until the user agrees to supersede it, and `modified-matt-domain-modeling` does the superseding.
