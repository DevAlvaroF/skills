# Domain Docs

How the engineering skills consume this repo's glossary and decisions. Both live under `.mysdd/docs/`, which is
committed and outlives the feature directories under `.mysdd/features/`. `AGENTS.md` files hold conventions, never
terms or decisions: read every one from the repo root down to each directory you touch, in order — the root is already
loaded; read the rest directly, because not every agent loads nested files.

```
.mysdd/docs/
├── CONTEXT.md            the glossary, one for the whole repo
├── adr/0001-<slug>.md    one decision per file, scoped to the paths it binds
└── agents/domain.md      this file
```

## Before exploring, read these

- **`.mysdd/docs/CONTEXT.md`**, the glossary.
- **The binding ADRs** in `.mysdd/docs/adr/`: every ADR with no `scope` (or `scope` of `"/"`), plus every ADR with a
  `scope` entry matching a path you will touch. Skip any whose `status` begins `superseded`; read those only when
  reconciling decisions. An ADR with no frontmatter is repo-wide, and its status is its `**Status:**` line (`accepted`
  when there is none). This prints every ADR's whole frontmatter in one read, however long its `scope`, or a legacy
  ADR's `**Status:**` line. Pick the binding set from it and open only those in full:

  ```sh
  find .mysdd/docs/adr -maxdepth 1 -name '*.md' -exec awk '{ sub(/\r$/, "") }
    FNR == 1 { print "== " FILENAME; fm = hdr = ($0 ~ /^--- *$/); seen = 0; next }
    fm { if ($0 ~ /^--- *$/) fm = 0; else print; next }
    !hdr && !seen && /^\*\*Status:\*\*/ { print; seen = 1 }' {} + 2>/dev/null || true
  ```

  Only a `---` on an ADR's first line opens frontmatter, so a horizontal rule further down a legacy ADR is never
  mistaken for it. A bracketed segment such as `[locale]` is a literal route segment, not a glob character class.

If any of these don't exist, **proceed silently**. Don't flag their absence and don't suggest creating them upfront:
`makerkit-custom-domain-modeling` creates them lazily when terms or decisions actually get resolved.

## Use the glossary's vocabulary

When your output names a domain concept (an issue title, a refactor proposal, a hypothesis, a test name), use the term
as `CONTEXT.md` defines it. Don't drift to the synonyms it lists under `_Avoid_`.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't
use (reconsider) or there's a real gap (note it for `makerkit-custom-domain-modeling`).

## ADRs are binding

When your output contradicts an ADR in the binding set, don't silently override it. Flag it and ask the user whether to
change the plan or supersede the ADR:

> _Contradicts ADR-0007 (Admin pages use the service-role client), but worth reopening because…_

The ADR stands until the user agrees to supersede it, and `makerkit-custom-domain-modeling` does the superseding.
