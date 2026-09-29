---
name: makerkit-custom-tdd
description: Guides test-driven development — what a good test is, where tests go, the anti-patterns and the red-green loop. Use when the user wants to build features or fix bugs test-first, mentions "red-green-refactor", or wants integration tests.
---

# Test-Driven Development

TDD is the red → green loop. This skill is the reference that makes that loop produce tests worth keeping: what a good
test is, where tests go, the anti-patterns, and the rules of the loop. Every section applies on every cycle: consult
them before and during the loop, not after.

When exploring the codebase, read the `AGENTS.md` chain for the directory under test and for the test file's own
directory (`apps/e2e` and `apps/web/supabase/tests` carry their own), and the glossary in `.mysdd/docs/CONTEXT.md`, as
`.mysdd/docs/agents/domain.md` § Ground yourself first lists them. If that section is missing, tell the user in your
reply to re-run `/makerkit-custom-setup-skills`, and until then read every AGENTS.md from the root down to each
directory you touch, the ones they route you to, CONTEXT.md and the ADRs whose scope covers those paths. Test names and
interface vocabulary match the project's language, and where the repo and this description differ, **follow the repo**.
The ADRs whose `scope` covers the code under test are binding: a test that would pin behaviour contradicting one is a
stop — flag it and ask.

The discipline in this skill runs the other way. Everything below — red before green, one slice at a time, boundaries
over internals, the anti-patterns — is **owned by this skill and applies even where the repo says nothing about it**. A
thin `AGENTS.md` is not permission to skip the loop.

## What a good test is

Tests verify behavior through public interfaces, not implementation details. Code can change entirely; tests shouldn't.
A good test reads like a specification: "user can checkout with valid cart" tells you exactly what capability exists,
and it survives refactors because it doesn't care about internal structure.

See [tests.md](tests.md) for examples and [mocking.md](mocking.md) for mocking guidelines.

## Test boundaries: where tests go

A **test boundary** is the public interface you test at: the point where you observe behavior without reaching inside.
Tests live at boundaries, never against internals.

**Test only at pre-agreed boundaries.** If you're implementing from an issue, its `testBoundaries` field (set by
`/makerkit-custom-to-issues` when the issue was drafted) is that agreement — use it, don't re-ask. Otherwise, before
writing any test, write down the boundaries under test and confirm them with the user. No test is written at an
unconfirmed boundary. You can't test everything, so agreeing the boundaries up front is how testing effort lands on the
critical paths and complex logic instead of every edge case.

If implementation reveals a pre-agreed boundary doesn't hold (that interface doesn't exist, or testing there misses the
behavior that matters), stop and confirm the change with the user rather than silently testing elsewhere.

Ask: "What's the public interface, and which boundaries should we test?"

When the shape of that interface is itself in question (how deep the module is, where the boundary belongs, what the
interface should expose), settle it with the user before writing the test, using [DESIGN.md](DESIGN.md): depth, the
deletion test, seams, and designing it twice. Don't let the test quietly design the interface.

## Anti-patterns

- **Implementation-coupled**: mocks internal collaborators, tests private methods, or verifies through a side channel
  (querying the database instead of using the interface). The tell: the test breaks when you refactor but behavior
  hasn't changed.
- **Tautological**: the assertion recomputes the expected value the way the code does (`expect(add(a, b)).toBe(a + b)`,
  a snapshot derived by hand the same way, a constant asserted equal to itself), so it passes by construction and can
  never disagree with the code. Expected values must come from an independent source of truth: a known-good literal, a
  worked example, the spec.
- **Horizontal slicing**: writing all tests first, then all implementation. Bulk tests verify _imagined_ behavior: you
  test the _shape_ of things rather than user-facing behavior, the tests go insensitive to real changes, and you commit
  to test structure before understanding the implementation. Work in **vertical slices** instead: one test → one
  implementation → repeat, each test a **tracer bullet** that responds to what the last cycle taught you.

## Rules of the loop

- **Red before green.** Write the failing test first, then only enough code to pass it. Don't anticipate future tests or
  add speculative features.
- **One slice at a time.** One boundary, one test, one minimal implementation per cycle.
- **Refactoring is not part of the loop.** Standards and smells are checked after it, by `/makerkit-custom-implement`'s
  review — the repo's review skill, or that review's Standards fallback — not in the red → green cycle.
- **Report missing grounding.** Your final reply names a missing § Ground yourself first in
  `.mysdd/docs/agents/domain.md` and asks the user to re-run `/makerkit-custom-setup-skills`.
