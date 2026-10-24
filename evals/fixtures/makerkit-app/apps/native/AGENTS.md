# Mobile app (Expo, React Native)

Expo Router screens under `app/`, data access under `lib/`. The mobile app reads data only through the web app's
`/api/v1` handlers (`lib/api-client.ts`); it never imports from `apps/web` or `@kit/supabase`.

- UI from `@kit/mobile-ui` (`packages/mobile-ui/AGENTS.md`), never `@kit/ui`, which is web only.
- No `'use client'` (there are no server components here) and no `data-test`: give an element a `testID` where a check
  needs to find it.
- Data through React Query hooks in `lib/`, one per `/api/v1` resource; screens stay thin.
- No test runner (Expo SDK 58): put logic behind `/api/v1` on the server, where it is tested.

## Commands

- `pnpm --filter native ios` builds and opens the app on the iOS simulator (needs installed dependencies).

## Skills

- `/makerkit-custom-mobile-app` for any change here.

## Verification

- `npm test` at the root covers the `/api/v1` responses the screens read.
- Check the changed screens on the simulator with argent (`/argent-test-ui-flow`) when installed; else ask the user
  to run them, and record their confirmation.
