# AI combined with Core

The documented route to a full AI product: Core's accounts, organizations, billing and admin around AI's packages and
routes (`https://www.turbostarter.dev/ai/docs/integrate-core-kit.md`). Read CORE.md and AI.md too: each kit's rules
hold for its own code. These rules are where they meet, and each one breaking is BLOCKING, citing that page.

- **One base, one upstream.** The repo started from one kit and ported the other's code in; the two roots are never
  merged. The base is the kit `git remote get-url upstream` names, else the one the root `AGENTS.md` § Kit edits
  records. Its tree is upstream-owned as its kit file says. Ported code is the app's own copy: no `kit-edit:` is
  needed there, but its kit's primitives and conventions still bind. A second remote for the other kit makes its
  paths upstream-owned too.
- **One `customer`.** AI's credit ledger and Core's billing customer share the table name: the AI ledger is renamed
  (an `ai_credit` table or similar) or dropped for Core's plan entitlements. Two tables called `customer`, or one
  carrying both meanings, is the clash the recipe warns about.
- **One metering policy, enforced before the call.** Plan entitlement, an included allowance, purchased credits or a
  hybrid — whichever the ADRs record — checked on the server before any model call. A model call reachable without
  that check, or charged only afterwards, breaks it.
- **One of each client.** One auth client per app, one query client, theme, i18n, analytics and monitoring; packages
  merged by export, never two packages with one name.
- **Core's auth, with anonymous kept** while guests still generate content, and a decided moment when they must
  upgrade. Server plugins are enabled deliberately, never inferred from a client-side flag, and the Better Auth
  schema includes their fields.
- **A guest's data survives signup, or an ADR says it doesn't.** Linking deletes the anonymous user by default, and
  AI records cascade on it, so the anonymous plugin's `onLinkAccount` moves the guest's chats and credits to the new
  user, with a test of the upgrade. The default link with no transfer and no ADR accepting the loss is data loss.
- **One migration history.** The schema is merged and generated afresh; neither kit's historical migrations run
  against the shared database.
- **AI routes stay, Core routers join** the one Hono chain under `/api`; the extension calls that API and holds none of
  its own.
