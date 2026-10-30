# Reviewing a change to the mobile app

Read this when a review covers a change touching `apps/native` or `packages/mobile-ui`. It adds to the calling
review; it doesn't replace it.

## Where the rules live

- `apps/native/AGENTS.md` (layout, import rules, commands, generated files), `packages/mobile-ui/AGENTS.md` (the
  primitives) and `apps/web/app/api/v1/AGENTS.md` (the API the mobile app calls).
- `docs/native/*.mdoc`, through a sub-agent. As of Expo SDK 58, for example: data access in `data-fetching`, sign-in in
  `authentication`, teams in `workspaces`, then `forms`, `i18n`, `styling-theming`, `routing-navigation`, store
  builds in `building-shipping`, and what exists in `covered-features`. The repo wins.

## Questions to ask

- Does the mobile app reach data the way those docs and `apps/native/AGENTS.md` say?
- Does an `/api/v1` change remove or rename something installed builds read? That breaks phones already in people's
  hands: BLOCKING.
- Is a generated or vendored file hand-edited (a generated catalogue, primitives a CLI copied in)?
- Is a web primitive used where the mobile app has its own (`@kit/ui` in React Native code)? That is a finding. Is a
  web rule enforced where the mobile app has its own way (`'use client'`, `data-test`, web form helpers)? That is a
  false finding: drop it.

## Ownership

The mobile paths get kit-conformance's upstream test, the same as the web app's.

## Report

Use kit-conformance's report shape and its BLOCKING/SUGGESTION labels, so the calling review takes the findings as
they are.
