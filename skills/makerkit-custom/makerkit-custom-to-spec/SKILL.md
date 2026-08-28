---
name: makerkit-custom-to-spec
description: "Turn the current conversation into a spec and publish it to the project issue tracker: no interview, just synthesis of what you've already discussed."
disable-model-invocation: true
---

This skill takes the current conversation context and codebase understanding and produces a spec. Do NOT interview the
user; just synthesize what you already know.

**Read `.myprds/issue-tracker.md` before you write anything.** It is the contract: directory layout, feature and issue
numbering, the issue JSON shape, and the status lifecycle. This skill does not restate it. If the file is missing, stop
and tell the user to run `/makerkit-custom-setup-skills`.

## Ground yourself first

**Before starting**, read the project's own documentation:

- the nearest `AGENTS.md` to the area in question — the root file is already in your context via `CLAUDE.md` — plus the
  vendored Next.js docs for anything Next.js. Read these directly; they're small and targeted. Where they and this
  description differ, **follow the repo**.
- the `README.md` of each app or package **actually involved** (`apps/*/README.md`, `packages/*/README.md`) — what that
  piece is and how it fits. Read directly, and only for the pieces the feature touches.
- the Makerkit docs under `docs/` — **dispatch a sub-agent; never walk the tree in this context.** It holds 150+
  upstream Makerkit `.mdoc` files. Name the one or two topic directories the feature touches (`docs/billing`,
  `docs/security`, `docs/data-fetching`, …) and ask the sub-agent how the feature is *meant* to work. Per the frontier
  rule above, don't block round one on it: only the questions downstream of its answer wait for it to report.

## Process

1. Explore the repo to understand the current state of the codebase, if you haven't already (see
   `## Ground yourself first`).

2. Sketch out the seams at which you're going to test the feature. Existing seams should be preferred to new ones. Use
   the highest seam possible. If new seams are needed, propose them at the highest point you can. The fewer seams across
   the codebase, the better - the ideal number is one.

Check with the user that these seams match their expectations.

3. Write the spec using the template below, then publish it as `spec.md` under the feature's
   `.myprds/<NN>-<feature-slug>/` directory. A spec is prose, not an issue, so it carries no status; the
   `/makerkit-custom-to-issues` skill is what turns it into `ready-for-agent` issues.

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
downstream issues reference these IDs in their `covers` field, so an ID is an address, not a position in the running
order. On a later revision a new story takes the highest existing ID + 1, wherever it sits in the list, and a dropped
story leaves its ID retired, not recycled.

## Implementation Decisions

A list of implementation decisions that were made. This can include:

- The modules that will be built/modified
- The interfaces of those modules that will be modified
- Technical clarifications from the developer
- Architectural decisions
- Schema changes
- API contracts
- Specific interactions

Do NOT include specific file paths or code snippets. They may end up being outdated very quickly.

Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine,
reducer, schema, type shape), inline it within the relevant decision and note briefly that it came from a prototype.
Trim to the decision-rich parts, not a working demo, just the important bits.

## Testing Decisions

A list of testing decisions that were made. Include:

- A description of what makes a good test (only test external behavior, not implementation details)
- Which modules will be tested
- Prior art for the tests (i.e. similar types of tests in the codebase)

## Out of Scope

A description of the things that are out of scope for this spec.

## Further Notes

Any further notes about the feature.

## Decision log

A **redacted summary**, in your own words, of the decisions, constraints, and rejected alternatives that shaped this
spec: what was chosen, what was ruled out, and why. This is a summary, not a transcript — never paste the raw
conversation.

**Redact before you write.** This file is committed to the repository and `/makerkit-custom-implement` puts its path in
the suggested commit message, so anything here reaches git history permanently. Exclude secrets, credentials, tokens,
API keys, connection strings, customer data, PII, internal URLs carrying auth, and any conversation unrelated to the
decisions above. When a decision genuinely turns on a sensitive value, describe the value's role without reproducing it.

</spec-template>

## Before you publish

Confirm each of these. Any "no" is a fix, not a caveat: don't publish until it's a "yes".

- Every user story carries a `US-NNN` ID, and no ID was renumbered or reused from an earlier revision
- Every user story describes externally observable behaviour, not an implementation detail
- The test seams in Testing Decisions are the ones the user confirmed in step 2
- The feature directory is named `<NN>-<feature-slug>`, numbered per `.myprds/issue-tracker.md`
- Out of Scope is non-empty: a spec that excludes nothing hasn't been scoped
- Testing Decisions names prior art: actual similar tests in this codebase, not a description of what one would look
  like
- The decision log is a redacted summary in your own words, carrying no secrets, credentials, PII, or raw transcript
- No file paths or code snippets anywhere, except a prototype-derived snippet that encodes a decision prose can't
