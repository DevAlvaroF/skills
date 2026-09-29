---
name: modified-matt-to-spec
description: "Turns the current conversation into a spec and publishes it under .mysdd/features/, or reviews an existing spec adversarially with the user and edits it in place. Use when a design session is done and needs writing up as a spec, or when a spec needs a review before it is cut into issues."
disable-model-invocation: true
---

This skill takes the current conversation context and codebase understanding and produces a spec.
Do NOT interview the user when writing a new spec; just synthesize what you already know. If the design conversation
isn't in this session's context, say so and ask the user to point you at it rather than inventing a decision log.
Beyond confirming the test boundaries in step 2, the one thing to stop and ask about is a contradiction with a binding
ADR that the conversation never resolved. A spec that already exists is reviewed instead, with the user: see
§ Reviewing an existing spec.

## Process

1. Explore the repo to understand the current state of the codebase, if you haven't already. Read the glossary and the
   binding ADRs for the paths you touch, per `.mysdd/docs/agents/domain.md`. ADRs are binding. Use the glossary's
   vocabulary throughout the spec.

   **Read `.mysdd/issue-tracker.md` before you write anything:** its contract line and its Contents row for spec, then
   those sections in full, by the commands its § Contents gives, never the whole file. The file is the contract. This
   skill does not restate it. If the file is missing, stop and tell the user to run `/modified-matt-setup-skills`. Check
   its contract line with `sh "<this skill's directory>/scripts/check-tracker-contract.sh" 4`. If it exits non-zero,
   write nothing and relay its message: on exit 1 the tracker is behind, so have the user re-run
   `/modified-matt-setup-skills`; on exit 3 the skills are behind, so have them run `npx skills update -p`, and update
   the app too if its prompt named a lower number; on any other exit, report the error.

2. Sketch out the boundaries at which you're going to test the feature. Existing boundaries should be preferred to new
   ones. Use the highest boundary possible. If new boundaries are needed, propose them at the highest point you can. The
   fewer boundaries across the codebase, the better - the ideal number is one.

Check with the user that these boundaries match their expectations.

3. Write the spec using the template below, then publish it as `spec.md` under the feature's
   `.mysdd/features/<NN>-<feature-slug>/` directory, after running the tracker's ignore probe
   (`.mysdd/issue-tracker.md` § Ignore policy) on that path. A spec is prose, not an issue, so it carries no status;
   the `/modified-matt-to-issues` skill is what turns it into `ready-for-agent` issues.

<spec-template>

## Problem Statement

The problem that the user is facing, from the user's perspective.

## Solution

The solution to the problem, from the user's perspective.

## User Stories

A LONG list of user stories, each carrying a stable ID. Each user story should be in the format of:

- **US-NNN** — As an <actor>, I want a <feature>, so that <benefit>

<user-story-example>
- **US-001** — As a mobile bank customer, I want to see balance on my accounts, so that I can make better informed decisions about my spending
</user-story-example>

This list of user stories should be extremely extensive and cover all aspects of the feature.

Each story's `US-NNN` is **immutable once written**. Never renumber a story and never reuse a retired ID:
downstream issues reference these IDs in their `covers` field, so an ID is an address, not a position in the
running order. On a later revision a new story takes the highest existing ID + 1, wherever it sits in the list,
and a dropped story leaves its ID retired, not recycled.
A dropped story stays in the list under its own ID, marked `(retired)`: never delete it or merge it into another.

## Implementation Decisions

A list of implementation decisions that were made. This can include:

- The modules that will be built/modified
- The interfaces of those modules that will be modified
- Convention lines agreed for an `AGENTS.md`, one imperative line each, verbatim, naming the `AGENTS.md` it goes in
- Technical clarifications from the developer
- Architectural decisions
- Schema changes
- API contracts
- Specific interactions

Aim each module deep: a small interface over a lot of behaviour. A module whose deletion would make its complexity
vanish is a pass-through, and one with a single adapter needs no seam yet. The DESIGN.md of `/modified-matt-tdd` has
the rest.

Do NOT include specific file paths or code snippets. They may end up being outdated very quickly.

Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine,
reducer, schema, type shape), inline it within the relevant decision and note briefly that it came from a prototype.
Trim to the decision-rich parts, not a working demo, just the important bits.

## Testing Decisions

A list of testing decisions that were made. Include:

- A description of what makes a good test (only test external behavior, not implementation details)
- Which modules will be tested
- Prior art for the tests (i.e. similar types of tests in the codebase), or, when there are none, a statement that no
  similar tests exist and the new test boundary agreed in step 2

## Out of Scope

A description of the things that are out of scope for this spec.

## Further Notes

Any further notes about the feature.

## Decision log

A **redacted summary**, in your own words, of the decisions, constraints, and rejected alternatives that shaped this
spec: what was chosen, what was ruled out, and why. This is a summary, not a transcript — never paste the raw
conversation.

**Redact before you write.** This file is committed to the repository and `/modified-matt-implement` puts its path in the
commit message, so anything here reaches git history permanently. Exclude secrets, credentials, tokens, API keys,
connection strings, customer data, PII, internal URLs carrying auth, and any conversation unrelated to the decisions
above. When a decision genuinely turns on a sensitive value, describe the value's role without reproducing it.

When the design supersedes an ADR, name it here by number and title (ADR-NNNN, <title>). `/modified-matt-to-issues`
reads this log to keep `.mysdd/docs/adr/` in step with the spec.

</spec-template>

## Before you publish

Confirm each of these. Any "no" is a fix, not a caveat: don't publish until it's a "yes".

- Every user story carries a `US-NNN` ID, and no ID was renumbered or reused from an earlier revision
- Every user story describes externally observable behaviour, not an implementation detail
- The test boundaries in Testing Decisions are the ones the user confirmed in step 2
- The feature directory is `.mysdd/features/<NN>-<feature-slug>/`, numbered per `.mysdd/issue-tracker.md`
- The ignore probe on the spec path reported committed or local mode, not unresolved
- Out of Scope is non-empty: a spec that excludes nothing hasn't been scoped
- Testing Decisions names prior art: actual similar tests in this codebase, not a description of what one would look
  like. With none to name, it says so and names the new test boundary agreed in step 2
- The decision log is a redacted summary in your own words, carrying no secrets, credentials, PII, or raw
  transcript
- No Implementation Decision contradicts a live binding ADR. An ADR the user agreed to supersede already reads
  `superseded`, and the Decision log names it
- No file paths or code snippets anywhere, except a prototype-derived snippet that encodes a decision prose can't,
  and the `AGENTS.md` a convention line goes in

## Reviewing an existing spec

When the spec already exists (the user asks for a review, or a workflow step sends you here), review that `spec.md`
adversarially and edit it in place; don't write a new one. Do step 1 first, then run the ignore probe on the spec's
path before the first edit. Find what is underspecified, what contradicts itself or a binding ADR, and what it has
decided without saying so, and cut what isn't needed. Interviewing the user is expected here: ask about every gap and
open decision rather than assuming an answer.

- Never delete the User Stories section, and never renumber a `US-NNN`: retire the story instead, per the template.
- Append to the Decision log, redacted like the rest; never rewrite an earlier entry.
- Don't implement anything.
- Before you finish, the spec passes § Before you publish, confirming its test boundaries with the user if they
  weren't confirmed in step 2.

Commit it only as the sections the tracker's Contents row for spec direct. Where they name no commit, leave the edit
uncommitted: the `SPEC:` commit of `/modified-matt-to-issues` carries it.
