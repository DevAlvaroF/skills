# Setting up a repo with a mobile app

Read this only when `/makerkit-custom-setup-skills` sends you here.

Say in the conventions map that this skill applies. Offer to add these stubs at the end of `apps/native/AGENTS.md`,
filled in with the user, skipping a section it already has, and write them only once they approve: every skill reads
that file, so the mobile app's own rules belong there.

```markdown
## Skills

- `/makerkit-custom-mobile-app` for any change here.

## Verification

- <commands that prove a mobile change, e.g. its typecheck>
- Check the changed screens on the simulator with argent (`/argent-test-ui-flow`) when installed; else ask the user
  to run them, and record their confirmation.
```
