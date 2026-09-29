---
name: modified-matt-grill-with-docs
description: Runs a relentless interview to sharpen a plan or design, writing the glossary and ADRs as decisions crystallise. Use when the user wants to stress-test a plan or design before it becomes a spec.
disable-model-invocation: true
---

**Before the first round**, call the Skill tool with "modified-matt-domain-modeling" and apply its rules throughout
this interview: it challenges the terms as they come up and records vocabulary and decisions the moment they
crystallise, rather than at the end. Read the glossary and the binding ADRs for the paths the design touches, per
`.mysdd/docs/agents/domain.md`. ADRs are binding.

Interview the user relentlessly until you reach a shared understanding. Map this as a **design tree**: every decision
branches into the decisions that hang off it.

Work the tree in **rounds**. The **frontier** is every decision whose prerequisites are already settled: the questions
you can ask _now_ without guessing at answers you haven't heard yet. Ask the whole frontier in one round: number each
question and give your recommended answer. Then wait for the user's answers before the next round.

Format a round like so:

```
❓ **Q1** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>

---

❓ **Q2** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>
```

Each round the user answers reshapes the tree: settled decisions push the frontier outward and unblock questions that
depended on them. Recompute the frontier and ask the next round. A question whose answer depends on another question
still open in this round belongs to a _later_ round, not this one.

Finding _facts_ is your job, never the user's. When a frontier question needs a fact from the environment (filesystem,
tools, etc.), dispatch a sub-agent to find it; don't ask the user for anything you could look up yourself, and when a
question survives that lookup, say what you checked, so they can see it's a real gap rather than a shortcut. Don't
block on it: a running exploration is an unsettled prerequisite, so only the questions downstream of it wait for the
sub-agent to report; ask the rest of the frontier now. The _decisions_ are the user's: put each to them and wait.

The session is done when the frontier is empty: every branch of the design tree visited, nothing left silently assumed.
Do not act on it until the user confirms you have reached a shared understanding. Once they confirm, tell the user to
run `/modified-matt-to-spec` here, **in this same session** while the design tree is still in context: only they can
invoke it. The glossary terms and ADRs this session writes stay uncommitted. `/modified-matt-to-issues`
commits them with the spec.
