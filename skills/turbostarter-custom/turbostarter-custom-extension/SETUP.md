# Setting up a repo with a browser extension

Read this only when `/turbostarter-custom-setup-skills` sends you here.

Say in the conventions map that this skill applies. The kit ships no `apps/extension/AGENTS.md`; offer to create one
(or, if the repo has one, add these sections at its end), filled in with the user, skipping a section it already has,
and write it only once they approve: every skill reads that file, and a new file is the app's own, never a kit edit.

```markdown
## Skills

- `/turbostarter-custom-extension` for any change here.

## Verification

- `pnpm --filter extension build:chrome`
- `pnpm --filter extension test:e2e` for changed flows.
- Load the unpacked build and check the changed entrypoint; else ask the user to, and record their confirmation.
```
