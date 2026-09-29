# How to Review

The review `/modified-matt-implement` runs on its own work, before it commits or advances any issue. It has two axes,
each run by its own sub-agent in parallel, because a change can pass one and fail the other, and one reviewer tends to
let the axis it cares about mask the other:

- **Standards**: does the code follow this repo's documented standards?
- **Spec**: does it faithfully implement the issue and its spec?

## Scope

The review covers exactly the inventory [SKILL.md](./SKILL.md) keeps; an empty inventory has nothing to review, so say
so and stop. Give each sub-agent the inventory, mixed paths marked (part of their diff predates the run), and the
commands that reproduce the diff — a `git diff HEAD` over the tracked paths and a whole read of each new file — never
the diff itself: it is the largest thing this skill touches, and pasting it pays for it twice.

## The sub-agents

**Standards** gets the scope, the repo's standards files for the touched paths (root and nested `AGENTS.md` and
`CLAUDE.md`, `CODING_STANDARDS.md`, `CONTRIBUTING.md` and the like), the binding ADRs' paths and the smell baseline
below, pasted in full since it has no other copy. Brief: "Report each place the diff breaks a documented standard,
citing the file and rule, and each baseline smell you see, quoting the hunk. Drop a smell a documented rule or binding
ADR endorses, and say so when that's ambiguous. Standards breaches can be hard violations; smells are always judgement
calls. Skip what tooling enforces. Under 400 words."

**Spec** gets the scope; the issues' `whatToBuild`, `acceptanceCriteria`, `testBoundaries` and `covers`; the spec's path
(the issue's `spec`, else one the user names, else ask; with none it runs against the issue and ADRs alone and the
report says "no spec available"); the binding ADRs' paths; and each ADR the user agreed to supersede, with its
replacement. Brief: "Report (a) what the issues ask for that is missing or partial — a requirement outside their
`covers` belongs to another issue, not here; (b) behaviour nobody asked for; (c) requirements implemented wrongly;
(d) contradictions of the spec's Decision log or a binding ADR. An agreed supersession outranks both the old ADR and
the spec line it replaces, so check against the replacement. Quote the source for each. Under 400 words."

### Smell baseline

Fowler's code smells (_Refactoring_, ch. 3), each a labelled heuristic ("possible Feature Envy"), never a hard
violation, and overridden by the repo's own rules:

- **Mysterious Name**: the name doesn't say what it does or holds → rename; no honest name means murky design.
- **Duplicated Code**: the same shape in more than one hunk → extract it, call it from both.
- **Feature Envy**: reaches into another object's data more than its own → move it onto that data.
- **Data Clumps**: the same fields travel together → bundle them into one type.
- **Primitive Obsession**: a primitive standing in for a domain concept → give it a small type.
- **Repeated Switches**: the same switch on the same type recurs → polymorphism, or one shared map.
- **Shotgun Surgery**: one logical change scatters edits across many files → gather what changes together.
- **Divergent Change**: one module edited for unrelated reasons → split it.
- **Speculative Generality**: abstraction for needs the spec doesn't have → delete it until a real need shows.
- **Message Chains**: long `a.b().c().d()` walks → hide the walk behind one method.
- **Middle Man**: mostly delegates onward → call the real target.
- **Refused Bequest**: ignores most of what it inherits → use composition.

## Aggregate

Present the reports under `## Standards` and `## Spec`, verbatim or lightly cleaned, never merged or reranked across
axes, since that ranking is what the split exists to prevent. End with the finding count and worst finding per axis.

## Refactors

Always assess the Standards findings; Spec findings are never auto-applied, because matching intent isn't a mechanical
fix. Drop any a binding ADR sanctions, naming it. Then, by judgement:

- **Fix now** when small, local and safe (a rename, one extraction, deleting a speculative abstraction). Untested code
  gets its covering test first; a boundary the issue doesn't list is agreed with the user and added to
  `testBoundaries`, or the finding becomes flag-only.
- **Flag only** when it's large, cross-cutting, ambiguous or risks a behaviour change.

After any fix, re-run the repo's verification through a failures-only sub-agent. Report under `## Refactors`: what was
fixed and what was flagged.
