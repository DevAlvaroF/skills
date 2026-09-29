# Issue tracker: Local Files

Tracker contract: 5

Read this file whole before any spec, issue or review work: the skills take their formats and commit rules from here.
`/makerkit-custom-setup-skills` writes the contract line above; a skill expecting another number stops. Never edit it.

## Layout

- A Feature is `.mysdd/features/<NN>-<feature-slug>/`, `NN` the next two-digit number after the highest on disk (`01`
  when `.mysdd/features/` doesn't exist yet). A Feature-shaped directory directly under `.mysdd/` is the old layout:
  never read or move it; stop and ask the user to move it under `.mysdd/features/` and fix its issues' `spec` paths.
- The spec is `<feature>/spec.md`. Each issue is one strict-JSON file, `<feature>/issues/<NN>-<slug>.json`, numbered on
  from the highest in `issues/` and `issues/archive/`. Ids and filenames never change and are never reused:
  `blockedBy` addresses issues by them. An id found only under `issues/archive/` is a Retired Issue and counts as
  resolved.
- "Publish to the issue tracker" means create that file; "fetch the relevant issue" means read and parse it.
- Change an issue by parsing it and writing the whole object back, every field present: other programs parse it.
- Feature directories get deleted; `.mysdd/docs/` stays, so nothing there names an issue, a `US-NNN`, a spec or a
  Feature directory.

## Committed or local

`.mysdd/issue-tracker.md`, `.mysdd/docs/` and `.mysdd/kanban-boards.json` are always committed, never ignored, so the
config, decisions and board travel with the repo. Feature files are in one mode for every Feature:

- **Committed**: nothing under `.mysdd/features/` is ignored; specs and issues are committed per § Commits.
- **Local**: `.mysdd/features/` is ignored as a whole and no Feature file is tracked; specs and issues are written,
  never staged, and § Commits' local column applies.

Anything else is unresolved, never local: stop before writing, list the paths, and point to
`/makerkit-custom-setup-skills`. Never force-add, untrack or edit an ignore rule to change the mode: it is the user's.

- Use `git check-ignore --no-index`: without it a tracked file always reads as not ignored.
- Check the root as `.mysdd/features/`, slash included: before it exists Git matches directory rules only that way.

## Issue shape

```json
{
  "id": "<NN>",
  "slug": "<slug>",
  "title": "<Issue title>",
  "status": "ready-for-agent",
  "spec": ".mysdd/features/<NN>-<feature-slug>/spec.md",
  "whatToBuild": "The end-to-end behaviour this issue makes work, from the user's perspective, not a layer-by-layer implementation list.",
  "blockedBy": [
    "<NN>"
  ],
  "testBoundaries": [
    "<boundary description>"
  ],
  "covers": [
    "US-003"
  ],
  "codeCommit": null,
  "reviewHistoryCommit": null,
  "reviewCodeCommit": null,
  "acceptanceCriteria": [
    {
      "text": "Acceptance criterion 1",
      "done": false
    }
  ],
  "comments": [
    {
      "author": "<who>",
      "body": "<comment>"
    }
  ]
}
```

`spec` is `null` for an issue drafted without one, and then `covers` is `[]`. `blockedBy`, `testBoundaries`, `covers`
and `comments` may be `[]`. The three commit fields hold a full 40-character SHA or `null`; a later round overwrites
its field.

Each field has one writer; every other skill carries it over verbatim, because it may be the only copy:

| Field | Writer |
|---|---|
| everything, with `status: ready-for-agent` | to-issues (a re-sync keeps each `done`) |
| `acceptanceCriteria[].done`, `codeCommit`, `status: done-coding-awaiting-final-review` | implement, after its `CODE:` commit |
| `testBoundaries` additions the user agreed | implement |
| `reviewHistoryCommit` | final review phase 1, after its record commit |
| `reviewCodeCommit` | final review phase 2, after its fix commit |
| `status: done-final-review` | final review phase 2, only on `Outcome: COMPLETE` |
| `comments` (append only) | implement, final review |

## Status lifecycle

```text
ready-for-agent -> done-coding-awaiting-final-review -> done-final-review
```

The final review runs in two fresh sessions. Phase 1 records every finding, fixes nothing, and never changes `status`,
whatever its verdict: untriaged findings can't close an issue. Phase 2 triages every finding with the user; only a
COMPLETE triage sets `done-final-review`, and it runs even with zero findings, because the checks must still pass. A
fix round never changes `status`, and a reviewed issue never returns to `ready-for-agent`.

## Comment records

A record is recognised by the label its body opens with, never by author or position; free text may follow. Never
edit or remove one: a correction is a new entry.

**Implementation record** (implement): verification and its output, the review outcome, anything left open, each ADR
superseded, and a part opening `Deviations and tradeoffs:` naming each deviation and deliberate tradeoff with its
reason, or `Deviations and tradeoffs: None.`

**Phase 1 review record**, these lines in order:

- `Final review, phase 1, attempt <N>`: one more than the phase 1 records already there.
- `Reviewed commits: <SHAs>`: `codeCommit` and each fix commit since, full, oldest first, space-separated.
- `Verdict: PASS` (every criterion verified, nothing blocked, no BLOCKING finding) or `Verdict: NEEDS FIXES`.
- `Findings:` then numbered lines: `BLOCKING` or `SUGGESTION`, location, impact, correction; an unrunnable required
  check is BLOCKING. `Findings: None.` when there are none.

**Phase 2 triage record**, these lines in order:

- `Final review, phase 2, attempt <K>`: one more than the phase 2 records already there.
- `Answers: phase 1 attempt <N>, reviewed commits <SHAs>`
- `Outcome: COMPLETE` (every finding has a user-approved disposition, every fix verified, every check passes),
  `Outcome: INCOMPLETE` or `Outcome: BLOCKED`.
- `Verdicts:` then one line per finding, numbered as in phase 1: `FIXED` with how it was verified; `REJECTED` or
  `DEFERRED` with the reason the user approved; `UNRESOLVED — approved FIX: <what>; blocker: <failure>`; or
  `UNRESOLVED — no approved disposition`. `Verdicts: None.` when phase 1 found nothing.
- `Checks:` the checks run and their results.
- `Fix commit:` the `CODE REVIEW FIXES:` SHA, or `Fix commit: None.`
- `Attempt plans:` a JSON array of `{path, provenance, blob, commit | reason}`, or `Attempt plans: []`.
- `ADRs superseded:` each by number and title with its replacement, or `ADRs superseded: None.`

A later attempt on the same review keeps earlier FIXED, REJECTED and DEFERRED verdicts and works only on UNRESOLVED.

```text
Final review, phase 1, attempt 1
Reviewed commits: 3f9a1c07d2b84e5f6a1b2c3d4e5f60718293a4b5
Verdict: PASS
Findings:
1. SUGGESTION — src/seats/guard.ts:42. Impact: the revoked-seat branch has no test. Correction: cover it with a test.
```

```text
Final review, phase 2, attempt 1
Answers: phase 1 attempt 1, reviewed commits 3f9a1c07d2b84e5f6a1b2c3d4e5f60718293a4b5
Outcome: COMPLETE
Verdicts:
1. FIXED — src/seats/guard.test.ts; the new revoked-seat test fails without the guard and passes with it.
Checks: typecheck passed; test suite passed.
Fix commit: 8c2d4e6f0a1b3c5d7e9f1a2b4c6d8e0f1a3b5c7d
Attempt plans: []
ADRs superseded: None.
```

## Commits

Subjects are ≤72 characters. `<issue path>` is repo-root-relative, starting `.mysdd/features/`.

| Operation | Subject | Body, trailers | Holds exactly | Local mode |
|---|---|---|---|---|
| to-issues | `SPEC: <subject>` | optional why | spec, the issues it wrote, changed `.mysdd/docs/CONTEXT.md` and ADRs | glossary and ADRs only, else none |
| implement | `CODE: <subject>` | optional why; `Issue: <issue path>` per issue; `Spec: <spec path>` unless `null` | the implementation, plus agreed ADRs and `AGENTS.md` convention lines | same |
| phase 2 fixes | `CODE REVIEW FIXES: <subject>` | as `CODE:` | the approved fixes, agreed ADRs, check rewrites in the change's files | same |
| phase 1 | `REVIEW HISTORY: Record final review attempt <N>` | `Issue: <issue path>` | the issue file | empty marker: its tree equals its parent's, the user's index untouched |
| phase 2 plans | `ATTEMPT PLANS: final review <issue path> attempt <K>` | none | plans this attempt provably created, not ignored or bound elsewhere | same |
| phase 2 close | `Closed Issue: <issue path>` | none | the issue file, plus `.mysdd/kanban-boards.json` if changed | none: the status change is the close |

The code prefix follows `codeCommit`: `null` → `CODE: `, a SHA → `CODE REVIEW FIXES: `. One commit per issue where
the work separates. Final review finds the change by its `Issue:` trailers, so write them in both modes, as the
message's last paragraph with no blank line between them: Git reads only that block as trailers (a run once split
them into separate `-m` paragraphs, and `Issue:` stopped being one).

**Hard limits**:

- Current branch only: it is the one the user chose.
- Only your own paths; the user's staged work stays staged and out, because it's theirs to commit.
- Never amend, rebase, reset or push: a recorded SHA would be orphaned, and publishing is the user's call.
- Never force-add, untrack or edit ignore rules: that changes the mode the user chose.
- No empty commit except the local marker: nothing to commit means no commit.
- No `Co-Authored-By` or other attribution: the message reads the same whoever wrote it.

**Done rules**:

- Every review commits its record (the marker in local mode), so `git log` alone shows it ran. The marker is never a
  fallback for an unresolved mode or a failed commit.
- The recorded SHA is the commit this session made, never a later `HEAD`.
- A commit holding a path that isn't yours is never recorded: report its SHA and the foreign paths, end the attempt
  INCOMPLETE or BLOCKED, and don't amend, reset or retry.
- A commit can't hold its own SHA: write it to the issue afterwards, uncommitted; the issue's next commit carries it.
- A saved record or status doesn't prove its commit landed: a retry makes only the missing commit.

**Pitfalls from real runs**:

- zsh globbing: quote every path; zsh expands or rejects `[locale]` and `(group)`. Use literal pathspecs too.
- A bare `git commit` sweeps in the user's staged work: name your paths (`git commit --only -- <paths>`).
- Hooks add paths: check what the new commit holds before recording it.
- `HEAD` moves: another agent may commit next, so take the SHA from your own commit's output.
