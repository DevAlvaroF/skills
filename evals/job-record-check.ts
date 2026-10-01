import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import {
  JOB_RECORD_CONTRACT,
  JobRecordSchema,
  RECORDED_SHA_PATTERN,
  jobRecordTemplate,
  planJobIds,
  readJobRecord,
  type JobRecord,
  type PlanRecordStepKey,
} from '@shared/domain'

/**
 * The maintainer's Job Record checker: what `kanban-jobs` promises about a
 * record beyond what the app reads. The app reads `commits` alone; the skill
 * also promises each attempt's fields, its numbering, and that a key holds the
 * commit its latest attempt made. This checks those, for the skill's own
 * examples and for any plan an agent wrote.
 *
 * It lives in `evals/`, outside `skills/`, so `npx skills` never installs it: an
 * installed skill stays prose-only and self-contained (AGENTS.md), and this is a
 * tool for whoever changes the skills. The block grammar is the app's
 * (`readJobRecord`), never a copy, so the two cannot disagree about what a
 * block is. `npm run skill-check` runs it; `kanban-jobs-contract.test.ts` and the
 * eval `plan` check call it too.
 */

export type Step = 'B' | 'C' | 'D' | 'E'

export const KEY_OF = { B: 'plan-review', C: 'code', D: 'code-review', E: 'code-fix' } as const satisfies Record<Step, PlanRecordStepKey>
const STEPS = Object.keys(KEY_OF) as Step[]

/** Every attempt's fields, and each step's own — the keys the step files' examples carry. */
export const COMMON_FIELDS = ['step', 'attempt', 'agent', 'commit', 'summary'] as const
export const STEP_FIELDS: Record<Step, readonly string[]> = {
  B: ['changes'],
  C: ['outcome', 'deviations'],
  D: ['reviewedCommits', 'verdict', 'findings'],
  E: ['reviewAttempt', 'reviewedCommits', 'outcome', 'verdicts', 'attemptPlans'],
}

/** The keys of one D finding and one E verdict; both are numbered so E can answer D by `n`. */
const FINDING_FIELDS = ['n', 'severity', 'location', 'impact', 'correction'] as const
const VERDICT_FIELDS = ['n', 'result', 'detail'] as const

type JsonObject = Record<string, unknown>
const isObject = (value: unknown): value is JsonObject => typeof value === 'object' && value !== null && !Array.isArray(value)

function missing(object: JsonObject, fields: readonly string[]): string[] {
  return fields.filter((field) => !(field in object))
}

/** An example's placeholder SHA (`"<full SHA, …>"`) is allowed only where `examples` says so. */
const isPlaceholder = (value: unknown) => typeof value === 'string' && /^<[^>]*>$/.test(value)

/**
 * What is wrong with one attempt object, each problem prefixed by `where`.
 * `examples` accepts the step files' `<…>` placeholders where a real record
 * holds SHAs.
 */
export function attemptProblems(attempt: unknown, where: string, examples = false): string[] {
  if (!isObject(attempt)) return [`${where}: not a JSON object`]
  const step = attempt.step as Step
  if (!STEPS.includes(step)) return [`${where}: step ${JSON.stringify(attempt.step)} is not B, C, D or E`]
  const problems = [...missing(attempt, [...COMMON_FIELDS, ...STEP_FIELDS[step]])].map((field) => `${where}: step ${step} attempt has no "${field}"`)
  const list = (field: string) => field in attempt && !Array.isArray(attempt[field]) ? [`${where}: "${field}" is not an array`] : []
  if (step === 'D' || step === 'E') {
    problems.push(...list('reviewedCommits'))
    for (const [index, sha] of (Array.isArray(attempt.reviewedCommits) ? attempt.reviewedCommits : []).entries()) {
      if (!(typeof sha === 'string' && RECORDED_SHA_PATTERN.test(sha)) && !(examples && isPlaceholder(sha))) {
        problems.push(`${where}: reviewedCommits[${index}] ${JSON.stringify(sha)} is not a full 40-character SHA`)
      }
    }
  }
  if (step === 'D') {
    problems.push(...list('findings'))
    for (const [index, finding] of (Array.isArray(attempt.findings) ? attempt.findings : []).entries()) {
      if (!isObject(finding)) problems.push(`${where}: findings[${index}] is not an object`)
      else problems.push(...missing(finding, FINDING_FIELDS).map((field) => `${where}: findings[${index}] has no "${field}"`))
    }
  }
  if (step === 'E') {
    problems.push(...list('verdicts'), ...list('attemptPlans'))
    for (const [index, verdict] of (Array.isArray(attempt.verdicts) ? attempt.verdicts : []).entries()) {
      if (!isObject(verdict)) problems.push(`${where}: verdicts[${index}] is not an object`)
      else problems.push(...missing(verdict, VERDICT_FIELDS).map((field) => `${where}: verdicts[${index}] has no "${field}"`))
    }
  }
  return problems
}

/**
 * What is wrong with a record the app already reads: its attempts, their
 * numbering (1, 2, 3… per step, in order), and each `commits` key against the
 * latest commit its step's attempts made. A key with no attempt behind it is
 * reported too: the skill never writes one, though a user editing by hand might.
 */
export function recordProblems(record: JobRecord): string[] {
  const problems = record.attempts.flatMap((attempt, index) => attemptProblems(attempt, `attempts[${index}]`))
  for (const step of STEPS) {
    const mine = record.attempts.filter((attempt) => attempt.step === step)
    mine.forEach((attempt, index) => {
      if (attempt.attempt !== index + 1) problems.push(`step ${step}'s attempts are numbered ${mine.map((a) => a.attempt).join(', ')}, not 1…${mine.length} in order`)
    })
    const key = KEY_OF[step]
    const latest = mine.map((attempt) => attempt.commit).filter((commit) => commit !== null).at(-1) ?? null
    if (record.commits[key] !== latest) {
      problems.push(`commits["${key}"] is ${record.commits[key] ?? 'null'}, but the latest commit a step ${step} attempt made is ${latest ?? 'none'}`)
    }
  }
  return [...new Set(problems)]
}

/** Every SHA a record holds, with where it sits: `commits`, each attempt's `commit` and `reviewedCommits`. */
export function recordedShas(record: JobRecord): Array<{ at: string; sha: string }> {
  const out = Object.entries(record.commits).flatMap(([key, sha]) => (sha === null ? [] : [{ at: `commits.${key}`, sha }]))
  record.attempts.forEach((attempt, index) => {
    if (attempt.commit !== null) out.push({ at: `attempts[${index}].commit`, sha: attempt.commit })
    const reviewed = Array.isArray(attempt.reviewedCommits) ? attempt.reviewedCommits : []
    reviewed.forEach((sha, n) => out.push({ at: `attempts[${index}].reviewedCommits[${n}]`, sha: String(sha) }))
  })
  return out
}

/** JSON with object keys sorted, so a rewrite that only reorders keys compares equal. */
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`
  if (isObject(value)) return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`
  return JSON.stringify(value)
}

/**
 * The writing rule between two reads of one record: every earlier attempt is
 * still there, unchanged and in order, new ones only follow, and at most one
 * `commits` key changed — the step's own — and never back to `null`.
 */
export function growthProblems(before: JobRecord, after: JobRecord): string[] {
  const problems: string[] = []
  if (after.attempts.length < before.attempts.length) problems.push(`${before.attempts.length} attempts before, ${after.attempts.length} now`)
  before.attempts.forEach((attempt, index) => {
    if (index < after.attempts.length && canonical(attempt) !== canonical(after.attempts[index])) problems.push(`attempts[${index}] changed`)
  })
  const changed = (Object.keys(after.commits) as PlanRecordStepKey[]).filter((key) => before.commits[key] !== after.commits[key])
  if (changed.length > 1) problems.push(`commits changed: ${changed.join(', ')}`)
  for (const key of changed) if (after.commits[key] === null) problems.push(`commits.${key} went back to null`)
  return problems
}

/** Each Job a plan holds a block for, and what is wrong with its record: unreadable, or breaking the skill's promises. */
export function planProblems(contents: string): Array<{ jobId: string; problems: string[] }> {
  return planJobIds(contents).map((jobId) => {
    const read = readJobRecord(contents, jobId)
    if (read.state === 'none') return { jobId, problems: ['no block for this Job'] }
    if (read.state === 'unusable') return { jobId, problems: [`unusable (${read.reason}): ${read.detail}`] }
    return { jobId, problems: recordProblems(read.record) }
  })
}

/** Every `*.md` under a directory, recursively. */
function markdownUnder(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return markdownUnder(path)
    return name.endsWith('.md') ? [path] : []
  })
}

/**
 * What is wrong with the skills' own statement of the record, under
 * `skillsRoot` (the repo's `skills/`): `kanban-jobs` states this reader's
 * contract and shows exactly `jobRecordTemplate('<jobId>')`; each `STEP-<X>.md`
 * holds one fenced `json` attempt of its own step that a record built from the
 * template accepts; and no skill file holds a block for a real Job id, which
 * an agent reading it could copy into a plan as a record.
 */
export function skillProblems(skillsRoot: string): string[] {
  const dir = join(skillsRoot, 'kanban/kanban-jobs')
  const read = (name: string) => readFileSync(join(dir, name), 'utf8').replaceAll('\r\n', '\n')
  const problems: string[] = []

  const skill = read('SKILL.md')
  const stated = /^Job Record contract: (\d+)$/m.exec(skill)?.[1]
  if (stated !== String(JOB_RECORD_CONTRACT)) problems.push(`SKILL.md states Job Record contract ${stated ?? '(none)'}, the app reads ${JOB_RECORD_CONTRACT}`)
  const template = jobRecordTemplate('<jobId>')
  const copies = skill.split(template).length - 1
  if (copies !== 1) problems.push(`SKILL.md holds jobRecordTemplate('<jobId>') ${copies} times, not once`)

  for (const step of STEPS) {
    const name = `STEP-${step}.md`
    const fences = [...read(name).matchAll(/^ *```json\n([\s\S]*?)^ *```$/gm)]
    if (fences.length !== 1) {
      problems.push(`${name} holds ${fences.length} json examples, not one`)
      continue
    }
    let example: unknown
    try {
      example = JSON.parse(fences[0]![1]!)
    } catch (error) {
      problems.push(`${name}: its example is not valid JSON (${error instanceof Error ? error.message : String(error)})`)
      continue
    }
    problems.push(...attemptProblems(example, name, true))
    if (isObject(example) && example.step !== step) problems.push(`${name}: its example is a step ${JSON.stringify(example.step)} attempt`)
    const record = JSON.parse(template.split('\n').slice(3, -3).join('\n')) as { attempts: unknown[] }
    const placeholdersCleared = JSON.parse(JSON.stringify(example), (key, value) => (key === 'reviewedCommits' ? [] : value))
    const parsed = JobRecordSchema.safeParse({ ...record, attempts: [placeholdersCleared] })
    if (!parsed.success) problems.push(`${name}: the template holding its example fails JobRecordSchema (${parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')})`)
  }

  for (const path of markdownUnder(skillsRoot)) {
    const ids = planJobIds(readFileSync(path, 'utf8'))
    if (ids.length > 0) problems.push(`${path.slice(skillsRoot.length + 1)} holds a block for the real Job id ${ids.join(', ')}`)
  }
  return problems
}
