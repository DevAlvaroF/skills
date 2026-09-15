# Review the work

Step 1 of `/makerkit-custom-implement`, run on its own work before the repo's verification steps.

Check the diff against the originating issue / spec: does the code faithfully implement it? Standards conformance
(AGENTS.md, code smells) belongs to `/reviewer` in step 2 — this step is spec-fidelity only.

## Collect the diff

**Stay out of the full diff yourself.** The sub-agents below read it; in this context take only its shape:

```bash
git diff --stat HEAD
git status --short
```

If no uncommitted changes exist, the review target is the last commit instead:

```bash
git show --stat HEAD
```

Hand each sub-agent the *command* that reproduces the full diff — `git diff HEAD`, or `git show HEAD` when reviewing
the last commit — and let it run that itself. Never paste diff contents into a sub-agent prompt, and never read the
full diff into this context: it is the largest thing this skill touches, and doing both means paying for it twice.

## Process

### 1. Identify the spec source

Look for the originating spec, in this order:

1. The `spec` field of the issue(s) you just implemented.
2. A path the user passed as an argument.
3. A spec file under `.mysdd/` matching the branch name or feature — never `docs/`, which is upstream Makerkit product
   documentation, not agent-authored specs.
4. If nothing is found, ask the user where the spec is. If they say there isn't one, the **Spec** sub-agent will skip
   and report "no spec available".

### 2. Spawn the Spec sub-agent

Run this as a sub-agent so a large diff/spec doesn't pollute this skill's own context.

**Spec sub-agent prompt** should include:

- The diff command from _Collect the diff_ (the command, never the diff itself) and the commit list.
- The *path* to the spec. Pass the path only and let the sub-agent read it; don't read the spec into this context to
  paste it in.
- The brief: "Report: (a) requirements the spec asked for that are missing or partial; (b) behaviour in the diff that
  wasn't asked for (scope creep); (c) requirements that look implemented but where the implementation looks wrong. Quote
  the spec line for each finding. Under 400 words."

If the spec is missing, skip the Spec sub-agent and note this in the final report.

### 3. Report

Present the sub-agent's findings under a `## Spec` heading, verbatim or lightly cleaned.
