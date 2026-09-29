---
name: modified-matt-to-spec
description: "Turns the current conversation into a spec under .mysdd/features/, or reviews an existing spec adversarially with the user and edits it in place. Use when a design session is done and needs writing up as a spec, or when a spec needs a review before it is cut into issues."
disable-model-invocation: true
---

Turn the current conversation and your understanding of the codebase into a spec. For a new spec, don't interview the
user: synthesise what was already decided. If the design conversation isn't in this session, say so and ask where it
is rather than inventing a decision log. A spec that already exists is reviewed instead: see § Reviewing an existing
spec.

## Process

1. Read `.mysdd/issue-tracker.md` whole; it must hold exactly one `Tracker contract: 5` line: with none (or no file)
   or a lower number, stop and tell the user to re-run `/modified-matt-setup-skills`; with a higher one, stop and tell
   them to run `npx skills update -p`. Its § Layout and § Committed or local decide where the spec goes and whether it
   may be written at all.
2. Explore the repo. Read the glossary and the binding ADRs for the paths you touch, per
   `.mysdd/docs/agents/domain.md`, and use the glossary's vocabulary. The one thing to stop and ask about is a
   contradiction with a binding ADR the conversation never resolved: a spec can't quietly overrule a recorded decision.
3. Sketch the boundaries you'll test at. Prefer existing ones, and the highest one possible; the fewer across the
   codebase the better, ideally one. Check with the user that they match their expectations.
4. Write the spec from the template below as `spec.md` in a new Feature directory, named and numbered per § Layout.
   If § Committed or local leaves the mode unresolved, write nothing and say why. A spec carries no status and this
   skill makes no commit: `/modified-matt-to-issues` cuts it into issues, and its `SPEC:` commit carries the spec.

When the prompt gives you a `kanban-brief: <id>` line, put it on its own line directly under the spec's title, exactly
as given, and keep a matching one that's already there: prompt-kanban binds the Brief to the spec by that line. If a
marker names another Brief or is malformed, report the conflict rather than overwrite it.

<spec-template>

## Problem Statement

The problem the user faces, from the user's perspective.

## Solution

The solution, from the user's perspective.

## User Stories

A long, extensive list covering every aspect of the feature, each with a stable ID:

- **US-001** — As a mobile bank customer, I want to see balance on my accounts, so that I can make better informed
  decisions about my spending

A `US-NNN` is immutable once written, because issues address stories by it in `covers`. Never renumber or reuse one:
a new story takes the highest ID + 1, and a dropped story stays in the list under its ID, marked `(retired)`.

## Implementation Decisions

The decisions made: modules built or changed and their interfaces, architecture, schema changes, API contracts,
specific interactions, technical clarifications, and `AGENTS.md` convention lines agreed (one imperative line each,
verbatim, naming the `AGENTS.md` it goes in). Aim each module deep, a small interface over a lot of behaviour
(`/modified-matt-tdd` has more).

No file paths or code snippets: they go stale fast. The exception is a prototype snippet that encodes a decision more
precisely than prose (a state machine, reducer, schema, type shape): inline its decision-rich part and say it came from
a prototype.

## Testing Decisions

What makes a good test here (external behaviour, not implementation details), which modules are tested, and prior art:
similar tests in this codebase, or a statement that none exist plus the new boundary agreed in step 3.

## Out of Scope

What this spec excludes.

## Further Notes

Anything else.

## Decision log

A redacted summary, in your own words, of the decisions, constraints and rejected alternatives that shaped the spec,
and why. Never a transcript. It reaches git history through the `SPEC:` and `Spec:`-trailered commits, so leave out
secrets, credentials, tokens, connection strings, customer data, PII and anything unrelated; describe a sensitive
value's role without reproducing it. Name any ADR the design supersedes (ADR-NNNN, title): `/modified-matt-to-issues`
keeps `.mysdd/docs/adr/` in step from this log.

</spec-template>

## Before you publish

Any "no" is a fix, not a caveat:

- Every story has a `US-NNN`, none renumbered or reused, and each describes externally observable behaviour.
- Testing Decisions holds the boundaries the user confirmed, and names real prior art or says there is none.
- Out of Scope is non-empty: a spec that excludes nothing hasn't been scoped.
- The Decision log is a redacted summary with no secrets, PII or raw transcript.
- No Implementation Decision contradicts a live binding ADR; one the user agreed to supersede already reads
  `superseded` and is named in the Decision log.
- No paths or snippets beyond a prototype snippet and the `AGENTS.md` a convention line goes in.

## Reviewing an existing spec

When the spec already exists, review that `spec.md` adversarially with the user and edit it in place; don't write a new
one. Do steps 1 and 2 first, and stop if the mode is unresolved. Find what is underspecified, what contradicts itself or
a binding ADR, and what it has decided without saying so, and cut what isn't needed. Interview the user about every gap
and open decision rather than guess: a guessed answer becomes a requirement nobody agreed to.

- Never delete the User Stories section or renumber a `US-NNN`; retire a story instead, because issues point at it.
- Only append to the Decision log, redacted like the rest: earlier entries are the record of why.
- Keep any `kanban-brief:` line as it is.
- Implement nothing.

Before you finish, the spec passes § Before you publish, with its test boundaries confirmed by the user. Leave the edit
uncommitted: the `SPEC:` commit of `/modified-matt-to-issues` carries it.
