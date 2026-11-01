---
name: better-auth-best-practices
description: Reviews a change to Better Auth configuration, plugins, sessions or the auth schema. Use when a change touches auth, roles or the schema.
---

# Better Auth review

A stand-in for the kit's Better Auth skill, written for the evals. Review the change you are handed for:

- server plugins enabled in the server config, never inferred from a client flag;
- the anonymous plugin: what `onLinkAccount` does with the guest's rows before the anonymous user is deleted;
- the generated auth schema left to the generator, never edited by hand;
- a role or permission checked on the server, never only in the UI.

Report each finding with its file and line, BLOCKING or SUGGESTION, headed `Better Auth review`.
