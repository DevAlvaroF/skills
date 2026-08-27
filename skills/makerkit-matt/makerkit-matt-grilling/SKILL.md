---
name: makerkit-matt-grilling
description: Grill the user relentlessly about a plan, decision, or idea. Use when the user wants to stress-test their thinking, or uses any 'grill' trigger phrases.
---

Interview the user relentlessly until you reach a shared understanding. Map this as a **design tree**: every decision branches into the decisions that hang off it.

Work the tree in **rounds**. The **frontier** is every decision whose prerequisites are already settled: the questions you can ask _now_ without guessing at answers you haven't heard yet. Ask the whole frontier in one round: number each question and give your recommended answer. Then wait for the user's answers before the next round.

Format a round like so:

```
❓ **Q1** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>

---

❓ **Q2** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>
```

Each round the user answers reshapes the tree: settled decisions push the frontier outward and unblock questions that depended on them. Recompute the frontier and ask the next round. A question whose answer depends on another question still open in this round belongs to a _later_ round, not this one.

Finding _facts_ is your job, never the user's. When a frontier question needs a fact from the environment (filesystem, tools, etc.), dispatch a sub-agent to find it; don't ask the user for anything you could look up yourself. Don't block on it: a running exploration is an unsettled prerequisite, so only the questions downstream of it wait for the sub-agent to report; ask the rest of the frontier now. The _decisions_ are the user's: put each to them and wait.

The session is done when the frontier is empty: every branch of the design tree visited, nothing left silently assumed. Do not act on it until the user confirms you have reached a shared understanding.

## Ground yourself first

**Before the first round**, read the project's own documentation so you never spend a question on something the repo already answers:

- `agents-docs/project-docs.md`, and follow the doc-consumption rules it sets out. Expect roughly: the root `AGENTS.md`, then the nearest `AGENTS.md` to the area in question, plus the vendored Next.js docs for anything Next.js. Where that file and this description differ, **follow the repo**; if it doesn't exist, read the root and nearest `AGENTS.md` directly.
- the `README.md` of each app or package involved (`apps/*/README.md`, `packages/*/README.md`) — what that piece is and how it fits;
- the Makerkit docs under `docs/` (`.mdoc` files by topic: `billing`, `security`, `data-fetching`, …) — how a feature is *meant* to work.

Understanding the architecture is a first step, not a question. Ask the user only what the docs genuinely don't answer — and when a question survives that reading, say what you checked, so they can see it's a real gap rather than a shortcut.
