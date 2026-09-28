---
name: modified-matt-domain-modeling
description: Build and sharpen a project's domain model. Use when discussing codebase terminology, writing or editing a CONTEXT.md, or recording, editing or superseding an ADR.
---

# Domain Modeling

Actively build and sharpen the project's domain model as you design. This is the *active* discipline: challenging terms, inventing edge-case scenarios, and writing the glossary and decisions down the moment they crystallise. (Merely *reading* the glossary and ADRs is not this skill: `.mysdd/docs/agents/domain.md` covers that. This skill is for when you're changing the model, not just consuming it.)

## File structure

Layout follows [./CONTEXT-FORMAT.md](./CONTEXT-FORMAT.md): a root `CONTEXT.md`, or a root `CONTEXT-MAP.md` pointing at per-context files. Decisions go one per file in `.mysdd/docs/adr/`, each scoped to the paths it binds, in the format of [ADR-FORMAT.md](./ADR-FORMAT.md). Create lazily — `CONTEXT.md` when the first term resolves, `.mysdd/docs/adr/` when the first ADR is needed.

Never record a term or a decision in `CLAUDE.md` or `AGENTS.md`: those files load into every session, so every entry there is a permanent context cost.

**Docs stand alone.** The glossary and the ADRs stay while feature directories under `.mysdd/features/` get archived and deleted, so neither points into one: no issue ID or path, no `US-NNN`, no spec path, no "see the spec". State the term, or the decision and its reasoning, in full. An ADR may cite another ADR by number and use glossary terms. When a decision turns on a secret, describe the secret's role, never its value.

This skill writes entries and never commits them. `/modified-matt-to-issues` commits them with the spec they came from; `/modified-matt-implement` and `/modified-matt-final-review` commit a supersession with the code that needed it.

## During the session

### Challenge against the glossary

When the user uses a term that conflicts with the existing language in `CONTEXT.md`, call it out immediately. "Your glossary defines 'cancellation' as X, but you seem to mean Y. Which is it?"

### Challenge against recorded decisions

ADRs are binding. Read the binding ones for the paths the design touches, per `.mysdd/docs/agents/domain.md`. When the design contradicts one, don't silently override it. Flag it — _Contradicts ADR-NNNN (<title>), but worth reopening because…_ — and ask whether to change the design or supersede the ADR. It stands until the user agrees to supersede it.

### Sharpen fuzzy language

When the user uses vague or overloaded terms, propose a precise canonical term. "You're saying 'account': do you mean the Customer or the User? Those are different things."

### Discuss concrete scenarios

When domain relationships are being discussed, stress-test them with specific scenarios. Invent scenarios that probe edge cases and force the user to be precise about the boundaries between concepts.

### Cross-reference with code

When the user states how something works, check whether the code agrees. If you find a contradiction, surface it: "Your code cancels entire Orders, but you just said partial cancellation is possible. Which is right?"

### Update CONTEXT.md inline

When a term is resolved, update `CONTEXT.md` right there. Don't batch these up: capture them as they happen. Use the format in [CONTEXT-FORMAT.md](./CONTEXT-FORMAT.md).

`CONTEXT.md` should be totally devoid of implementation details. Do not treat `CONTEXT.md` as a spec, a scratch pad, or a repository for implementation decisions. It is a glossary and nothing else.

### Offer ADRs sparingly

Only offer to create an ADR when all three are true:

1. **Hard to reverse**: the cost of changing your mind later is meaningful
2. **Surprising without context**: a future reader will wonder "why did they do it this way?"
3. **The result of a real trade-off**: there were genuine alternatives and you picked one for specific reasons

If a decision is easy to reverse, skip it: you'll just reverse it. If it's not surprising, nobody will wonder why. If there was no real alternative, there's nothing to record beyond "we did the obvious thing." [ADR-FORMAT.md](./ADR-FORMAT.md) lists what typically qualifies and how to set its `scope`.

### Superseding and removing

Never delete an ADR that reached the code: supersede it per [ADR-FORMAT.md](./ADR-FORMAT.md). Remove one outright only with the user's agreement, and only when the decision never reached the code.

**An agreed supersession outranks the spec.** Nothing edits a spec to catch up with the code, so once an ADR is superseded with the user's agreement — during implementation or final review, recorded in the issue's `comments` with its replacement — the spec's matching Implementation Decision or Decision log line is history, not a requirement. Review the code against the replacement, never against that spec line.
