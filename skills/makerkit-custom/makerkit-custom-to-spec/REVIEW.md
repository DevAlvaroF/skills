# Reviewing an existing spec

When the spec already exists, review that `spec.md` adversarially with the user and edit it in place; don't write a new
one. Read the tracker and the project's docs as SKILL.md says first, and stop if the mode is unresolved. Find what is
underspecified, what contradicts itself or a binding ADR, and what it has decided without saying so, and cut what isn't
needed. Interview the user about every gap and open decision rather than guess: a guessed answer becomes a requirement
nobody agreed to. Implement nothing.

- A Spec Record that doesn't parse or match SKILL.md's shape, or a second one, stops the review before you write
  anything: it may hold the only copy of earlier attempts.
- Change the record by parsing it, changing only your own attempt and the `spec-review` key, writing the whole block
  back as valid JSON, then re-parsing it: a hand-edited fragment is how a record breaks.

## Finishing

The review finishes only when the spec passes SKILL.md § Before you publish, with its test boundaries confirmed by the
user; until then nothing is recorded, per the tracker's § Commits done rules. Once it passes, record it whatever you
changed:

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

2. **Check what you publish.** Before every review commit that holds the spec (the empty marker holds nothing), read the
   whole spec and stop on anything secret-shaped (keys, tokens, `sk-`/`ghp_`/`AKIA` prefixes, private keys, credentialed
   URLs, `.env`-style secrets, PII, customer data), telling the user what and where: the commit puts the spec in
   history, which outlives any later redaction.
3. **Commit it** per the tracker's § Commits: `REVIEW HISTORY: Record spec review attempt <N>`, trailer
   `Spec: <spec path>`, holding the spec alone; in local mode, the empty marker per § Commits. A commit holding a path
   that isn't yours: record nothing more and report it, per § Commits.
4. **Write its SHA** into the attempt's `commit` and `commits["spec-review"]`. A newer attempt overwrites the key; the
   old SHA stays in its attempt.

## Reporting and reruns

Saving the attempt, committing it and writing its SHA can each fail alone: say on its own line which happened and which
failed. A rerun resumes rather than duplicates: an attempt whose `commit` is `null` keeps its number and text, as it
records the review that passed (a resume once rewrote it), and a commit that provably holds it (its subject and `Spec:`
trailer, holding that attempt) is reused, so only the missing step runs.
