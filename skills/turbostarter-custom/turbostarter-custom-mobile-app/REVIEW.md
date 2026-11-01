# Reviewing a change to the mobile app

Read this when a review covers a change touching `apps/mobile` or `packages/ui/mobile`. It adds to the calling
review; it doesn't replace it.

## Where the rules live

- `apps/mobile/AGENTS.md` where it exists, and the root `AGENTS.md`'s mobile lines.
- The mobile docs (`https://www.turbostarter.dev/docs/mobile/<page>.md`), through a sub-agent: `api/client` for data
  access, `security/api-trust` for what the client may decide, `auth/*`, `organizations/*`, `billing/*`,
  `internationalization`, `customization/styling`, `publishing/updates`. The repo wins.

## Questions to ask

- Does the mobile app reach data through the typed API client and the shared session, never its own `fetch`, a
  provider SDK holding a secret, or logic only the device runs?
- Is an authorization, membership, plan or credit decision made only on the device? The server decides: BLOCKING when
  the API lacks the check.
- Does an API change remove or rename something installed builds read? That breaks phones already in people's hands:
  BLOCKING.
- Is a generated or vendored file hand-edited (types the toolchain writes, primitives a CLI copied in)?
- Is a web primitive used where the mobile app has its own (`@workspace/ui-web` or a web billing provider in React
  Native code)? That is a finding. Is a web rule enforced where the mobile app has its own way (`'use client'`,
  Server Components, web form helpers)? That is a false finding: drop it.

## Ownership

`apps/mobile/**` is the app's starting point, and `packages/ui/mobile/**` and `packages/billing/mobile/**` are
upstream-owned: kit-conformance's upstream test applies to them as to the web app's paths.

## Report

Use kit-conformance's report shape and its BLOCKING/SUGGESTION labels, so the calling review takes the findings as
they are.
