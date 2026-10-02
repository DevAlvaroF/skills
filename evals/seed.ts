import { execFileSync } from 'node:child_process'
import { appendFileSync, cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  IssueFileSchema,
  jobRecordTemplate,
  readJobRecord,
  readSpecRecord,
  specRecordTemplate,
} from '@shared/domain'
import { recordProblems } from './job-record-check'
import { specProblems, unreadSpec } from './spec-record-check'

/**
 * The seeds: a step's starting state, built without a Codex session, so one step can be measured alone. Each
 * state is the one before it plus one deterministic step done here, as the skills say that step leaves it — its
 * files, its commits, its recorded SHAs and what it leaves uncommitted.
 *
 * A seed the app can't read wastes a whole Codex run, and JSON.parse alone once missed a schema break that hid a
 * card, so every state is checked with the app's parsers and the skill-check rules before it is reported. A seed
 * is the app's idea of what the step before leaves behind, not what a skill actually leaves: only a chain tests
 * that. `cli.ts` runs these; `tests/unit/evals/seed-states.test.ts` in prompt-kanban builds every state.
 */

const FIXTURES = fileURLToPath(new URL('./fixtures/', import.meta.url))

export interface Seeded { full: string; head: string }
export const FINDINGS = ['none', 'some'] as const
export type Findings = (typeof FINDINGS)[number]
export const PLAN_STAGES = ['B', 'C', 'D', 'E'] as const
export type PlanStage = (typeof PLAN_STAGES)[number]
export const FEATURE_STAGES = ['4', '5', '6', '7'] as const
export type FeatureStage = (typeof FEATURE_STAGES)[number]
export const SPEC_STATES = ['none', 'empty', 'saved', 'committed', 'recorded', 'malformed', 'duplicate'] as const
export type SpecState = (typeof SPEC_STATES)[number]

/** The agents the seeded attempts name: the prompts' coder and reviewer labels. */
const CODER = 'Claude'
const REVIEWER = 'Codex'

function git(repo: string, args: string[]): string {
  return execFileSync('git', args, { cwd: repo, encoding: 'utf8' })
}

const head = (repo: string) => git(repo, ['rev-parse', 'HEAD']).trim()

/** Whether Git ignores a path; `--no-index`, since a tracked file always reads as not ignored. */
function ignored(repo: string, path: string): boolean {
  try {
    git(repo, ['check-ignore', '--no-index', '-q', '--', path])
    return true
  } catch {
    return false
  }
}

/**
 * One commit holding exactly `paths`, by path, the message's paragraphs in order; or, when `marker`, the empty
 * marker that records a review of an ignored file. Either way the user's index is left alone. Returns its SHA.
 */
function commit(repo: string, paragraphs: string[], paths: string[], marker = false): string {
  const message = paragraphs.flatMap((paragraph) => ['-m', paragraph])
  if (marker) git(repo, ['commit', '-q', '--allow-empty', '--only', ...message])
  else {
    git(repo, ['add', '--', ...paths])
    git(repo, ['commit', '-q', ...message, '--', ...paths])
  }
  return head(repo)
}

/** A record template with its JSON replaced by `record`, as a step writes the whole block back. */
function withRecord(template: string, record: unknown): string {
  return template.replace(/```json\n[\s\S]*?\n```/, () => `\`\`\`json\n${JSON.stringify(record, null, 2)}\n\`\`\``)
}

/** Every file under a fixture directory, relative to it. */
function filesUnder(dir: string, base = dir): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? filesUnder(path, base) : [relative(base, path)]
  })
}

/** Lays a code fixture over the repo, which must be the node-app fixture it was written against; returns its paths. */
function applyCode(repo: string, fixture: string): string[] {
  const source = join(FIXTURES, 'code', fixture)
  const current = join(repo, 'src/text.js')
  if (!existsSync(current) || !readFileSync(current, 'utf8').includes('export function capitalize')) {
    throw new Error(`the ${fixture} code fixture needs a repo built from fixtures/node-app (no capitalize in src/text.js)`)
  }
  cpSync(source, repo, { recursive: true })
  return filesUnder(source).sort()
}

/* ---------- setup ---------- */

/**
 * What the setup skill writes in a fresh repo, without a Codex session: its two seeds verbatim, from the skills
 * under test so the tracker's contract matches its readers, and for `local` the one ignore rule that makes Feature
 * files local. For scenarios that start past setup; setup itself stays a scenario step where it is under test.
 */
export function writeSetup(dir: string, setupSkill: string, mode: string): void {
  if (mode !== 'committed' && mode !== 'local') throw new Error('--setup committed|local')
  mkdirSync(join(dir, '.mysdd/docs/agents'), { recursive: true })
  cpSync(join(setupSkill, 'issue-tracker-local.md'), join(dir, '.mysdd/issue-tracker.md'))
  cpSync(join(setupSkill, 'domain.md'), join(dir, '.mysdd/docs/agents/domain.md'))
  if (mode === 'local') appendFileSync(join(dir, '.gitignore'), '.mysdd/features/\n')
}

/* ---------- spec ---------- */

const SECRET_LINE = '\nThe staging deploy key is AKIAIOSFODNN7EXAMPLE; keep it handy for the demo.\n'

const savedAttempt = (sha: string | null) => ({
  attempt: 1, agent: REVIEWER, commit: sha,
  summary: 'Reviewed the spec with the user; it passes the publish checks. No open questions.',
})

/** The spec's record block: the empty template with `attempts` and the live key replaced. */
const specBlock = (attempts: unknown[], sha: string | null) =>
  withRecord(specRecordTemplate(), { commits: { 'spec-review': sha }, attempts })

/** Throws unless the spec reads as `state` expects: a finished state keeps every to-spec promise. */
function checkSpec(full: string, state: SpecState): void {
  const contents = readFileSync(full, 'utf8')
  const read = readSpecRecord(contents)
  const want = state === 'none' ? 'none' : state === 'malformed' || state === 'duplicate' ? 'unusable' : 'read'
  if (read.state !== want) throw new Error(`seeded spec (${state}) reads as ${read.state}, not ${want}: ${unreadSpec(read)}`)
  if (state === 'empty' || state === 'recorded') {
    const problems = specProblems(contents)
    if (problems.length) throw new Error(`seeded spec (${state}) breaks the to-spec contract: ${problems.join(' | ')}`)
  }
}

/**
 * A spec in the state a scenario starts from, at `<repo>/<spec path>`, built from the fixture spec:
 *
 * - `none`: as a contract-5 Step 2 left it, with no record — a legacy spec.
 * - `empty`: as Step 2 leaves it now, ending with `specRecordTemplate()`.
 * - `saved`: a passing review saved attempt 1, `commit: null`, and was interrupted before committing.
 * - `committed`: …and committed it (`REVIEW HISTORY: Record spec review attempt 1`, `Spec:` trailer), but was
 *   interrupted before writing the SHA. The commit is made here, so it is `HEAD` before the step; for an ignored
 *   spec (local mode) it is the empty marker.
 * - `recorded`: …and wrote that SHA into the attempt and `commits`, uncommitted: a finished first review.
 * - `malformed`: the record's JSON does not parse. `duplicate`: a second, column-zero record precedes the real one.
 *
 * Every state but `committed`/`recorded` leaves the spec untracked, as Step 2 does. `secret` then appends a
 * secret-shaped line to Further Notes, uncommitted, for the publication check. `settled` starts from the fixture
 * with its open question answered, as a passing review leaves it.
 */
export function seedSpec(
  repo: string, specPath: string, state: SpecState,
  options: { brief?: string; secret?: boolean; settled?: boolean } = {},
): Seeded {
  let spec = readFileSync(join(FIXTURES, 'specs', options.settled ? 'slugify.settled.md' : 'slugify.md'), 'utf8')
  if (options.brief) spec = spec.replace(/^(# .*\n)/, `$1\nkanban-brief: ${options.brief}\n`)
  const withBlock = (block: string) => `${spec.trimEnd()}\n\n${block}\n`
  const full = join(repo, specPath)
  mkdirSync(dirname(full), { recursive: true })

  switch (state) {
    case 'none': writeFileSync(full, spec); break
    case 'empty': writeFileSync(full, withBlock(specRecordTemplate())); break
    case 'saved': writeFileSync(full, withBlock(specBlock([savedAttempt(null)], null))); break
    case 'committed':
    case 'recorded': {
      writeFileSync(full, withBlock(specBlock([savedAttempt(null)], null)))
      const sha = commit(repo, ['REVIEW HISTORY: Record spec review attempt 1', `Spec: ${specPath}`], [specPath], ignored(repo, specPath))
      if (state === 'recorded') writeFileSync(full, withBlock(specBlock([savedAttempt(sha)], sha)))
      break
    }
    case 'malformed': writeFileSync(full, withBlock(specRecordTemplate().replace('"attempts": []', '"attempts": [,]'))); break
    case 'duplicate': writeFileSync(full, withBlock(`${specRecordTemplate()}\n\n${specRecordTemplate()}`)); break
    default: throw new Error(`unknown --record ${String(state)}`)
  }
  if (options.secret) {
    const text = readFileSync(full, 'utf8')
    writeFileSync(full, text.replace('Not decided yet.\n', `Not decided yet.\n${SECRET_LINE}`))
  }
  checkSpec(full, state)
  return { full, head: head(repo) }
}

/* ---------- plan (steps B–E) ---------- */

type JsonObject = Record<string, unknown>

/** Throws unless the plan's block reads for the Job and keeps every kanban-jobs promise (skill-check). */
function checkPlan(full: string, jobId: string): void {
  const read = readJobRecord(readFileSync(full, 'utf8'), jobId)
  if (read.state !== 'read') throw new Error(`seeded plan: Job ${jobId}'s record is ${read.state}${read.state === 'unusable' ? ` (${read.reason}): ${read.detail}` : ''}`)
  const problems = recordProblems(read.record)
  if (problems.length) throw new Error(`seeded plan breaks the kanban-jobs contract: ${problems.join(' | ')}`)
}

/**
 * A Job's plan at `<repo>/<plan path>` as the step before `at` leaves it, built on the word-count fixtures:
 *
 * - `B`: the fixture plan ending with `jobRecordTemplate(job)`, untracked, as A leaves it. Its Notes leave one
 *   question open (does `--` count as a word?) for B to ask.
 * - `C`: the settled plan (the question answered under `Open questions`) with a B attempt, committed alone as
 *   `REVIEW HISTORY: Record step B attempt 1`, its SHA then written into the attempt and `plan-review`, uncommitted.
 * - `D`: plus `fixtures/code/word-count` committed alone as `CODE: Add wordCount` and a COMPLETE C attempt naming it.
 * - `E`: plus a D attempt reviewing that commit, committed as `REVIEW HISTORY: Record step D attempt 1` and then
 *   recorded. `findings: none` is a PASS with none; `some` is NEEDS FIXES with `fixtures/reviews/word-count.findings.json`:
 *   one real defect planted in the code (tab- and newline-separated words count as one) and one arguable suggestion.
 *
 * An ignored plan is recorded with the empty marker, as the skill does.
 */
export function seedPlan(repo: string, planPath: string, jobId: string, at: PlanStage = 'B', findings?: Findings): Seeded {
  if (!PLAN_STAGES.includes(at)) throw new Error(`--at ${String(at)}: B, C, D or E`)
  if ((at === 'E') !== (findings !== undefined)) throw new Error('--findings none|some goes with --at E, and only there')
  const full = join(repo, planPath)
  mkdirSync(dirname(full), { recursive: true })
  const marker = ignored(repo, planPath)

  if (at === 'B') {
    writeFileSync(full, `${readFileSync(join(FIXTURES, 'plans/word-count.md'), 'utf8').trimEnd()}\n\n${jobRecordTemplate(jobId)}\n`)
    checkPlan(full, jobId)
    return { full, head: head(repo) }
  }

  const plan = readFileSync(join(FIXTURES, 'plans/word-count.settled.md'), 'utf8').trimEnd()
  const commits: Record<string, string | null> = { 'plan-review': null, code: null, 'code-review': null, 'code-fix': null }
  const attempts: JsonObject[] = []
  const write = () => writeFileSync(full, `${plan}\n\n${withRecord(jobRecordTemplate(jobId), { commits, attempts })}\n`)
  /** B and D: save the attempt, commit the plan alone, then write that commit's SHA, uncommitted. */
  const review = (attempt: JsonObject, key: string, subject: string) => {
    attempts.push(attempt)
    write()
    const sha = commit(repo, [subject], [planPath], marker)
    attempt.commit = sha
    commits[key] = sha
    write()
  }

  review({
    step: 'B', attempt: 1, agent: REVIEWER, commit: null,
    summary: 'Reviewed the plan against the request. The one open question, whether `--` counts as a word, has the user\'s answer under Open questions; nothing is open.',
    changes: 'Settled what a word is: a whitespace-separated token holding at least one letter or digit, so `--` is not one (the user\'s answer). Added a punctuation-only case to the tests in step 3.',
  }, 'plan-review', 'REVIEW HISTORY: Record step B attempt 1')
  if (at === 'C') return finishPlan(repo, full, jobId)

  const code = commit(repo, ['CODE: Add wordCount'], applyCode(repo, 'word-count'))
  attempts.push({
    step: 'C', attempt: 1, agent: CODER, commit: code,
    summary: 'Added wordCount(text) to src/text.js and tested it through the export in test/text.test.js: one word, several words, extra spaces, blank text, a punctuation-only token. npm test: 4 tests, 4 passed. Self-review: matches the plan.',
    outcome: 'COMPLETE',
    deviations: 'None.',
  })
  commits.code = code
  write()
  if (at === 'D') return finishPlan(repo, full, jobId)

  const found = findings === 'some'
    ? JSON.parse(readFileSync(join(FIXTURES, 'reviews/word-count.findings.json'), 'utf8')) as JsonObject[]
    : []
  review({
    step: 'D', attempt: 1, agent: REVIEWER, commit: null,
    summary: found.length
      ? 'NEEDS FIXES. One BLOCKING finding: tab- and newline-separated words count as one. One SUGGESTION: non-string input throws. npm test: 4 tests, 4 passed.'
      : 'PASS. wordCount does what the plan says; npm test: 4 tests, 4 passed. Findings: None.',
    reviewedCommits: [code],
    verdict: found.length ? 'NEEDS FIXES' : 'PASS',
    findings: found,
  }, 'code-review', 'REVIEW HISTORY: Record step D attempt 1')
  return finishPlan(repo, full, jobId)
}

function finishPlan(repo: string, full: string, jobId: string): Seeded {
  checkPlan(full, jobId)
  return { full, head: head(repo) }
}

/* ---------- Feature (steps 4–7) ---------- */

const ISSUE_FIXTURES = join(FIXTURES, 'issues/slugify')

/** Throws unless every issue in the Feature parses with `IssueFileSchema` and each `blockedBy` names one of them. */
function checkIssues(issuesDir: string): void {
  const issues = readdirSync(issuesDir).filter((name) => name.endsWith('.json')).map((name) => {
    const parsed = IssueFileSchema.safeParse(JSON.parse(readFileSync(join(issuesDir, name), 'utf8')))
    if (!parsed.success) throw new Error(`seeded issue ${name} fails IssueFileSchema: ${parsed.error.message}`)
    return parsed.data
  })
  const ids = new Set(issues.map((issue) => issue.id))
  for (const issue of issues) {
    const unknown = issue.blockedBy.filter((id) => !ids.has(id))
    if (unknown.length) throw new Error(`seeded issue ${issue.id} is blocked by unknown ${unknown.join(', ')}`)
  }
}

/** The phase 1 record a review leaves, labels in the tracker's order. */
function phaseOneRecord(code: string, findings: Findings): string {
  const found = findings === 'some' ? readFileSync(join(FIXTURES, 'reviews/slugify.findings.txt'), 'utf8').trimEnd() : ''
  return [
    'Final review, phase 1, attempt 1',
    `Reviewed commits: ${code}`,
    `Verdict: ${found ? 'NEEDS FIXES' : 'PASS'}`,
    found ? `Findings:\n${found}` : 'Findings: None.',
  ].join('\n')
}

const IMPLEMENTATION_RECORD = [
  'Implementation record',
  'Verification: npm test, 4 tests, 4 passed.',
  'Review: the two-axis review of src/text.js and test/text.test.js found nothing to change.',
  'Left open: none. ADRs superseded: none.',
  'Deviations and tradeoffs: None.',
].join('\n')

/**
 * A Feature at `<repo>/<feature dir>` as the step before `at` leaves it, built on the slugify fixtures. The repo
 * needs a tracker (`repo --setup committed|local`); in local mode, where `.mysdd/features/` is ignored, every
 * Feature file stays untracked and a review commits the empty marker, as the tracker says.
 *
 * - `4`: the settled spec with a finished first review (`seedSpec … recorded`), as Step 3 leaves it.
 * - `5`: plus `fixtures/issues/slugify/` (02 is blocked by 01), committed with the spec as `SPEC: …` (local: no commit).
 * - `6`: plus `fixtures/code/slugify` committed as `CODE: Add slugify` with `Issue:` and `Spec:` trailers, and issue
 *   01 advanced as implement leaves it: criteria ticked, `codeCommit`, the implementation record, uncommitted.
 * - `7`: plus a phase 1 record on issue 01, committed alone as `REVIEW HISTORY: Record final review attempt 1`
 *   (local: the marker), its SHA then written to `reviewHistoryCommit`, uncommitted. `findings` as for `seedPlan`'s
 *   E: `some` is `fixtures/reviews/slugify.findings.txt`, one real defect planted in the code (an underscore
 *   survives) and one arguable suggestion.
 */
export function seedFeature(repo: string, featureDir: string, at: FeatureStage, options: { findings?: Findings; brief?: string } = {}): Seeded {
  if (!FEATURE_STAGES.includes(at)) throw new Error(`--at ${String(at)}: 4, 5, 6 or 7`)
  if ((at === '7') !== (options.findings !== undefined)) throw new Error('--findings none|some goes with --at 7, and only there')
  if (!existsSync(join(repo, '.mysdd/issue-tracker.md'))) throw new Error('seed-feature needs a tracker: make the repo with --setup committed|local')
  const local = ignored(repo, '.mysdd/features/')
  const full = join(repo, featureDir)
  const specPath = `${featureDir}/spec.md`

  seedSpec(repo, specPath, 'recorded', { brief: options.brief, settled: true })
  if (at === '4') return { full, head: head(repo) }

  const issuesDir = join(full, 'issues')
  mkdirSync(issuesDir, { recursive: true })
  const issuePaths = readdirSync(ISSUE_FIXTURES).sort().map((name) => {
    const issue = JSON.parse(readFileSync(join(ISSUE_FIXTURES, name), 'utf8')) as JsonObject
    issue.spec = specPath
    writeFileSync(join(issuesDir, name), `${JSON.stringify(issue, null, 2)}\n`)
    return `${featureDir}/issues/${name}`
  })
  checkIssues(issuesDir)
  if (!local) commit(repo, ['SPEC: Split slugify into two issues'], [specPath, ...issuePaths])
  if (at === '5') return { full, head: head(repo) }

  const issuePath = issuePaths[0]!
  const issueFull = join(repo, issuePath)
  const issue = JSON.parse(readFileSync(issueFull, 'utf8')) as JsonObject & { acceptanceCriteria: JsonObject[]; comments: JsonObject[] }
  const writeIssue = () => {
    writeFileSync(issueFull, `${JSON.stringify(issue, null, 2)}\n`)
    checkIssues(issuesDir)
  }
  const code = commit(repo, ['CODE: Add slugify', `Issue: ${issuePath}\nSpec: ${specPath}`], applyCode(repo, 'slugify'))
  for (const criterion of issue.acceptanceCriteria) criterion.done = true
  issue.status = 'done-coding-awaiting-final-review'
  issue.codeCommit = code
  issue.comments.push({ author: CODER, body: IMPLEMENTATION_RECORD })
  writeIssue()
  if (at === '6') return { full, head: head(repo) }

  issue.comments.push({ author: REVIEWER, body: phaseOneRecord(code, options.findings!) })
  writeIssue()
  issue.reviewHistoryCommit = commit(repo, ['REVIEW HISTORY: Record final review attempt 1', `Issue: ${issuePath}`], [issuePath], local)
  writeIssue()
  return { full, head: head(repo) }
}
