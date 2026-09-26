---
name: makerkit-custom-domain-modeling
description: Build and sharpen a project's domain model. Use when discussing codebase terminology, or when a term, convention or decision needs recording in an AGENTS.md.
---

# Domain Modeling

Actively build and sharpen the project's domain model as you design. This is the *active* discipline: challenging terms,
inventing edge-case scenarios, and writing the vocabulary and decisions down the moment they crystallise. (Merely
*reading* the `AGENTS.md` files for vocabulary is not this skill: that's a one-line habit any skill can do. This skill
is for when you're changing the model, not just consuming it.)

## Where the model lives

This repo has no `CONTEXT.md` and no ADR directory. The domain model lives in the repo's **`AGENTS.md` distribution**: a
root file that maps the monorepo and holds cross-cutting rules, plus one per app and per package that owns its subtree.
Terms go in a `## Vocabulary` section and standing decisions in a `## Decisions` section of the owning file. Create each
section lazily, only when its first entry needs writing.

Derive the current set before writing — never work from a remembered list:

```sh
find . -name AGENTS.md -not -path '*/node_modules/*' | sort
```

**Pick the file that owns the concept.** A term or decision scoped to one package goes in that package's `AGENTS.md`.
Only genuinely cross-cutting ones — the account model, the TypeScript and React rules, the verification steps — go in
the root file. When a path has no `AGENTS.md` of its own, write to the nearest ancestor that does rather than creating a
new file; create one only when the subtree has accumulated enough of its own conventions to justify it, and add it to
the root file's monorepo table when you do.

## Entries stand alone

`.mysdd/` is working state that gets archived and deleted; `AGENTS.md` stays. So an entry never points into it: no issue
ID or path, no `US-NNN`, no spec path or feature directory, no "see the spec". State the term, or the decision and its
reasoning, in full, so the entry still reads correctly once everything under `.mysdd/` is gone. When a decision turns on
a secret, describe the secret's role, never its value.

This skill writes entries and never commits them. `/makerkit-custom-to-issues` commits them with the spec they came
from; `/makerkit-custom-implement` and `/makerkit-custom-final-review` commit a supersession with the code that needed
it.

## During the session

### Challenge against the existing vocabulary

When the user uses a term that conflicts with the language already in an `AGENTS.md`, call it out immediately. "The root
`AGENTS.md` calls that a team account, but you seem to mean a personal account. Which is it?"

### Challenge against recorded decisions

Decisions are binding. Read the `## Decisions` of **every** `AGENTS.md` owning code the design touches — for each
path, the nearest `AGENTS.md` at or above it, plus the root — not only the nearest one. When the design contradicts an
entry, don't silently override it. Flag it — _Contradicts **<entry statement>** in `<path>/AGENTS.md`, but worth
reopening because…_ — and ask whether to change the design or supersede the entry. The entry stands until the user
agrees to supersede it.

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

When a term is resolved, write it into the owning `AGENTS.md`'s `## Vocabulary` right there. Don't batch these up:
capture them as they happen.

```md
## Vocabulary

**Team account**: an account several users share, each through a membership carrying a role. Billing and data belong to
the account, not to any member.
_Avoid_: organisation, workspace
```

Add the `_Avoid_:` line only for synonyms people actually drift to. Keep entries free of implementation detail: a term
entry says what a thing **is**; the surrounding `AGENTS.md` sections already carry the how (imports, patterns, file
layout). Don't turn an `AGENTS.md` into a spec or a scratch pad.

### Record decisions sparingly

Only record a decision when all three are true:

1. **Hard to reverse**: the cost of changing your mind later is meaningful
2. **Surprising without context**: a future reader will look at the code and wonder "why did they do it this way?"
3. **The result of a real trade-off**: there were genuine alternatives and you picked one for specific reasons

If a decision is easy to reverse, skip it: you'll just reverse it. If it's not surprising, nobody will wonder why. If
there was no real alternative, there's nothing to record beyond "we did the obvious thing." Anything the verification
steps already enforce, a migration already states plainly, or you'd reverse without a second thought doesn't qualify
either.

What qualifies:

- **Architectural shape**: how a feature's data is modelled across accounts; server-rendered versus client-fetched when
  it isn't the obvious choice.
- **Integration patterns between packages**: "this feature talks to billing through its service, never its internals".
- **Technology choices that carry lock-in**: auth provider, mailer, analytics, deployment target — the ones that would
  take a quarter to swap out, not every library.
- **Boundary and scope decisions**, including the explicit no-s: "feature tables reference accounts by `account_id`
  only".
- **Deliberate deviations from the documented path**: anything against a rule already in an `AGENTS.md` — the admin
  client instead of the RLS-backed one, a route handler where a server action is idiomatic. These stop the next engineer
  "fixing" something deliberate.
- **Constraints not visible in the code**: compliance requirements, contractual response times, a partner API's limits.
- **Rejected alternatives when the rejection is non-obvious**, so nobody suggests them again in six months.

An entry is a bold one-line statement of what was decided, followed by one to three sentences of context and reasoning.
The value is in recording *that* a decision was made and *why*, not in filling out sections:

```md
## Decisions

**Transactional email is queued through an outbox table rather than sent inline.**
Calling `@kit/mailers` straight from a server action means a provider outage fails the user's request and loses the
mail. Writing the message to an `outbox` row and draining it from a scheduled worker costs a few seconds of delivery
latency and one more moving part, but makes retries and idempotency the database's job.
```

### Superseding and removing

Never delete a decision that reached the code: the fact that the old approach was tried is itself the useful part. Add
the new entry, and put `_Superseded by: **<new statement>**_` on its own line under the old one, naming the other file
when the new entry lives elsewhere. If nothing replaces it, say what holds now: `_Superseded: <what holds now>_`.

Remove an entry outright only with the user's agreement, and only when the decision never reached the code.
