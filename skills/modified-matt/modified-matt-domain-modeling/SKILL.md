---
name: modified-matt-domain-modeling
description: Builds and sharpens a project's domain model — the glossary, the ADRs and the one-line conventions an AGENTS.md carries. Use when discussing codebase terminology, writing or editing a CONTEXT.md, or recording, editing or superseding an ADR.
---

# Domain Modeling

Actively build and sharpen the project's domain model as you design. This is the *active* discipline: challenging terms, inventing edge-case scenarios, and writing the glossary and decisions down the moment they crystallise. (Merely *reading* the glossary and ADRs is not this skill: `.mysdd/docs/agents/domain.md` covers that.)

## Where the model lives

- **Glossary**: a root `CONTEXT.md`, or a root `CONTEXT-MAP.md` pointing at per-context files, in the format of [CONTEXT-FORMAT.md](./CONTEXT-FORMAT.md).
- **Decisions**: one ADR per file in `.mysdd/docs/adr/`, scoped to the paths it binds, in the format of [ADR-FORMAT.md](./ADR-FORMAT.md).

Create each lazily, when its first entry needs writing. If Git ignores the target, or you can't tell, write nothing and tell the user: an ignored doc never reaches the repo.

Never record a term or a decision in `CLAUDE.md` or `AGENTS.md`: they load into every session, so every entry is a permanent context cost.

**A convention is one line.** A rule that always applies and surprises nobody (name every hook `use…`) fails the ADR tests. Propose it as one imperative line, with no rationale, for the `AGENTS.md` that owns the area, and don't write it there yourself: it goes into the spec's Implementation Decisions (with no spec coming, hand it to the user), so it lands with the code of the first Issue that touches the area.

**Docs stand alone.** The glossary and the ADRs outlive the feature directories under `.mysdd/features/`, which get archived and deleted, so neither points into one: no issue ID or path, no `US-NNN`, no spec path, no "see the spec". State the term, or the decision and its reasoning, in full. An ADR may cite another ADR by number and use glossary terms. When a decision turns on a secret, describe its role, never its value.

This skill writes entries and never commits them: they're committed with the spec they came from, or with the code that needed a supersession.

## During the session

### Challenge against the glossary

When the user uses a term that conflicts with the existing language in `CONTEXT.md`, call it out immediately. "Your glossary defines 'cancellation' as X, but you seem to mean Y. Which is it?"

### Challenge against recorded decisions

ADRs are binding. Read the ones binding the paths the design touches, per `.mysdd/docs/agents/domain.md`. When the design contradicts one, don't silently override it. Flag it — _Contradicts ADR-NNNN (<title>), but worth reopening because…_ — and ask whether to change the design or supersede the ADR. It stands until the user agrees.

### Sharpen fuzzy language

When the user uses vague or overloaded terms, propose a precise canonical term. "You're saying 'account': do you mean the Customer or the User? Those are different things."

### Discuss concrete scenarios

Stress-test domain relationships with specific scenarios that probe edge cases and force the user to be precise about the boundaries between concepts.

### Cross-reference with code

When the user states how something works, check whether the code agrees. If you find a contradiction, surface it: "Your code cancels entire Orders, but you just said partial cancellation is possible. Which is right?"

### Update CONTEXT.md inline

When a term is resolved, update `CONTEXT.md` right there. Don't batch these up: capture them as they happen. `CONTEXT.md` is a glossary and nothing else: no implementation details, no spec, no scratch pad.

### Offer ADRs sparingly

Only offer to create an ADR when all three are true:

1. **Hard to reverse**: the cost of changing your mind later is meaningful
2. **Surprising without context**: a future reader will wonder "why did they do it this way?"
3. **The result of a real trade-off**: there were genuine alternatives and you picked one for specific reasons

If any of the three is missing, skip the ADR: you'd reverse it, nobody would wonder, or there's nothing to record.

### Superseding

Never delete an ADR that reached the code: supersede it per [ADR-FORMAT.md](./ADR-FORMAT.md), because what was tried is the useful part.

**An agreed supersession outranks the spec.** Nothing edits a spec to catch up with the code, so once the user agrees to supersede an ADR (recorded in the issue's `comments`), the spec's matching decision line is history: review the code against the replacement.
