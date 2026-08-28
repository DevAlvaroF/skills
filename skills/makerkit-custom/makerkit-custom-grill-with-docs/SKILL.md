---
name: makerkit-custom-grill-with-docs
description: A relentless interview to sharpen a plan or design, which also records terms and decisions into the repo's AGENTS.md files as we go. Use when the user wants to stress-test their thinking, or uses any 'grill' trigger phrases.
disable-model-invocation: true
---

**Before the first round**, call the Skill tool with "makerkit-custom-domain-modeling" and run it alongside this
interview: it challenges the terms as they come up and records vocabulary and decisions the moment they crystallise,
rather than at the end.

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
tools, etc.), dispatch a sub-agent to find it; don't ask the user for anything you could look up yourself. Don't block
on it: a running exploration is an unsettled prerequisite, so only the questions downstream of it wait for the sub-agent
to report; ask the rest of the frontier now. The _decisions_ are the user's: put each to them and wait.

The session is done when the frontier is empty: every branch of the design tree visited, nothing left silently assumed.
Do not act on it until the user confirms you have reached a shared understanding. Once they confirm,
`/makerkit-custom-to-spec` turns this session into a spec — run it **in this same session**, while the design tree is
still in context.

## Ground yourself first

**Before the first round**, read the project's own documentation so you never spend a question on something the repo
already answers:

- the nearest `AGENTS.md` to the area in question — the root file is already in your context via `CLAUDE.md` — plus the
  vendored Next.js docs for anything Next.js. Read these directly; they're small and targeted. Where they and this
  description differ, **follow the repo**.
- the `README.md` of each app or package **actually involved** (`apps/*/README.md`, `packages/*/README.md`) — what that
  piece is and how it fits. Read directly, and only for the pieces the feature touches.
- the Makerkit docs under `docs/` — **dispatch a sub-agent; never walk the tree in this context.** It holds 150+
  upstream Makerkit `.mdoc` files. Name the one or two topic directories the feature touches (`docs/billing`,
  `docs/security`, `docs/data-fetching`, …) and ask the sub-agent how the feature is *meant* to work. Per the frontier
  rule above, don't block round one on it: only the questions downstream of its answer wait for it to report.

Understanding the architecture is a first step, not a question. Ask the user only what the docs genuinely don't answer —
and when a question survives that reading, say what you checked, so they can see it's a real gap rather than a shortcut.
