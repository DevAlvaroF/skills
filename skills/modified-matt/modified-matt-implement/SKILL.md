---
name: modified-matt-implement
description: "Implement a piece of work based on a spec or set of issues."
disable-model-invocation: true
---

Implement the work described by the user in the spec or issues.

**Read `.myprds/docs/agents/issue-tracker.md` before you write anything.** It is the contract: directory layout, feature and issue
numbering, the issue JSON shape, and the status lifecycle. This skill does not restate it. If the file is missing, stop
and tell the user to run `/modified-matt-setup-skills`.

Read each issue you're implementing first (`.myprds/<NN>-<feature-slug>/issues/<NN>-<slug>.json`) and work from its
`whatToBuild`, `acceptanceCriteria`, `testSeams` and `spec`.

Use /modified-matt-tdd where possible, at each issue's pre-agreed seams (its `testSeams` field).

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

Once the implementation is done, review the work yourself using the **How to Review** section below. That
review belongs to this skill: run it before advancing any issue, whether or not the repo documents anything like it.

## How to Review

Review the changes along two axes:

- **Standards**: does the code conform to this repo's documented coding standards?
- **Spec**: does the code faithfully implement the originating issue / spec?

Both axes run as **parallel sub-agents** so they don't pollute each other's context, then this skill aggregates their
findings.

### Collect the diff

```bash
git diff HEAD
git status --short
```

If no uncommitted changes exist, review the last commit:

```bash
git show --stat HEAD
git show HEAD
```

### Process

#### 1. Identify the spec source

Look for the originating spec, in this order:

1. The `spec` field of the issue(s) you just implemented.
2. A path the user passed as an argument.
3. A spec file under `docs/`, `specs/`, or `.myprds/` matching the branch name or feature.
4. If nothing is found, ask the user where the spec is. If they say there isn't one, the **Spec** sub-agent will skip
   and report "no spec available".

#### 2. Identify the standards sources

Anything in the repo that documents how code should be written, such as `CODING_STANDARDS.md` or `CONTRIBUTING.md`.

On top of whatever the repo documents, the Standards axis always carries the **smell baseline** below: a fixed set of
Fowler code smells (_Refactoring_, ch.3) that applies even when a repo documents nothing. Two rules bind it:

- **The repo overrides — check before reporting, not after.** Before naming a baseline smell, check it against the
  standards-source files identified above: if a documented rule endorses the exact pattern the smell would flag (an
  adapter that's supposed to just delegate, an abstraction the docs call load-bearing), suppress it — don't report it
  and rely on a later pass to catch the conflict. If a match is ambiguous, say so in the finding instead of silently
  including or dropping it.
- **Always a judgement call.** Each smell is a labelled heuristic ("possible Feature Envy"), never a hard violation.
  Like any standard here, skip anything tooling already enforces.

Each smell reads *what it is* → *how to fix*; match it against the diff:

- **Mysterious Name**: a function, variable, or type whose name doesn't reveal what it does or holds. → rename it; if no
  honest name comes, the design's murky.
- **Duplicated Code**: the same logic shape appears in more than one hunk or file in the change. → extract the shared
  shape, call it from both.
- **Feature Envy**: a method that reaches into another object's data more than its own. → move the method onto the data
  it envies.
- **Data Clumps**: the same few fields or params keep travelling together (a type wanting to be born). → bundle them
  into one type, pass that.
- **Primitive Obsession**: a primitive or string standing in for a domain concept that deserves its own type. → give the
  concept its own small type.
- **Repeated Switches**: the same `switch`/`if`-cascade on the same type recurs across the change. → replace with
  polymorphism, or one map both sites share.
- **Shotgun Surgery**: one logical change forces scattered edits across many files in the diff. → gather what changes
  together into one module.
- **Divergent Change**: one file or module is edited for several unrelated reasons. → split so each module changes for
  one reason.
- **Speculative Generality**: abstraction, parameters, or hooks added for needs the spec doesn't have. → delete it;
  inline back until a real need shows.
- **Message Chains**: long `a.b().c().d()` navigation the caller shouldn't depend on. → hide the walk behind one method
  on the first object.
- **Middle Man**: a class or function that mostly just delegates onward. → cut it, call the real target direct.
- **Refused Bequest**: a subclass or implementer that ignores or overrides most of what it inherits. → drop the
  inheritance, use composition.

#### 3. Spawn both sub-agents in parallel

**Standards sub-agent prompt** should include:

- The full diff command and commit list.
- The list of standards-source files you found in step 2, **plus the smell baseline from step 2** pasted in full (the
  sub-agent has no other access to it).
- The brief: "Report, per file/hunk where relevant, (a) every place the diff violates a documented standard: cite the
  standard (file + the rule); and (b) any baseline smell you spot — but check it against the standards-source files
  first: if a documented rule endorses the exact pattern, drop it, don't report it. For anything you do report, name the
  smell and quote the hunk. Distinguish hard violations from judgement calls: documented-standard breaches can be hard,
  but baseline smells are always judgement calls. Skip anything tooling enforces. Under 400 words."

**Spec sub-agent prompt** should include:

- The diff command and commit list.
- The path or fetched contents of the spec.
- The brief: "Report: (a) requirements the spec asked for that are missing or partial; (b) behaviour in the diff that
  wasn't asked for (scope creep); (c) requirements that look implemented but where the implementation looks wrong. Quote
  the spec line for each finding. Under 400 words."

If the spec is missing, skip the Spec sub-agent and note this in the final report.

#### 4. Aggregate

Present the two reports under `## Standards` and `## Spec` headings, verbatim or lightly cleaned. Do **not** merge or
rerank findings, because the two axes are deliberately separate (see _Why two axes_).

End with a one-line summary: total findings per axis, and the worst issue _within each axis_ (if any). Don't pick a
single winner across axes: that's the reranking the separation exists to prevent.

#### 5. Assess refactors

This step always runs — assessing refactor-worthiness is not something the user has to ask for separately, and it is not
conditional on the diff looking messy.

Take only the **Standards** sub-agent's findings (hard violations and smell-baseline hits from step 2). Spec findings
are never auto-applied: they're about whether the code matches the spec's intent, which isn't a mechanical fix. For each
Standards finding, use judgement, not a fixed rule, to decide:

- **Fix now**, directly in the working tree, when it's small, local, and safe: a rename, extracting one duplicated
  shape, deleting a speculative-generality abstraction, collapsing a repeated switch.
- **Flag only**, listing it instead of touching it, when it's large, crosses many files, is ambiguous, or risks a
  behavior change — a Shotgun Surgery or Divergent Change spanning the codebase, or anything you're not confident is the
  right fix.

After applying any fixes, re-run whatever verification the repo defines (tests, lint, build) before reporting them as
done.

Report the outcome under a third heading, `## Refactors`, separate from `## Standards` and `## Spec`: what was fixed,
and what was flagged and left alone. This is not the cross-axis reranking step 4 forbids — that rule is about not
collapsing Standards and Spec into one ranked list. Assessing and applying refactors stays entirely inside the Standards
axis, after both reports have already been presented untouched.

### Why two axes

A change can pass one axis and fail the other:

- Code that follows every standard but implements the wrong thing → **Standards pass, Spec fail.**
- Code that does exactly what the issue asked but breaks the project's conventions → **Spec pass, Standards fail.**

Reporting them separately stops one axis from masking the other.

## Advance or close the issues

Updating the issues you implemented is part of the job, not an optional extra. Once the implementing agent's review is
done and the suite is green, advance every issue whose work landed
(`.myprds/<NN>-<feature-slug>/issues/<NN>-<slug>.json`; the directory and issue numbers are independent): flip every
satisfied entry in `acceptanceCriteria` to `"done": true` and set `"status": "done-coding-awaiting-final-review"`. This
state means the implementation and this skill's own review are complete, but independent final review is still pending;
this skill must never set `done-final-review`. Rewrite the whole file as strict JSON, keeping every other field (`id`,
`slug`, `title`, `spec`, `whatToBuild`, `blockedBy`, `testSeams`, `covers`, `comments`) intact — `comments` holds review history
that exists nowhere else, so dropping or emptying it loses it permanently. Re-read each file after writing to confirm it
still parses.

If an issue is only partly done, leave it open: tick only the criteria that are genuinely met and say which are
outstanding. Never tick a criterion you did not verify.

Then report which issues you advanced or closed and which you left open, with a one-line reason for each one still
open.

Do not commit, stage, or push anything — the user commits manually.

Instead, finish by returning a suggested commit message for the work: a concise imperative subject line (≤72 chars) plus
a short body explaining the *why* when the change isn't self-evident. Match the repo's existing commit style (check
`git log`). Include the path of each implemented issue JSON file, relative to the repository and beginning with
`.myprds/`. Also include the spec path from each issue's `spec` field, if set and not `null` (dedupe if several
issues share one). Include no tool or model attribution — no `Co-Authored-By` trailer, no "generated with" footer, no
emoji badge.

Before suggesting a commit message that references a spec path, **read that spec and scan it for secret-shaped strings**:
API keys and tokens, `sk-`/`ghp_`/`AKIA`-style prefixes, private key blocks, connection strings or URLs with embedded
credentials, `.env`-style assignments of a secret-looking name, and pasted customer data or PII. If you find any, stop:
do not suggest the commit, tell the user exactly what you found and where, and let them redact the spec first.
