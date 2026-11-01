---
name: turbostarter-custom-mobile-app
description: "Guides work on the Expo mobile app (`apps/mobile`) of a TurboStarter Core or AI repo: where its rules and docs live, how it relates to the web app and the shared API, and what to weigh when grilling, specifying, slicing, modelling, testing, verifying or reviewing a change to it. Use when the repo has `apps/mobile` and the work may touch the mobile app, or another skill points here."
---

# The mobile app

TurboStarter's Core and AI kits ship a mobile app: an Expo (React Native) app in `apps/mobile`, using expo-router, beside
the web app (`apps/web`) in one monorepo, not a separate project. Both share the database, the `@workspace/*`
packages, the tracker and `.mysdd/`. The mobile app holds no server code: it reaches data only through the web app's
Hono API under `/api`, with the typed client in `apps/mobile/src/lib/api` and the Better Auth session the mobile auth
client keeps on the device.

The skill that sent you here keeps its whole workflow. Apply its step's section below on top of it.

**Context.** Keep this session lean, for orchestration, the user's decisions, commits and records: hand reading,
searching, checks and fixes to sub-agents where that helps. Brief each one with what it needs and read what it returns,
which is how you know what is going on: ask for what you need to act on, not raw output. Its edits are your own paths to
commit; it commits nothing, as a recorded SHA must be a commit this session made.

## Settle the target

A change targets the web app, the mobile app or both (and the extension, on Core). When the user hasn't said which,
ask: a guess builds half a feature, or one nobody wanted.

## Ground yourself in the mobile app

Besides what the calling skill reads:

- `apps/mobile/AGENTS.md` where it exists, and the root `AGENTS.md`'s mobile lines (it routes mobile screens to
  `apps/mobile/src/app/` and UI to `@workspace/ui-mobile`);
- the mobile docs (`https://www.turbostarter.dev/docs/mobile/<page>.md`), through the docs sub-agent the calling skill
  already uses — `api/client`, `auth/overview`, `organizations/overview`, `billing/overview`, `security/api-trust`,
  `tests/e2e`, `publishing/updates`, as the work needs.

The repo wins wherever it and this skill differ: the kit moves fast, so this skill names its APIs only as dated
examples (as of Expo SDK 58).

## Which rules bind

The web app's rules — React Server Components, `'use client'`, `[locale]` routing, `@workspace/ui-web`,
Next.js `proxy.ts` — don't bind React Native code: a web rule applied there gives wrong code and false review findings.
The mobile app has its own UI package (`@workspace/ui-mobile`), billing package (`packages/billing/mobile`, RevenueCat
or Superwall), flags, analytics and monitoring packages (`-mobile`). When it's unclear, follow how the mobile app
already does the same thing, then ask.

## Worth weighing

- **The server decides.** A modified client can call any endpoint, so every rule, permission and plan check lives on
  the API (`enforceAuth`, `enforceOrganizationPermission`, `enforceMembership`, credits or entitlement middleware);
  client-side checks are UX only, and nothing stored on the device proves an entitlement.
- **Installed builds.** Each user keeps running old code until they update, so an API response only gains fields;
  removing or renaming one breaks phones already in people's hands.
- **One home per rule.** A rule both apps need lives once, in `packages/*` or the API, so the apps can't drift apart.
- **Mirrored settings.** A setting both apps read has its mobile twin in `apps/mobile/env.config.ts` or
  `app.config.ts`; change both. No secret goes in the mobile client.
- **Strings.** Both apps read `packages/i18n/src/translations/`, so a web string change can change the mobile app.
- **App-store requirements** (permissions, privacy labels, account deletion, in-app purchases): what ships freely on
  the web may need store work, and mobile billing goes through the store, not the web provider.

## By step

### Setup

Read [SETUP.md](./SETUP.md).

### Grill

"Web app, mobile app or both?" is a round-one question. Ground mobile branches in the mobile docs, and probe
installed-build scenarios: what does someone on last month's build see once this ships?

### Domain modelling

A term both apps use stays one term. An ADR that binds only the mobile app is scoped to its paths (`apps/mobile/**`,
`packages/ui/mobile/**`), so web sessions don't pay for it. Worth asking of each decision: what does an older installed
build do when this changes?

### Spec

Each story names the app it ships in, right after its unchanged `US-NNN` id:
`**US-004** — (mobile app) As an organization member, …`. A change to the API contract says how installed builds keep
working. A mobile story's test boundary is the API route or the package function behind it, per § Tests; its screens
are a check, per § Verify.

### Issues

Shared server work (schema, package function, Hono route) is the first slice, then one slice per app, each blocked by
it, so each slice stays small and both apps build on the same contract. Name the app in `title` and `whatToBuild`
("Mobile app: …"), never in a new field: the issue shape is fixed.

### Plans

The plan names which app each step changes and how each one is verified.

### Tests

Unit tests run on Vitest in the packages that define a `test` script; the mobile app defines none (its `AGENTS.md`
and `package.json` win). Put the behaviour behind a boundary you can test — the API route or the package function it
calls — and keep the mobile code thin. Screens are covered by Maestro flows (`apps/mobile/e2e/`, `test:e2e`) where the
repo runs them. Adding a unit-test runner to the app is a decision for an ADR, not a slice's side effect.

### Verify

Run `apps/mobile/AGENTS.md` § Verification when it has one; otherwise the root § Verification, plus
`pnpm --filter mobile test:e2e` when the change has a Maestro flow and a device is available.

Check changed screens yourself where a tool can: the kit's `AGENTS.md` names `npx @expo/agent-cli` (`status`, `dev`,
`smoke`) from `apps/mobile`, and argent's `argent-test-ui-flow` skill drives a simulator when installed. Act, then
read the screen back to confirm, and keep a screenshot as the criterion's evidence. A cold native build can take a
quarter of an hour, so start it early, and an element with no `testID` or `accessibilityLabel` may be invisible to
the agent, so add one where a check needs it.

With no such tool, or for a check that needs a device or signing, ask the user to run it and record their
confirmation, attributed to them, as that criterion's evidence: "Verified by the user on the iOS simulator: …". A
check nobody ran is still a failure.

### Review

Read [REVIEW.md](./REVIEW.md).
