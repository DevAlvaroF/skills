import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import {
  SpecRecordSchema,
  readSpecRecord,
  specRecordTemplate,
  type SpecRecord,
  type SpecRecordRead,
} from '@shared/domain'

/**
 * The maintainer's Spec Record checker: what the to-spec skills promise about
 * a spec's `<spec-record>` block beyond what the app reads. The app reads
 * `commits` alone; the skills also promise the attempts' numbering, that a
 * finished review recorded the commit it made, that `commits["spec-review"]`
 * names the latest one, and that the record stays the spec's end. This checks
 * those, for the skills' own examples and for any spec an agent wrote.
 *
 * Like `job-record-check.ts`, it lives in `evals/`, outside `skills/`, so it is
 * never installed, and it reads blocks with the app's own `readSpecRecord`,
 * never a copy. `npm run skill-check` runs it; `tracker-contract.test.ts` and
 * the eval `spec` check call it too.
 */

export const FLAVOURS = ['modified-matt', 'makerkit-custom'] as const

/** The fields every Spec Record attempt carries, as REVIEW.md's example shows them. */
export const ATTEMPT_FIELDS = ['attempt', 'agent', 'commit', 'summary'] as const

const CLOSE_TAG = '</spec-record>'

type JsonObject = Record<string, unknown>
const isObject = (value: unknown): value is JsonObject => typeof value === 'object' && value !== null && !Array.isArray(value)

/** JSON with object keys sorted, so a rewrite that only reorders keys compares equal. */
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`
  if (isObject(value)) return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`
  return JSON.stringify(value)
}

/** A read of a spec's record, as the evidence line a failed check shows. */
export function unreadSpec(read: SpecRecordRead): string {
  return read.state === 'none' ? 'no <spec-record> block' : read.state === 'unusable' ? `unusable (${read.reason}): ${read.detail}` : ''
}

/**
 * What is wrong with a record the app already reads: attempts numbered 1, 2,
 * 3… in order; every attempt holding the commit it made, since a review only
 * records once it commits and a `null` left behind is an interrupted one; and
 * `commits["spec-review"]` naming the latest of them.
 */
export function specRecordProblems(record: SpecRecord): string[] {
  const problems: string[] = []
  record.attempts.forEach((attempt, index) => {
    if (attempt.attempt !== index + 1) problems.push(`attempts are numbered ${record.attempts.map((a) => a.attempt).join(', ')}, not 1…${record.attempts.length} in order`)
    if (attempt.commit === null) problems.push(`attempts[${index}] (attempt ${attempt.attempt}) records no commit: a review interrupted before its SHA was written`)
  })
  const latest = record.attempts.map((attempt) => attempt.commit).filter((commit) => commit !== null).at(-1) ?? null
  if (record.commits['spec-review'] !== latest) {
    problems.push(`commits["spec-review"] is ${record.commits['spec-review'] ?? 'null'}, but the latest commit an attempt made is ${latest ?? 'none'}`)
  }
  return [...new Set(problems)]
}

/** Anything but blank lines after the record's closing tag: the record stays the spec's end. */
export function trailingProblems(contents: string): string[] {
  const lines = contents.split('\n').map((line) => (line.endsWith('\r') ? line.slice(0, -1) : line))
  const close = lines.lastIndexOf(CLOSE_TAG)
  if (close === -1) return []
  const after = lines.slice(close + 1).filter((line) => line.trim() !== '')
  return after.length ? [`${after.length} non-blank line(s) follow ${CLOSE_TAG}, starting "${after[0]!.slice(0, 40)}": the record stays the spec's end`] : []
}

/** What is wrong with a spec as an agent left it: no record, an unusable one, or one breaking the skill's promises. */
export function specProblems(contents: string): string[] {
  const read = readSpecRecord(contents)
  if (read.state !== 'read') return [unreadSpec(read)]
  return [...specRecordProblems(read.record), ...trailingProblems(contents)]
}

/** Every SHA a record holds, with where it sits. */
export function recordedSpecShas(record: SpecRecord): Array<{ at: string; sha: string }> {
  const out = record.commits['spec-review'] === null ? [] : [{ at: 'commits.spec-review', sha: record.commits['spec-review'] }]
  record.attempts.forEach((attempt, index) => {
    if (attempt.commit !== null) out.push({ at: `attempts[${index}].commit`, sha: attempt.commit })
  })
  return out
}

/**
 * The writing rule between two reads of one record: every earlier attempt is
 * still there, in order and unchanged — except that an attempt saved with
 * `commit: null` may gain the commit a rerun proved it made — new ones only
 * follow, and the live key never goes back to `null`.
 */
export function specGrowthProblems(before: SpecRecord, after: SpecRecord): string[] {
  const problems: string[] = []
  if (after.attempts.length < before.attempts.length) problems.push(`${before.attempts.length} attempts before, ${after.attempts.length} now`)
  before.attempts.forEach((attempt, index) => {
    const now = after.attempts[index]
    if (now === undefined || canonical(attempt) === canonical(now)) return
    const completed = attempt.commit === null && now.commit !== null && canonical({ ...attempt, commit: now.commit }) === canonical(now)
    if (!completed) problems.push(`attempts[${index}] changed`)
  })
  if (before.commits['spec-review'] !== null && after.commits['spec-review'] === null) problems.push('commits.spec-review went back to null')
  return problems
}

/** Every `*.md` under a directory, recursively. */
function markdownUnder(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return markdownUnder(path)
    return name.endsWith('.md') ? [path] : []
  })
}

/** The one fenced `json` block a file holds, list indentation removed, or why there isn't one. */
function jsonExample(text: string): { value: unknown } | { problem: string } {
  const fences = [...text.matchAll(/^( *)```json\n([\s\S]*?)^\1```$/gm)]
  if (fences.length !== 1) return { problem: `holds ${fences.length} json examples, not one` }
  const [, indent, body] = fences[0]!
  const json = body!.split('\n').map((line) => (line.startsWith(indent!) ? line.slice(indent!.length) : line)).join('\n')
  try {
    return { value: JSON.parse(json) }
  } catch (error) {
    return { problem: `its example is not valid JSON (${error instanceof Error ? error.message : String(error)})` }
  }
}

/**
 * What is wrong with the skills' own statement of the record, under
 * `skillsRoot` (the repo's `skills/`), for each flavour: to-spec's `SKILL.md`
 * shows exactly `specRecordTemplate()`, once, at column zero, and links
 * `REVIEW.md`; `REVIEW.md` holds one fenced `json` attempt — every field the
 * record carries, attempt 1, no commit yet — that the schema accepts inside
 * the template, and no record of its own. No other skill file holds a
 * column-zero record, which an agent reading it could copy into a spec.
 */
export function specSkillProblems(skillsRoot: string): string[] {
  const problems: string[] = []
  const template = specRecordTemplate()
  /** The files checked above, each on its own terms: the sweep below covers the rest. */
  const checked = new Set<string>()

  for (const flavour of FLAVOURS) {
    const dir = `${flavour}/${flavour}-to-spec`
    const read = (name: string) => readFileSync(join(skillsRoot, dir, name), 'utf8').replaceAll('\r\n', '\n')
    checked.add(`${dir}/SKILL.md`).add(`${dir}/REVIEW.md`)

    const skill = read('SKILL.md')
    const copies = skill.split(template).length - 1
    if (copies !== 1) problems.push(`${dir}/SKILL.md holds specRecordTemplate() ${copies} times, not once`)
    const own = readSpecRecord(skill)
    if (own.state !== 'read') problems.push(`${dir}/SKILL.md: its block does not read as one record (${unreadSpec(own)})`)
    else if (own.record.commits['spec-review'] !== null || own.record.attempts.length > 0) problems.push(`${dir}/SKILL.md: its block is not the empty record`)
    if (!skill.includes('(./REVIEW.md)')) problems.push(`${dir}/SKILL.md does not link ./REVIEW.md`)

    const review = read('REVIEW.md')
    if (readSpecRecord(review).state !== 'none') problems.push(`${dir}/REVIEW.md holds a column-zero <spec-record> line: indent or quote an example`)
    const example = jsonExample(review)
    if ('problem' in example) {
      problems.push(`${dir}/REVIEW.md ${example.problem}`)
      continue
    }
    if (!isObject(example.value)) {
      problems.push(`${dir}/REVIEW.md: its example is not a JSON object`)
      continue
    }
    const attempt = example.value
    for (const field of ATTEMPT_FIELDS) if (!(field in attempt)) problems.push(`${dir}/REVIEW.md: its example has no "${field}"`)
    if (attempt.attempt !== 1) problems.push(`${dir}/REVIEW.md: its example is attempt ${JSON.stringify(attempt.attempt)}, not 1`)
    if (attempt.commit !== null) problems.push(`${dir}/REVIEW.md: its example's commit is ${JSON.stringify(attempt.commit)}, not null — the attempt is saved before its commit`)
    const empty = JSON.parse(template.split('\n').slice(3, -3).join('\n')) as { attempts: unknown[] }
    const parsed = SpecRecordSchema.safeParse({ ...empty, attempts: [attempt] })
    if (!parsed.success) problems.push(`${dir}/REVIEW.md: the template holding its example fails SpecRecordSchema (${parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')})`)
  }

  for (const path of markdownUnder(skillsRoot)) {
    const relative = path.slice(skillsRoot.length).replace(/^\/+/, '')
    if (checked.has(relative)) continue
    if (readSpecRecord(readFileSync(path, 'utf8')).state !== 'none') problems.push(`${relative} holds a column-zero <spec-record> line: only to-spec's SKILL.md shows the record`)
  }
  return problems
}
