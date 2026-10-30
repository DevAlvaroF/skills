---
name: makerkit-custom-mobile-app
description: "Guides work on the optional Expo mobile app (`apps/native`) of a Makerkit repo: where its rules and docs live, how it relates to the Next.js web app, and what to weigh when grilling, specifying, slicing, modelling, testing, verifying or reviewing a change to it. Use when the repo has `apps/native` and the work may touch the mobile app, or another skill points here."
---

# The mobile app

The repo may also ship a mobile app: an Expo (React Native) app in `apps/native`, present from the start or added
later. It is a second app of this monorepo, beside the web app (`apps/web`), not a separate project: both
share the database, the `@kit/*` packages, the tracker and `.mysdd/`. The mobile app covers a subset of the web app's
features, and reaches data through the web app's `/api/v1` route handlers.

The skill that sent you here keeps its whole workflow. Apply its step's section below on top of it.

**Context.** Keep this session for orchestration, the user's decisions, commits and records: hand reading, searching,
checks and fixes, including fixes a sub-agent's report calls for, to sub-agents where you can. Brief each one with what
it needs and have it report back with enough information to act on, never trimmed to save context: it spares you the
reading, not the findings. A recorded SHA must be a commit this session made.

## Settle the target

A change targets the web app, the mobile app or both. When the user hasn't said which, ask: a guess builds half a
feature, or one nobody wanted.

## Ground yourself in the mobile app

Besides what the calling skill reads:

- `apps/native/AGENTS.md`, `packages/mobile-ui/AGENTS.md` and `apps/web/app/api/v1/AGENTS.md`, where they exist;
- `docs/native/`, through the docs sub-agent the calling skill already uses; `covered-features.mdoc` says what the
  mobile app already has.

The repo wins wherever it and this skill differ: the mobile kit is still moving, so this skill names its APIs only as
dated examples.

## Which rules bind

The root `AGENTS.md` and the builder skills were written for the web app — `'use client'`, `data-test`, `@kit/ui`,
`/verify-app`, `/react-form-builder`, `/architect`, for example. They bind the mobile app only where
`apps/native/AGENTS.md` says so, because a web rule applied to React Native code gives wrong code and false review
findings. When it's unclear, follow how the mobile app already does the same thing, then ask.

## Worth weighing

- **The web↔mobile contract.** Installed builds keep running old code until each user updates, so an `/api/v1`
  response only gains fields; removing or renaming one breaks phones already in people's hands.
- **One home per rule.** A rule both apps need lives once, usually on the server (service, policy, route handler), so
  the two apps can't drift apart.
- **Mirrored settings.** A setting both apps read has an `EXPO_PUBLIC_*` twin in the mobile app; change both.
- **Strings.** The mobile app inherits the web app's translations (e.g., as of Expo SDK 58, a local delta plus a
  generated catalogue), so a web string change can change the mobile app too.
- **App-store requirements** (permissions, privacy labels, account deletion, in-app purchases): what ships freely on
  the web may need store work.

## By step

### Setup

Read [SETUP.md](./SETUP.md).

### Grill

"Web app, mobile app or both?" is a round-one question. Ground mobile branches in `docs/native/`, and probe
installed-build scenarios: what does someone on last month's build see once this ships?

### Domain modelling

A term both apps use stays one term. An ADR that binds only the mobile app is scoped to its paths (`apps/native/**`,
`packages/mobile-ui/**`), so web sessions don't pay for it. Worth asking of each decision: what does an older installed
build do when this changes?

### Spec

Each story names the app it ships in, right after its unchanged `US-NNN` id:
`**US-004** — (mobile app) As a team member, …`. A change to the `/api/v1` contract says how installed builds keep
working. A mobile story's test boundary is the server endpoint or service behind it, per § Tests; its screens are a
check the user runs, per § Verify.

### Issues

Shared server work (migration, service, `/api/v1` handler) is the first slice, then one slice per app, each blocked
by it, so each slice stays small and both apps build on the same contract. Name the app in `title` and `whatToBuild`
("Mobile app: …"), never in a new field: the issue shape is fixed.

### Plans

The plan names which app each step changes and how each one is verified.

### Tests

The mobile app has no test runner (as of Expo SDK 58; its `AGENTS.md` wins). Put the behaviour behind a boundary you can test — the `/api/v1` handler or the
service it calls — and keep the mobile code thin. Adopting a runner is a decision for an ADR, not a slice's side
effect.

### Verify

Run `apps/native/AGENTS.md` § Verification when it has one; otherwise ask the user how to verify the mobile app.

Check changed screens yourself when argent is installed: its `argent-test-ui-flow` skill drives the iOS simulator or
Android emulator. Act, then read the screen back to confirm (typed text can drop characters), and keep a screenshot as
the criterion's evidence. A cold native build can take a quarter of an hour, so start it early, and an element with no
`testID` or `accessibilityLabel` may be invisible to the agent, so add one where a check needs it.

With no such tool, or for a check that needs a device or signing, ask the user to run it and record their
confirmation, attributed to them, as that criterion's evidence: "Verified by the user on the iOS simulator: …". A
check nobody ran is still a failure.

### Review

Read [REVIEW.md](./REVIEW.md).
