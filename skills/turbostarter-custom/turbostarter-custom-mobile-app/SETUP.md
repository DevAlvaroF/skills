# Setting up a repo with a mobile app

Read this only when `/turbostarter-custom-setup-skills` sends you here.

Say in the conventions map that this skill applies. The kit ships no `apps/mobile/AGENTS.md`; offer to create one (or,
if the repo has one, add these sections at its end), filled in with the user, skipping a section it already has, and
write it only once they approve: every skill reads that file, so the mobile app's own rules belong there, and a new
file is the app's own, never a kit edit.

```markdown
## Skills

- `/turbostarter-custom-mobile-app` for any change here.

## Verification

- <commands that prove a mobile change, e.g. the root `pnpm lint`>
- `pnpm --filter mobile test:e2e` for changed Maestro flows, when a device is available.
- Check the changed screens with `npx @expo/agent-cli smoke`, or argent (`/argent-test-ui-flow`) when installed;
  else ask the user to run them, and record their confirmation.
```
