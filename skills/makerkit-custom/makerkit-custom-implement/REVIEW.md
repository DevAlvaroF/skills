# Review the work

Step 1 of `/makerkit-custom-implement`, run on its own work before the repo's verification.

Review along two axes, as **parallel sub-agents**, so one axis can't colour the other:

- **Spec** always runs here: does the code do what the issue and its spec ask, within the spec's Decision log and the
  binding ADRs for the touched paths?
- **Standards** belongs to the repo's review skills in step 2: `/reviewer`, and `/rls-review` when the change touches
  migrations or RLS policies. Hand them the binding ADRs' paths too. Run the **Standards fallback** here only when
  § Verification names no general review skill or the one it names isn't installed — a specialist such as
  `/rls-review` doesn't count — unless the project names its own fallback. If no standards review can run at all,
  report that in the final report and the implementation record; never report the axis as passed.

## Hand them the commands, not the diff

The review covers exactly the inventory; if it is empty, stop and say so. Give each sub-agent the inventory, mixed
paths marked (part of their diff predates the run), and the commands that reproduce the diff — a `git diff HEAD` over
the tracked paths and a whole read of each new file — never the diff itself: it is the largest thing this skill
touches, and pasting it pays for it twice.

## Spec sub-agent

Give it the issue paths with their `whatToBuild`, `acceptanceCriteria`, `testBoundaries` and `covers`; the spec's path
(not its text); the binding ADRs' paths; and each ADR the user agreed to supersede in this run, with its replacement.
With no spec (the issue's `spec`, a path the user gave, or a spec under `.mysdd/features/` — never `docs/`, which is
Makerkit's product documentation), it runs against the issue and ADRs alone; say "no spec available".

Brief: "Report (a) what the scope asks for that is missing or partial — a requirement outside these issues' `covers`
is not a finding, at most name the issue that owns it; (b) behaviour nobody asked for; (c) requirements implemented
wrongly; (d) contradictions of the Decision log or a binding ADR — an agreed supersession outranks both, so check
against its replacement. Quote the issue, spec line or ADR for each. Under 400 words."

## Standards fallback sub-agent

Give it the standards sources — the `AGENTS.md` files the work's paths ground in, routed ones included — the binding
ADRs' paths, and this **smell baseline** (Fowler, _Refactoring_ ch. 3) pasted in full, since it has no other copy:

- **Mysterious Name** → rename; if no honest name comes, the design is murky.
- **Duplicated Code** → extract the shared shape.
- **Feature Envy**: reaching into another object's data → move the method there.
- **Data Clumps**: fields that travel together → one type.
- **Primitive Obsession**: a string standing in for a concept → its own small type.
- **Repeated Switches** on the same type → polymorphism or one shared map.
- **Shotgun Surgery**: one change, scattered edits → gather what changes together.
- **Divergent Change**: one module edited for unrelated reasons → split it.
- **Speculative Generality**: hooks the spec doesn't need → delete them.
- **Message Chains** `a.b().c().d()` → hide the walk behind one method.
- **Middle Man** that only delegates → call the real target.
- **Refused Bequest**: ignoring most of what it inherits → composition.

Brief: "Report each place the diff breaks a documented standard, citing file and rule, and each baseline smell you
spot, quoting the hunk. Check a smell against the standards and ADRs before reporting it and drop it when a documented
rule or ADR endorses the exact pattern; say so when that's ambiguous. Documented breaches can be hard violations;
smells are always judgement calls. Skip what tooling enforces. Under 400 words."

## Aggregate

Present the reports under `## Standards` (when the fallback ran) and `## Spec`, verbatim or lightly cleaned, and never
merge or rerank them: code can follow every standard and build the wrong thing, and one axis must not mask the other.
End with the finding count and the worst finding within each axis.

## Assess refactors

Standards findings — the fallback's here, the review skills' in step 2 — are weighed, not auto-applied. Drop any a
binding ADR sanctions, naming it. **Fix now** what is small, local and safe (a rename, one extraction, deleting a
speculative abstraction), writing the covering test first where the code is untested — at a boundary the issue doesn't
list, only once the user agrees and it's added to `testBoundaries`. **Flag only** what is large, cross-cutting,
ambiguous or might change behaviour. Spec findings are never auto-applied: they're about intent, not mechanics. Re-run
the step 2 checks after any fix, and report under `## Refactors` what was fixed and what was flagged.
