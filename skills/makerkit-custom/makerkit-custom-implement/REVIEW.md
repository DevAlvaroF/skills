# Review the work

Step 1 of `/makerkit-custom-implement`, run on its own work before the repo's verification steps.

Review the changes along two axes:

- **Spec**: does the code faithfully implement the originating issue / spec? Spec fidelity includes the spec's Decision
  log and the ADRs whose `scope` covers a touched file, per `.mysdd/docs/agents/domain.md`. It always runs here.
- **Standards**: does the code conform to the repo's documented standards? That belongs to the general review skill the
  root or a nested `AGENTS.md` § Verification names — `/reviewer` — in step 2. Run the **Standards** fallback below
  only when that section names no general review skill, names one that isn't installed, or names only a specialist one
  such as `/rls-review`. If the project names its own fallback, follow that instead.

If no standards review of any kind can run, report the missing verification, in the final report and the
implementation record; never report the axis as passed. When `/reviewer` does run in step 2, hand it the binding ADRs'
paths too, and give its findings the judgement in _Assess refactors_ below.

Whichever axes run here run as **parallel sub-agents** so they don't pollute each other's context, then this skill
aggregates their findings.

## Collect the diff

Run from final-review, the change's `git show <sha>` commands replace the inventory; never diff `HEAD`. Otherwise, the
review covers exactly the inventory [SKILL.md](./SKILL.md) keeps. If it is empty, there is nothing to review: stop
and say so. **Stay out of the full diff yourself**: the inventory is its shape. Hand each sub-agent the inventory, mixed
paths marked (part of their diff predates the run), and the *commands* that reproduce the diff, to run itself:
`git --literal-pathspecs diff HEAD -- '<tracked path>' …` for the tracked paths, and a whole read of each new file,
which that diff never shows. Never paste diff contents into a sub-agent prompt, and never read the full diff into this
context: it is the largest thing this skill touches, and doing both means paying for it twice.

## Process

### 1. Identify the spec source

Look for the originating spec, in this order:

1. The `spec` field of the issue(s) you just implemented.
2. A path the user passed as an argument.
3. A spec file under `.mysdd/features/` matching the branch name or feature — never `docs/`, which is upstream Makerkit
   product documentation, not agent-authored specs.
4. If nothing is found, ask the user where the spec is. If they say there isn't one, the **Spec** sub-agent still
   runs, against the issue and the binding ADRs alone.

### 2. Identify the standards sources

Only when the Standards fallback runs. The sources are the `AGENTS.md` files `.mysdd/docs/agents/domain.md` § Ground
yourself first lists for the paths the work touches, the routed ones included.

On top of whatever the repo documents, the Standards fallback always carries the **smell baseline** below: a fixed set
of Fowler code smells (_Refactoring_, ch.3) that applies even when a repo documents nothing. Two rules bind it:

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

### 3. Spawn the sub-agents in parallel

**Standards sub-agent prompt** should include:

- The inventory and the commands from _Collect the diff_ (the commands, never the diff itself).
- The list of standards-source files you found in step 2, the binding ADRs' paths (the Spec sub-agent's), **plus the
  smell baseline from step 2** pasted in full (the sub-agent has no other access to it).
- The brief: "Report, per file/hunk where relevant, (a) every place the diff violates a documented standard: cite the
  standard (file + the rule); and (b) any baseline smell you spot — but check it against the standards-source files and
  ADRs first: if a documented rule or a binding ADR endorses the exact pattern, drop it, don't report it. For anything
  you do report, name the smell and quote the hunk. Distinguish hard violations from judgement calls:
  documented-standard breaches can be hard, but baseline smells are always judgement calls. Skip anything tooling
  enforces. Under 400 words."

**Spec sub-agent prompt** should include:

- The inventory and the commands from _Collect the diff_ (the commands, never the diff itself).
- **The scope**: the selected Issue paths, with their `whatToBuild`, `acceptanceCriteria`, `testBoundaries` and
  `covers`.
- **Constraints and context**: the *path* to the spec (the path only; don't read the spec into this context), the paths
  of the binding ADRs, those whose `scope` covers a touched file per `.mysdd/docs/agents/domain.md`, and each ADR the
  user agreed to supersede in this run, with its replacement, by number and title.
- The brief: "Report: (a) what the scope asks for that is missing or partial — a spec requirement outside the selected
  Issues' `covers` is not a finding: at most, note which other Issue owns it; (b) behaviour in the diff that wasn't
  asked for (scope creep); (c) requirements that look implemented but where the implementation looks wrong;
  (d) places the diff contradicts the spec's Decision log or a binding ADR. An agreed supersession listed above is
  not a finding: its replacement outranks both the old ADR and the matching spec decision, so check the diff against
  the replacement. Quote the Issue, spec line or ADR for each finding. Under 400 words."

If there is no spec, run the Spec sub-agent anyway, without one: drop the Decision log from (d), and note "no spec
available" in the final report. The scope and the binding-ADR check never depend on a spec.

### 4. Aggregate

Present the reports under `## Standards` (when the fallback ran) and `## Spec` headings, verbatim or lightly cleaned.
Do **not** merge or rerank findings: a change can follow every standard and implement the wrong thing, or do exactly
what the issue asked and break the repo's conventions, and one axis must not mask the other.

End with a one-line summary: total findings per axis, and the worst issue _within each axis_ (if any). Don't pick a
single winner across axes: that's the reranking the separation exists to prevent.

### 5. Assess refactors

This step always runs on standards findings — the Standards fallback's here, `/reviewer`'s in step 2 — whether or not
the diff looks messy. Spec findings are never auto-applied: they're about whether the code matches the spec's intent,
which isn't a mechanical fix. First drop any finding a binding ADR sanctions, and say which ADR. For each standards
finding left, use judgement, not a fixed rule, to decide:

- **Fix now**, directly in the working tree, when it's small, local, and safe: a rename, extracting one duplicated
  shape, deleting a speculative-generality abstraction, collapsing a repeated switch. A fix-now that touches untested
  code writes the covering test first. At a boundary the issue doesn't list, propose that test to the user and write it
  only once they agree, then add the boundary to that issue's `testBoundaries`, as [SKILL.md](./SKILL.md) does for any
  new boundary. If you can't, or they decline, it becomes flag-only.
- **Flag only**, listing it instead of touching it, when it's large, crosses many files, is ambiguous, or risks a
  behavior change — a Shotgun Surgery or Divergent Change spanning the codebase, or anything you're not confident is the
  right fix.

Step 2's verification runs after fixes made here; after fixing `/reviewer` findings in step 2, re-run that step's
checks before reporting them done.

Report the outcome under a third heading, `## Refactors`, separate from `## Standards` and `## Spec`: what was fixed,
and what was flagged and left alone. Assessing refactors stays inside the standards axis, after both reports have
already been presented untouched, so it is not the cross-axis reranking step 4 forbids.
