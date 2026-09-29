---
name: makerkit-custom-to-spec
description: "Turns the current conversation into a spec and publishes it under .mysdd/features/, or reviews an existing spec adversarially with the user and edits it in place. Use when a design session is done and needs writing up as a spec, or when a spec needs a review before it is cut into issues."
disable-model-invocation: true
---

Turn the current conversation and what you know of the codebase into a spec. Don't interview the user for a new spec:
the design session already happened. If it isn't in this session's context, ask where it is rather than inventing a
decision log. Stop only to confirm the test boundaries and for a binding-ADR contradiction the conversation never
resolved. A spec that already exists is reviewed with the user instead (§ Reviewing an existing spec).

Read `.mysdd/issue-tracker.md` whole before writing anything: it defines the layout and modes used here. It must
hold exactly one `Tracker contract: 5` line; missing, lower or none → stop and tell the user to re-run
`/makerkit-custom-setup-skills`; higher → stop and tell them to run `npx skills update -p`.

## Ground yourself first

Before exploring, read the project's own documentation, because where it and this skill differ, the repo wins:

- every `AGENTS.md` from the repo root down to each directory the work touches, plus any a file on that chain routes a
  touched concern to — read them directly, since not every agent loads nested files;
- the glossary and the binding ADRs, per `.mysdd/docs/agents/domain.md`;
- the `README.md` of each app or package the feature involves;
- the Makerkit docs, through one sub-agent, per `.mysdd/docs/agents/domain.md` § Makerkit docs; synthesise whatever
  doesn't depend on its answer while it works.

## Process

1. Explore the repo until you understand its current state. Use the glossary's vocabulary throughout.
2. Sketch the boundaries the feature will be tested at: existing before new, as high and as few as possible — ideally
   one. Confirm them with the user.
3. Write the spec from the template below as `spec.md` in the Feature directory § Layout names, once § Committed or
   local resolves to a mode. A spec carries no status: `/makerkit-custom-to-issues` turns it into issues.

When the prompt gives you a `kanban-brief: <id>` line, put it on its own line directly below the spec's title and keep
a matching one already there: prompt-kanban binds the spec to its Brief by that line. A marker naming another id, or a
malformed one, is a conflict to report, never to overwrite.

Don't commit the spec: in committed mode the `SPEC:` commit of `/makerkit-custom-to-issues` carries it with its
issues, and in local mode it is never committed.

<spec-template>

## Problem Statement

The problem the user faces, from the user's perspective.

## Solution

The solution, from the user's perspective.

## User Stories

An extensive list covering every aspect of the feature, each with a stable ID:

- **US-001** — As a mobile bank customer, I want to see balance on my accounts, so that I can make better informed
  decisions about my spending

A `US-NNN` is immutable once written, because issues address stories by it in `covers`. A new story takes the highest
existing ID + 1; a dropped story stays in the list marked `(retired)`, its ID never reused, renumbered or merged.

## Implementation Decisions

Modules built or changed and their interfaces, schema changes, API contracts, architectural decisions, specific
interactions, the developer's clarifications, and each convention line or routing row agreed for an `AGENTS.md`,
verbatim, naming that `AGENTS.md`. Aim each module deep: a small interface over a lot of
behaviour (`/makerkit-custom-tdd` has the rest).

No file paths or code snippets: they go stale fast. The exception is a prototype snippet that encodes a decision more
precisely than prose (state machine, reducer, schema, type shape), trimmed to the decision and noted as from a
prototype.

## Testing Decisions

What makes a good test here (external behaviour, not implementation details), which modules are tested, and the prior
art: actual similar tests in this codebase, or a statement that none exist and the new boundary agreed in step 2.

## Out of Scope

What this spec excludes.

## Further Notes

Anything else.

## Decision log

A redacted summary, in your own words, of the decisions, constraints and rejected alternatives that shaped the spec,
and why — never the raw conversation. It reaches git history for good, so leave out secrets, credentials, tokens,
connection strings, customer data, PII and unrelated conversation; where a decision turns on a sensitive value,
describe its role instead. Name each ADR the design supersedes (ADR-NNNN, <title>): `/makerkit-custom-to-issues`
reads this log to keep `.mysdd/docs/adr/` in step.

</spec-template>

## Before you publish

Any "no" is a fix, not a caveat:

- Every story has a `US-NNN`, none renumbered or reused, each describing observable behaviour.
- Testing Decisions holds the confirmed boundaries and real prior art, or says there is none.
- Out of Scope is non-empty: a spec that excludes nothing hasn't been scoped.
- The Decision log is redacted, and no path or snippet appears beyond the exceptions above.
- No decision contradicts a live binding ADR; one the user agreed to supersede already reads `superseded`.

## Reviewing an existing spec

When the spec already exists, review that `spec.md` adversarially and edit it in place, grounded as above and once
the mode resolves. Find what is
underspecified, what contradicts itself or a binding ADR, and what it decided without saying so, and cut what isn't
needed. Interview the user about every gap and open decision rather than guessing: a guessed answer becomes a decision
nobody made.

- Never delete the User Stories section or renumber a `US-NNN`: issues address stories by ID. Retire a story instead.
- Only append to the Decision log, redacted like the rest: earlier entries are the record of what was decided.
- Keep any `kanban-brief:` line as it is.
- Implement nothing.
- Finish only when the spec passes § Before you publish, confirming its test boundaries with the user if they never
  were.

Leave the edit uncommitted: in committed mode the `SPEC:` commit of `/makerkit-custom-to-issues` carries it.
