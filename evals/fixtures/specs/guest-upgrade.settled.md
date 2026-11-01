# Keep a guest's work at signup

## Problem Statement

Every visitor gets an anonymous session on first load and can chat and spend credits straight away. When they sign up,
Better Auth links the new account and deletes the anonymous user, and their chats and remaining credits go with it:
the work they signed up to keep is the work they lose.

## Solution

The anonymous plugin's `onLinkAccount` moves the guest's chats and credits to the account they sign up or sign in
with, before the anonymous user is deleted.

## User Stories

- **US-001** — As a guest who signs up, I want my chats to be in my new account, so that signing up never costs me my
  work.
- **US-002** — As a guest who signs up, I want my unspent credits added to my new account, so that I don't pay twice
  for what I already had.

## Implementation Decisions

- The transfer lives in `packages/auth/src/server.js` as `linkGuest`, and `packages/auth/src/config.js` hands it to
  Better Auth's anonymous plugin as `onLinkAccount`, so it runs inside the link, before the plugin deletes the
  anonymous user and the cascade removes their rows.
- Every `chat` row of the anonymous user moves to the new user.
- The guest's `ai_credit` balance is added to the new user's row when they have one; otherwise the guest's row moves to
  them.
- The anonymous user is still deleted after the link, as the plugin does by default: nothing else belongs to it.

## Testing Decisions

The transfer is tested at its export, `linkGuest`, with `node:test` in `test/`, over the same in-memory tables the
API tests use: a guest with chats and credits linked to a new account, and to an account that already has credits.

## Out of Scope

- Merging two signed-up accounts.
- Moving anything but chats and credits; a guest owns nothing else.

## Further Notes

None.

## Decision log

- Transfer, not keep: the anonymous user is deleted after the link, so the data moves rather than staying behind on a
  user that no longer exists.
- Credits are added together, never replaced, so a returning user signing in from a guest session loses neither
  balance (the user's answer in the spec review).
