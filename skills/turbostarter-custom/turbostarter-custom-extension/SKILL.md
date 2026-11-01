---
name: turbostarter-custom-extension
description: "Guides work on the WXT browser extension (`apps/extension`) of a TurboStarter Core repo: where its rules and docs live, how it shares the web app's session and API, and what to weigh when grilling, specifying, slicing, modelling, testing, verifying or reviewing a change to it. Use when the repo has `apps/extension` and the work may touch the extension, or another skill points here."
---

# The browser extension

TurboStarter's Core kit ships a browser extension: a WXT and React app in `apps/extension`, beside the web app
(`apps/web`) in one monorepo. It holds no server code and no sign-in of its own: it reuses the session the web app
set, reading its cookie through the `cookies` permission and the app's `host_permissions`, and reaches data only
through the web app's Hono API under `/api`, with the typed client in `apps/extension/src/lib/api`. The server lists
the extension's id in Better Auth's `trustedOrigins`.

The skill that sent you here keeps its whole workflow. Apply its step's section below on top of it.

**Context.** Keep this session lean, for orchestration, the user's decisions, commits and records: hand reading,
searching, checks and fixes to sub-agents where that helps. Brief each one with what it needs and read what it returns,
which is how you know what is going on: ask for what you need to act on, not raw output. Its edits are your own paths to
commit; it commits nothing, as a recorded SHA must be a commit this session made.

## Settle the target

A change targets the web app, the extension, the mobile app or several. When the user hasn't said which, ask: a guess
builds half a feature, or one nobody wanted. For the extension, also settle which entrypoint — popup, side panel,
options, new tab, devtools, a content script or the background worker — since each runs with different privileges.

## Ground yourself in the extension

Besides what the calling skill reads:

- `apps/extension/AGENTS.md` where it exists, and the root `AGENTS.md`'s extension lines (entrypoints in
  `apps/extension/src/app/`, background for long tasks, content scripts for the DOM, WXT messaging,
  `@workspace/ui-web`);
- the extension docs (`https://www.turbostarter.dev/docs/extension/<page>.md`), through the docs sub-agent the calling
  skill already uses — `structure/*`, `api/client`, `auth/session`, `security/*`, `configuration/manifest`,
  `tests/e2e`, `publishing/*`, as the work needs.

The repo wins wherever it and this skill differ.

## Worth weighing

- **Privilege by entrypoint.** Content scripts read the page and nothing more; privileged work runs in the background
  worker or through the API, and privileged UI on extension pages. A content script is a new attack surface, so add
  one only when the feature needs the page, on narrow match patterns, preferring `activeTab` on a user gesture.
- **The page is hostile.** Every message is validated (Zod) and, for sensitive actions, its sender checked; nothing a
  content script claims — `userId`, `organizationId`, admin — is trusted without the server.
- **One session.** Sign-in, sign-out and 2FA happen on the web app; the extension never builds a password form or
  keeps the session token in extension storage.
- **Permissions are a store review.** Each new permission or host pattern is a decision the user makes, with its
  reason: stores reject and users distrust broad ones.
- **One home per rule.** A rule the extension shares with the web app lives once, in `packages/*` or the API.
- **Released builds.** Store review delays every update, so the API the extension reads only gains fields.

## By step

### Setup

Read [SETUP.md](./SETUP.md).

### Grill

"Which app, and which entrypoint?" is a round-one question. Probe the privilege boundary: what can a hostile page do
with this?

### Domain modelling

A term the extension shares with the web app stays one term. An ADR that binds only the extension is scoped to
`apps/extension/**`, so other sessions don't pay for it.

### Spec

Each story names the app and entrypoint, right after its unchanged `US-NNN` id:
`**US-004** — (extension, side panel) As a signed-in user, …`. A new permission or host pattern is in the Decision
log with its reason. The test boundary is the API route or package function behind the feature, per § Tests.

### Issues

Shared server work (schema, package function, Hono route) is the first slice, then one slice per app, each blocked by
it. Name the app in `title` and `whatToBuild` ("Extension: …"), never in a new field: the issue shape is fixed.

### Plans

The plan names which entrypoint each step changes and how it is verified.

### Tests

Unit tests run on Vitest in the packages that define a `test` script; the extension defines none, so put behaviour
behind the API route or a package function and keep entrypoints thin. Flows are Playwright specs under
`apps/extension/e2e/` (`pnpm --filter extension test:e2e`).

### Verify

Run `apps/extension/AGENTS.md` § Verification when it has one; otherwise the root § Verification, plus the extension's
build (`pnpm --filter extension build:chrome`) and its e2e specs when the change has one. A check that needs the
unpacked extension loaded in a browser is the user's to run: record their confirmation, attributed to them, as that
criterion's evidence. A check nobody ran is still a failure.

### Review

Read [REVIEW.md](./REVIEW.md).
