---
name: example-skill
description: Example skill showing the cross-agent SKILL.md shape. Use when the user asks to see how a skill in this repo is structured, or asks for the skill template.
---

# Example Skill

This is a working example. Copy this directory, rename it, rewrite the
frontmatter, and delete this file's contents.

## How the agent finds this

The agent only sees `name` and `description` until it decides to load the
skill. Everything below this frontmatter is loaded *after* that decision.
That makes `description` the single most important line in the file: write
it as trigger conditions, not as a summary.

Good:  "Use when deploying to staging, or when a deploy fails and the user
        needs the rollback procedure."
Bad:   "A skill about deployments."

## Instructions

Write the procedure as direct instructions to the agent, in the imperative.
Keep this file short. Push detail into `references/` and link to it, so the
agent loads it only when it actually needs it:

- See `references/details.md` for the extended checklist.

## Frontmatter rules for cross-agent skills

Only these keys are valid in both Claude Code and Codex:

  name, description, license, allowed-tools, metadata

Any other key makes Codex reject the file with an "Unexpected key(s) in
SKILL.md frontmatter" error. Keep it to `name` + `description` unless you
have a reason.
