# Reviewing a change to the browser extension

Read this when a review covers a change touching `apps/extension`. It adds to the calling review; it doesn't replace
it.

## Where the rules live

- `apps/extension/AGENTS.md` where it exists, and the root `AGENTS.md`'s extension lines.
- The extension docs (`https://www.turbostarter.dev/docs/extension/<page>.md`), through a sub-agent:
  `security/permissions`, `security/session`, `security/content-scripts`, `security/storage`, `structure/messaging`,
  `api/client`, `configuration/manifest`. The repo wins.

## Questions to ask

- Does the extension reach data through the typed API client and the web app's session, never its own sign-in, a
  stored session token or a secret in its bundle? BLOCKING otherwise.
- Does privileged work run in a content script, or does a handler trust what a content script or page claims without
  validating the message and checking on the server? BLOCKING.
- Does the change add a permission, a host pattern or `<all_urls>` the spec's Decision log doesn't name? BLOCKING.
- Does an API change remove or rename something a released extension reads? BLOCKING.
- Are cookies, tokens or page data logged to analytics or error tracking? BLOCKING.
- Is a web-only rule enforced where the extension has its own way (Server Components, `'use client'`, Next.js
  routing)? That is a false finding: drop it.

## Ownership

`apps/extension/**` is the app's starting point, and `packages/*-extension` packages are upstream-owned:
kit-conformance's upstream test applies to them as to the web app's paths.

## Report

Use kit-conformance's report shape and its BLOCKING/SUGGESTION labels, so the calling review takes the findings as
they are.
