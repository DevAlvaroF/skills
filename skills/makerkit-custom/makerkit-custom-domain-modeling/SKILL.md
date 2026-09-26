---
name: makerkit-custom-domain-modeling
description: Build and sharpen a project's domain model. Use when discussing codebase terminology, writing or editing .mysdd/docs/CONTEXT.md, or recording or superseding an ADR in .mysdd/docs/adr/.
---

# Domain Modeling

Actively build and sharpen the project's domain model as you design. This is the *active* discipline: challenging terms,
inventing edge-case scenarios, and writing the vocabulary and decisions down the moment they crystallise. (Merely
*reading* the glossary and ADRs is not this skill: `.mysdd/docs/agents/domain.md` covers that. This skill is for when
you're changing the model, not just consuming it.)

## Where the model lives

- **Glossary**: `.mysdd/docs/CONTEXT.md`, one for the whole repo, in the format of [CONTEXT-FORMAT.md](./CONTEXT-FORMAT.md).
- **Decisions**: one ADR per file in `.mysdd/docs/adr/`, each scoped to the paths it binds, in the format of
  [ADR-FORMAT.md](./ADR-FORMAT.md).

Create each lazily, when its first entry needs writing. Never record a term or a decision in an `AGENTS.md`: those files
load into every session, so they keep only the conventions, the monorepo map and the verification steps every session
needs.

**Docs stand alone.** `.mysdd/docs/` stays while the feature directories under `.mysdd/features/` get archived and
deleted, so nothing under it points into one: no issue ID or path, no `US-NNN`, no spec path, no "see the spec". State
the term, or the decision and its reasoning, in full. An ADR may cite another ADR by number and use glossary terms.
When a decision turns on a secret, describe the secret's role, never its value.

This skill writes entries and never commits them. `/makerkit-custom-to-issues` commits them with the spec they came
from; `/makerkit-custom-implement` and `/makerkit-custom-final-review` commit a supersession with the code that needed
it.

## During the session

### Challenge against the glossary

When the user uses a term that conflicts with the language in `CONTEXT.md`, call it out immediately. "The glossary calls
that a team account, but you seem to mean a personal account. Which is it?"

### Challenge against recorded decisions

ADRs are binding. Read every one whose `scope` covers a path the design touches, per `.mysdd/docs/agents/domain.md`.
When the design contradicts one, don't silently override it. Flag it — _Contradicts ADR-NNNN (<title>), but worth
reopening because…_ — and ask whether to change the design or supersede the ADR. It stands until the user agrees to
supersede it.

### Sharpen fuzzy language

When the user uses vague or overloaded terms, propose a precise canonical term. "You're saying 'user': do you mean the
`auth.users` row or the `accounts` row? In a personal account they share an id, but they're different things."

### Discuss concrete scenarios

When domain relationships are being discussed, stress-test them with specific scenarios. Invent scenarios that probe
edge cases and force the user to be precise about the boundaries between concepts — especially across the personal/team
account split, role and permission checks, and what RLS does or doesn't enforce.

### Cross-reference with code

When the user states how something works, check whether the code agrees. Schema and policies under `apps/web/supabase/`
are the ground truth for the data model. If you find a contradiction, surface it: "Your policy scopes this to
`account_id`, but you just said members of the parent account can read it. Which is right?" Learn from the coding
patterns and from the code itself.

### Record terms inline

When a term is resolved, write it into `CONTEXT.md` right there. Don't batch these up: capture them as they happen. The
glossary says what a thing **is**; don't turn it into a spec or a scratch pad.

### Record decisions sparingly

Only write an ADR when all three are true:

1. **Hard to reverse**: the cost of changing your mind later is meaningful
2. **Surprising without context**: a future reader will look at the code and wonder "why did they do it this way?"
3. **The result of a real trade-off**: there were genuine alternatives and you picked one for specific reasons

If any of the three is missing, skip it. [ADR-FORMAT.md](./ADR-FORMAT.md) lists what typically qualifies and how to set
its `scope`.

### Superseding and removing

Never delete an ADR that reached the code: supersede it per [ADR-FORMAT.md](./ADR-FORMAT.md). Remove one outright only
with the user's agreement, and only when the decision never reached the code.

**An agreed supersession outranks the spec.** Nothing edits a spec to catch up with the code, so once an ADR is
superseded with the user's agreement — during implementation or final review, recorded in the issue's `comments` with
its replacement — the spec's matching Implementation Decision or Decision log line is history, not a requirement.
Review the code against the replacement, never against that spec line.
