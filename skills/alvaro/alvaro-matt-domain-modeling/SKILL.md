---
name: alvaro-matt-domain-modeling
description: Build and sharpen a project's domain model. Use when discussing codebase terminology, or when a convention or decision needs recording in an AGENTS.md.
---

# Domain Modeling

Actively build and sharpen the project's domain model as you design. This is the *active* discipline: challenging terms, inventing edge-case scenarios, and writing the vocabulary and decisions down the moment they crystallise. (Merely *reading* the `AGENTS.md` files for vocabulary is not this skill: that's a one-line habit any skill can do. This skill is for when you're changing the model, not just consuming it.)

## Where the model lives

This repo has no `CONTEXT.md` and no ADR directory. The domain model lives in the repo's **`AGENTS.md` distribution**: a root file that maps the monorepo and holds cross-cutting rules, plus one per app and per package that owns its subtree.

```
/
├── AGENTS.md                            ← cross-cutting terms and decisions
├── apps/
│   ├── web/AGENTS.md
│   │   ├── app/[locale]/admin/AGENTS.md
│   │   └── supabase/AGENTS.md
│   └── e2e/AGENTS.md
└── packages/
    ├── features/AGENTS.md
    ├── next/AGENTS.md
    ├── supabase/AGENTS.md
    ├── ui/AGENTS.md
    └── …
```

Confirm the current set before writing: `find . -name AGENTS.md -not -path '*/node_modules/*' | sort`.

**Pick the file that owns the concept.** A term or decision scoped to one package goes in that package's `AGENTS.md`. Only genuinely cross-cutting ones — the account model, the TypeScript and React rules, the verification steps — go in the root file. When a path has no `AGENTS.md` of its own, write to the nearest ancestor that does rather than creating a new file; create one only when the subtree has accumulated enough of its own conventions to justify it, and add it to the root file's monorepo table when you do.

## During the session

### Challenge against the existing vocabulary

When the user uses a term that conflicts with the language already in an `AGENTS.md`, call it out immediately. "The root `AGENTS.md` calls that a team account, but you seem to mean a personal account. Which is it?"

### Sharpen fuzzy language

When the user uses vague or overloaded terms, propose a precise canonical term. "You're saying 'user': do you mean the `auth.users` row or the `accounts` row? In a personal account they share an id, but they're different things."

### Discuss concrete scenarios

When domain relationships are being discussed, stress-test them with specific scenarios. Invent scenarios that probe edge cases and force the user to be precise about the boundaries between concepts — especially across the personal/team account split, role and permission checks, and what RLS does or doesn't enforce.

### Cross-reference with code

When the user states how something works, check whether the code agrees. Schema and policies under `apps/web/supabase/` are the ground truth for the data model. If you find a contradiction, surface it: "Your policy scopes this to `account_id`, but you just said members of the parent account can read it. Which is right?"

### Record terms inline

When a term is resolved, write it into the owning `AGENTS.md` right there. Don't batch these up: capture them as they happen. Use the format in [VOCABULARY-FORMAT.md](./VOCABULARY-FORMAT.md).

Keep vocabulary entries free of implementation detail. A term entry says what a thing **is**; the surrounding `AGENTS.md` sections already carry the how (imports, patterns, file layout). Don't turn an `AGENTS.md` into a spec or a scratch pad.

### Record decisions sparingly

Only record a decision when all three are true:

1. **Hard to reverse**: the cost of changing your mind later is meaningful
2. **Surprising without context**: a future reader will wonder "why did they do it this way?"
3. **The result of a real trade-off**: there were genuine alternatives and you picked one for specific reasons

If any of the three is missing, skip it. Use the format in [DECISION-FORMAT.md](./DECISION-FORMAT.md).
