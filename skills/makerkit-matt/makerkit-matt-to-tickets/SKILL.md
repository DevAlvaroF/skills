---
name: makerkit-matt-to-tickets
description: Break a plan, spec, or the current conversation into a set of tracer-bullet tickets, each declaring its blocking edges as data, published as one JSON file per ticket under .scratch/.
disable-model-invocation: true
---

# To Tickets

Break a plan, spec, or conversation into a set of **tickets**: tracer-bullet vertical slices, each declaring the tickets that **block** it.

The issue tracker and triage label vocabulary should have been provided to you. If not, tell the user to run `/makerkit-matt-setup-matt-pocock-skills`.

## Process

### 1. Gather context

Work from whatever is already in the conversation context. If the user passes a reference (a spec path or ticket path) as an argument, read the file's full contents.

### 2. Explore the codebase (optional)

If you have not already explored the codebase, do so to understand the current state of the code. Ticket titles and descriptions should use the vocabulary of the root `AGENTS.md` and of the nearest `AGENTS.md` to the code involved, and respect the conventions and decisions recorded there.

Look for opportunities to prefactor the code to make the implementation easier. "Make the change easy, then make the easy change."

### 3. Draft vertical slices

Break the work into **tracer bullet** tickets.

<vertical-slice-rules>

- Each slice cuts a narrow but COMPLETE path through every layer (schema, API, UI, tests): vertical, NOT a horizontal slice of one layer
- A completed slice is demoable or verifiable on its own
- Each slice is sized to fit in a single fresh context window
- Any prefactoring should be done first

</vertical-slice-rules>

Give each ticket its **blocking edges**: the other tickets that must complete before it can start. A ticket with no blockers can start immediately.

**Wide refactors are the exception to vertical slicing.** A **wide refactor** is one mechanical change (rename a column, retype a shared symbol) whose **blast radius** fans across the whole codebase, so a single edit breaks thousands of call sites at once and no vertical slice can land green. Don't force it into a tracer bullet; sequence it as **expand–contract**. First expand: add the new form beside the old so nothing breaks. Then migrate the call sites over in batches sized by blast radius (per package, per directory), each batch its own ticket blocked by the expand, keeping CI green batch to batch because the old form still exists. Finally contract: delete the old form once no caller remains, in a ticket blocked by every migrate batch. When even the batches can't stay green alone, keep the sequence but let them share an integration branch that all block a final integrate-and-verify ticket; green is promised only there.

### 4. Quiz the user

Present the proposed breakdown as a numbered list. For each ticket, show:

- **Title**: short descriptive name
- **Blocked by**: which other tickets (if any) must complete first
- **What it delivers**: the end-to-end behaviour this ticket makes work

Ask the user:

- Does the granularity feel right? (too coarse / too fine)
- Are the blocking edges correct: does each ticket only depend on tickets that genuinely gate it?
- Should any tickets be merged or split further?

Iterate until the user approves the breakdown.

### 5. Publish the tickets

Publish the approved tickets: write one file per ticket under `.scratch/<NN>-<feature-slug>/issues/<NN>-<slug>.json`, numbered from `01` in dependency order (blockers first). The feature directory's `NN` is its two-digit sequence number; the ticket filename's `NN` is a separate sequence within that feature. Each file's `blockedBy` lists the tickets it depends on. Use the per-ticket JSON template below: one ticket per file, never a single combined file.

Work the **frontier**: any ticket whose blockers are all done. For a purely linear chain that means top to bottom.

Do NOT modify the feature's `spec.md`.

<local-ticket-template>

```json
{
  "id": "<NN>",
  "slug": "<slug>",
  "title": "<Ticket title>",
  "status": "ready-for-agent",
  "whatToBuild": "The end-to-end behaviour this ticket makes work, from the user's perspective, not a layer-by-layer implementation list.",
  "blockedBy": ["<NN>-<slug>", "<NN>-<slug>"],
  "acceptanceCriteria": [
    { "text": "Acceptance criterion 1", "done": false },
    { "text": "Acceptance criterion 2", "done": false }
  ]
}
```

Write strict JSON: no comments, no trailing commas, and every field present on every ticket. `blockedBy` holds the `<NN>-<slug>` id of each ticket that gates this one, and is an empty array `[]` when the ticket can start immediately. `acceptanceCriteria` entries start with `"done": false`; ticking a criterion means flipping it to `true`.

</local-ticket-template>

Avoid specific file paths or code snippets: they go stale fast. Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it and note briefly that it came from a prototype. Trim to the decision-rich parts, not a working demo, just the important bits.
