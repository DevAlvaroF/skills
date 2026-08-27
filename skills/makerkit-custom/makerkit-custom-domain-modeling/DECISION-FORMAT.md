# Decision Format

This repo does not use ADRs. Standing decisions are recorded as short entries in a `## Decisions` section of the `AGENTS.md` that owns the affected code, so the next agent reading that subtree's rules sees them alongside the rules.

Create the section lazily: only when the first decision needs recording.

## Template

```md
## Decisions

**Transactional email is queued through an outbox table rather than sent inline.**
Calling `@kit/mailers` straight from a server action means a provider outage fails the user's request and loses the mail. Writing the message to an `outbox` row and draining it from a scheduled worker costs a few seconds of delivery latency and one more moving part, but makes retries and idempotency the database's job.
```

A decision entry is a bold one-line statement of what was decided, followed by one to three sentences of context and reasoning. That's it. The value is in recording *that* a decision was made and *why*, not in filling out sections.

Add `_Superseded by: …_` on its own line under an entry when a later decision replaces it, rather than deleting it — the fact that the old approach was tried is itself the useful part.

## When to record a decision

All three of these must be true:

1. **Hard to reverse**: the cost of changing your mind later is meaningful
2. **Surprising without context**: a future reader will look at the code and wonder "why on earth did they do it this way?"
3. **The result of a real trade-off**: there were genuine alternatives and you picked one for specific reasons

If a decision is easy to reverse, skip it: you'll just reverse it. If it's not surprising, nobody will wonder why. If there was no real alternative, there's nothing to record beyond "we did the obvious thing."

### What qualifies

- **Architectural shape.** How a feature's data is modelled across accounts; whether a surface is server-rendered or client-fetched, when it isn't the obvious choice.
- **Integration patterns between packages.** "This feature talks to billing through the service in `packages/features`, never by importing its internals."
- **Technology choices that carry lock-in.** Auth provider, mailer, analytics provider, deployment target. Not every library: just the ones that would take a quarter to swap out.
- **Boundary and scope decisions.** "Account data is owned by the accounts schema; feature tables reference it by `account_id` only." The explicit no-s are as valuable as the yes-s.
- **Deliberate deviations from the documented path.** Anything that goes against a rule already written in an `AGENTS.md` — using `getSupabaseServerAdminClient` instead of the RLS-backed client, a route handler where a server action would be idiomatic, a `useEffect` that genuinely earns its place. These stop the next engineer from "fixing" something that was deliberate.
- **Constraints not visible in the code.** Compliance requirements, contractual response times, a partner API's limits.
- **Rejected alternatives when the rejection is non-obvious.** If a subtle reason ruled something out, record it; otherwise someone will suggest it again in six months.

### What doesn't qualify

Anything the verification steps already enforce, anything a migration file already states plainly, and anything you'd reverse without a second thought.
