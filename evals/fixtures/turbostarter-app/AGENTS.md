# AGENTS.md

Guide for AI agents working on the Promptly monorepo.

## Where to look first

| Task            | Start here                                  |
| --------------- | ------------------------------------------- |
| Auth logic      | `packages/auth/`                            |
| API endpoints   | `packages/api/src/modules/`                 |
| Database schema | `packages/db/src/schema/`                   |
| AI capabilities | `packages/ai/<name>/`                       |
| Credits         | `packages/ai/core/src/credits/`             |
| Billing         | `packages/billing/web/`                     |
| Web pages       | `apps/web/src/app/[locale]/`                |
| Mobile screens  | `apps/mobile/src/app/`                      |

Dependencies are not installed in this checkout: neither app builds or runs here. `npm test` (`node:test`) runs the
API tests under `test/`.

## Conventions

- Routes are guarded by the middleware in `packages/api/src/middleware.js`: `enforceAuth` for any user,
  `enforceOrganizationPermission` for organization data, `deductCredits` before any model call.
- Organization data is scoped by `organizationId` from the verified membership, never from the request alone.
- Apps call the API through the typed client in `src/lib/api`, never a hand-written `fetch`.

## Verification

1. `npm test`
2. Run adversarial reviewer skill /reviewer

- Run `/turbostarter-custom-kit-conformance` on the change.
- When the change touches auth, roles or the schema, run `/better-auth-best-practices` on it.

<!-- kit-edit: engineering skills setup -->

## Agent skills

### Issue tracker

Issues are JSON files under `.mysdd/features/`. See `.mysdd/issue-tracker.md` (issue schema, status lifecycle, and
commit message format).

### Domain docs

Glossary in `.mysdd/docs/CONTEXT.md`, decisions as scoped ADRs in `.mysdd/docs/adr/`. See `.mysdd/docs/agents/domain.md`.

### Commits

The commits the engineering skills make take their subjects, trailers and timing from `.mysdd/issue-tracker.md`
§ Commits, an agreed exception to the kit's commit convention: running such a skill is the request to commit. Every
other commit follows the kit's rules.

### Project docs

Conventions live in a distribution of `AGENTS.md` files (root, per app/package, and deeper). Read every `AGENTS.md`
from the root down to each directory you touch, in order, plus every one those files route a concern you touch to: the
root is already loaded; read the rest directly, because not every agent loads nested files. Invoke the skills a nested
`AGENTS.md` names when writing code there, and run any verification it adds.

### Kit edits

TurboStarter AI, combined with Core ported in. Prefer the kit's extension points, and edit a file TurboStarter ships
under `packages/**` or `tooling/**` only once the user agrees none fits. Mark every edit to a file the kit ships with
a `kit-edit:` comment, in the file's own syntax at the changed lines, saying why and naming the issue or ADR.
`apps/*/src/config/`, navigation and `packages/i18n/src/translations/` are meant to be edited and need none; code
ported from Core is the app's own.
