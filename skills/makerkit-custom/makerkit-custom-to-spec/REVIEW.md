# Reviewing an existing spec

When the spec already exists, review that `spec.md` adversarially and edit it in place, grounded as SKILL.md says and
once the mode resolves. Find what is underspecified, what contradicts itself or a binding ADR, and what it decided
without saying so, and cut what isn't needed. Interview the user about every gap and open decision rather than
guessing: a guessed answer becomes a decision nobody made.

- Never delete the User Stories section or renumber a `US-NNN`: issues address stories by ID. Retire a story instead.
- Only append to the Decision log, above the Spec Record, redacted like the rest: earlier entries are the record of
  what was decided.
- Keep any `kanban-brief:` line as it is.
- Implement nothing.
- Keep each open question, and the user's answer once given, in the spec above the record: the next session reads the
  spec, not this conversation.

## Finishing

Finish only when the spec passes SKILL.md § Before you publish, confirming its test boundaries with the user if they
never were. Until then record nothing: no attempt, no commit, `commits` untouched, because a review commit says the
spec passed. A session that ends with a question open leaves its edit uncommitted.

Once it passes, record it whatever you changed. Only you, the coordinating session, write the record, after any
delegates finish and from a fresh read, so no attempt is lost to a second writer:

1. **Save the attempt.** A spec with no Spec Record predates it: add the empty block at its end. Append one attempt,
   `commit` still `null`; `attempt` is `<N>`, one more than the largest already there, or 1:

   ```json
   {
     "attempt": 1,
     "agent": "<your name: Claude, Codex, …>",
     "commit": null,
     "summary": "<what you changed and why, the questions the user answered, the checks you ran>"
   }
   ```

2. **Check what you publish.** Read the whole spec and scan for secret-shaped strings — keys, tokens,
   `sk-`/`ghp_`/`AKIA` prefixes, private keys, credentialed URLs, `.env`-style assignments, customer data: the commit
   puts the spec in history, which outlives any later redaction, so on a hit commit nothing and tell the user what and
   where. Every review commit gets this check, re-reviews too.
3. **Commit it** per the tracker's § Commits: `REVIEW HISTORY: Record spec review attempt <N>`, trailer
   `Spec: <spec path>`, holding the spec alone. In local mode it is the empty marker: parent the `HEAD` you noted, tree
   that parent's, published only while `HEAD` still names that parent, index untouched, signed if the repository
   signs (a marker built from a stale tree once reverted another agent's commit). § Commits' hard limits and done
   rules apply: current branch, the user's staged work left out, no rewrite, no attribution, no marker for a failure.
4. **Write its SHA**, from Git's own output (a retyped one once lost three characters), into the attempt's `commit` and
   `commits["spec-review"]`, then re-parse, only once the commit is proven yours: your subject, the parent you noted,
   the spec alone (a marker: nothing). Leave that edit uncommitted: a commit can't hold its own SHA, and the spec's
   next commit carries it. Never amend to carry it, which would change the SHA you just wrote. A newer attempt
   overwrites the key; the old SHA stays in its attempt.

## Reporting and reruns

Saving the attempt, committing it and writing its SHA can each fail alone: say on its own line which happened and which
failed. A rerun resumes rather than duplicates: an attempt whose `commit` is `null` keeps its number and text, as it
records the review that passed (a resume once rewrote it), and a commit that provably holds it (its subject and `Spec:`
trailer, holding that attempt) is reused, so only the missing step runs. If you can't tell which commit an attempt made,
ask: a later `HEAD` may be another agent's.
