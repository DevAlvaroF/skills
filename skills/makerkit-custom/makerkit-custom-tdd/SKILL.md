---
name: makerkit-custom-tdd
description: Test-driven development. Use when the user wants to build features or fix bugs test-first, mentions "red-green-refactor", or wants integration tests.
---

# Test-Driven Development

TDD is the red → green loop. This skill is the reference that makes that loop produce tests worth keeping: what a good test is, where tests go, the anti-patterns, and the rules of the loop. Every section applies on every cycle: consult them before and during the loop, not after.

When exploring the codebase, read the root `AGENTS.md`, then the nearest `AGENTS.md` to the code under test, and follow the doc-consumption rules they set out, so test names and interface vocabulary match the project's language. Where those files and this description differ, **follow the repo**.

The discipline in this skill runs the other way. Everything below — red before green, one slice at a time, seams over internals, the anti-patterns — is **owned by this skill and applies even where the repo says nothing about it**. A thin `AGENTS.md` is not permission to skip the loop.

## Which runner, and which skill

"A test" in this repo is one of three different things, with three different runners and two specialist skills. Route before you write, because the seam you picked determines the runner:

| Seam under test | Runner | Reach for |
|---|---|---|
| A service or pure function, exercised with stubbed dependencies | vitest, per package | `/service-builder`, then this skill |
| A user-visible flow through the running app | Playwright, in `apps/e2e` | `/playwright-e2e` |
| A policy, grant, `SECURITY DEFINER` function, or view | pgTAP, against the local database | `/postgres-expert` |

**Makerkit is opinionated about all three, so take the *how* from the repo rather than inventing it.** Every `AGENTS.md` names the skills that own its surface in a `## Skills` section, and the root § Verification already requires invoking them; `docs/development/application-tests.mdoc` (Playwright) and `docs/development/database-tests.mdoc` (pgTAP) hold the long-form guidance. The unit seam comes from `/service-builder`: a service that takes its dependencies as arguments is testable with a mock client, no database and no framework runtime. That is this skill's seam discipline in the repo's own vocabulary — read it before writing a service test.

**Where the repo is silent or wrong, this skill owns the answer.** Three things to carry:

1. **`apps/web` has no vitest runner** — no config, no test script. A unit test placed there cannot run, including at the `_lib/server/__tests__/` path `/service-builder`'s own example uses. What the repo actually does is `@kit/tickets`: the service lives in `packages/features/tickets` with its own `vitest.config.ts`, and `apps/web/AGENTS.md` records the resulting split. **A unit seam is therefore also a placement decision** — raise it when the seams are agreed, not mid-loop.

2. **There is no full-suite command.** Root `pnpm test` is `turbo test`, which reaches only packages whose script is literally `test` — pulling in the whole Playwright run — while most unit suites are named `test:unit`, and `turbo test:unit` is not a configured task at all. `apps/e2e/AGENTS.md` § Running Tests calls `pnpm test` "All tests"; it isn't.

3. **Derive the list; don't trust a snapshot.** Which packages have tests, and under which name, moves as the repo grows:

   ```bash
   grep -rn --include=package.json -E '"test(:unit)?":' apps packages | grep -v node_modules
   ```

Run each package's own script directly (`pnpm --filter @kit/ui test:unit`). Playwright is opt-in: `pnpm --filter web-e2e exec playwright test <name> --workers=1` for the specs covering the flow you touched, and a whole-suite run needs `pnpm dev` and Supabase up. pgTAP is `pnpm supabase:web:test`, only when the change touches the database. If the repo differs from any of this, **follow the repo** and say which command you ran.

Prefer the cheapest runner that can observe the behaviour at the agreed seam. Don't reach for Playwright to test something a vitest test at a service boundary already pins down.

## What a good test is

Tests verify behavior through public interfaces, not implementation details. Code can change entirely; tests shouldn't. A good test reads like a specification: "user can checkout with valid cart" tells you exactly what capability exists, and it survives refactors because it doesn't care about internal structure.

See [tests.md](tests.md) for examples and [mocking.md](mocking.md) for mocking guidelines.

## Seams: where tests go

A **seam** is the public boundary you test at: the interface where you observe behavior without reaching inside. Tests live at seams, never against internals.

**Test only at pre-agreed seams.** If you're implementing from an issue, its `testSeams` field (set by `/makerkit-custom-to-issues` when the issue was drafted) is that agreement — use it, don't re-ask. Otherwise, before writing any test, write down the seams under test and confirm them with the user. No test is written at an unconfirmed seam. You can't test everything, so agreeing the seams up front is how testing effort lands on the critical paths and complex logic instead of every edge case.

If implementation reveals a pre-agreed seam doesn't hold (the boundary doesn't exist, or testing there misses the behavior that matters), stop and confirm the change with the user rather than silently testing elsewhere.

Ask: "What's the public interface, and which seams should we test?"

## Anti-patterns

- **Implementation-coupled**: mocks internal collaborators, tests private methods, or verifies through a side channel (querying the database instead of using the interface). The tell: the test breaks when you refactor but behavior hasn't changed.
- **Tautological**: the assertion recomputes the expected value the way the code does (`expect(add(a, b)).toBe(a + b)`, a snapshot derived by hand the same way, a constant asserted equal to itself), so it passes by construction and can never disagree with the code. Expected values must come from an independent source of truth: a known-good literal, a worked example, the spec.
- **Horizontal slicing**: writing all tests first, then all implementation. Bulk tests verify _imagined_ behavior: you test the _shape_ of things rather than user-facing behavior, the tests go insensitive to real changes, and you commit to test structure before understanding the implementation. Work in **vertical slices** instead: one test → one implementation → repeat, each test a **tracer bullet** that responds to what the last cycle taught you.

## Rules of the loop

- **Red before green.** Write the failing test first, then only enough code to pass it. Don't anticipate future tests or add speculative features.
- **One slice at a time.** One seam, one test, one minimal implementation per cycle.
- **Refactoring is not part of the loop.** The review stage always assesses the diff for refactor-worthy smells and applies the safe ones, not the red → green implementation cycle.
