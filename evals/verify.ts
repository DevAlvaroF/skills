import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { GitHistoryService } from '@main/services/git-history.service'
import { IssueFileSchema, RECORDED_SHA_PATTERN, parseSpecMarker, planJobIds, readJobRecord, readPlanRecord, type JobRecordRead, type PlanRecordStepKey } from '@shared/domain'
import { growthProblems, recordProblems, recordedShas } from './job-record-check'

/**
 * The verifier: every assertion a scenario makes about a disposable repo, read
 * with the app's own parsers wherever the app reads the same thing. One result
 * per check, in skill-creator's `grading.json` shape (`text`/`passed`/`evidence`).
 */

export type Check =
  /** The Issue parses, and each named field is what the done rules say. */
  | { kind: 'issue'; path: string; status?: string; recorded?: Partial<Record<'codeCommit' | 'reviewHistoryCommit' | 'reviewCodeCommit', 'recorded' | 'none'>>; commentPatterns?: string[] }
  /** Every commit after `since` descends from it, and obeys the hard limits. */
  | { kind: 'commits'; since: string; count?: number; subjects?: string[]; paths?: string[][]; allowEmpty?: boolean[] }
  /** SENTINEL.txt is still staged and in no commit. */
  | { kind: 'sentinel' }
  /** No history rewrite since `since`. */
  | { kind: 'reflog'; since: string }
  /**
   * The Job's `<job-record>` block: it parses with `JobRecordSchema`, the Job owns the plan,
   * each `recorded` key resolves in HEAD's history, and every SHA it holds is a full one.
   * `before` (resolved from the working directory) is the plan as the step found it — `step
   * --plan` writes it to `steps/<label>.plan-before` — and makes attempts only grow from it.
   */
  | { kind: 'plan'; path: string; jobId: string; recorded: PlanRecordStepKey[]; patterns?: string[]; before?: string }
  | { kind: 'spec-marker'; path: string; briefId: string }
  /** A file exists and every pattern (a regex, multiline) matches it. */
  | { kind: 'file'; path: string; patterns?: string[]; absent?: boolean }
  /** A SHA the agent recorded is exactly the commit it made: its subject matches. */
  | { kind: 'recorded-subject'; issuePath?: string; field?: string; planPath?: string; jobId?: string; key?: PlanRecordStepKey; subject: string }

export interface Expectation { text: string; passed: boolean; evidence: string }

const ATTRIBUTION = /co-authored-by|generated with|🤖/i

function git(repo: string, args: string[]): string {
  return execFileSync('git', args, { cwd: repo, encoding: 'utf8', maxBuffer: 1024 * 1024 * 1024 })
}

function tryGit(repo: string, args: string[]): string | null {
  try { return git(repo, args) } catch { return null }
}

function isAncestor(repo: string, ancestor: string, of: string): boolean {
  return tryGit(repo, ['merge-base', '--is-ancestor', ancestor, of]) !== null
}

function commitPaths(repo: string, sha: string): string[] {
  return git(repo, ['diff-tree', '--root', '--no-commit-id', '--name-only', '-r', '--no-renames', sha]).split('\n').filter(Boolean)
}

function readIssue(repo: string, path: string) {
  const full = join(repo, path)
  if (!existsSync(full)) return { error: `missing ${path}` } as const
  try {
    const parsed = IssueFileSchema.safeParse(JSON.parse(readFileSync(full, 'utf8')))
    return parsed.success ? { issue: parsed.data } as const : { error: parsed.error.message } as const
  } catch (error) {
    return { error: String(error) } as const
  }
}

/** A read of this Job's record, as the evidence line a failed check shows. */
function unread(read: JobRecordRead): string {
  return read.state === 'none' ? 'no block for this Job' : read.state === 'unusable' ? `${read.reason}: ${read.detail}` : ''
}

/**
 * The writing rule, against the plan as the step found it: every earlier attempt is still
 * there, unchanged and in order, new ones only follow them, and at most one `commits` key
 * changed — the step's own — and never back to `null`.
 */
function attemptsGrow(beforePath: string, jobId: string, after: JobRecordRead): Expectation {
  const text = `Job ${jobId.slice(0, 8)}'s attempts only grow, and at most one commits key changed`
  if (!existsSync(beforePath)) return { text, passed: false, evidence: `no snapshot at ${beforePath}` }
  const before = readJobRecord(readFileSync(beforePath, 'utf8'), jobId)
  if (before.state !== 'read') return { text, passed: false, evidence: `before: ${unread(before)}` }
  if (after.state !== 'read') return { text, passed: false, evidence: `after: ${unread(after)}` }
  const problems = growthProblems(before.record, after.record)
  return { text, passed: problems.length === 0,
    evidence: problems.join(' | ') || `${before.record.attempts.length} → ${after.record.attempts.length} attempts` }
}

async function check(repo: string, item: Check, history: GitHistoryService): Promise<Expectation[]> {
  switch (item.kind) {
    case 'issue': {
      const read = readIssue(repo, item.path)
      if ('error' in read) return [{ text: `${item.path} parses as an Issue`, passed: false, evidence: read.error ?? '' }]
      const out: Expectation[] = [{ text: `${item.path} parses as an Issue`, passed: true, evidence: `status ${read.issue.status}` }]
      if (item.status) out.push({ text: `${item.path} status is ${item.status}`, passed: read.issue.status === item.status, evidence: read.issue.status })
      for (const [field, want] of Object.entries(item.recorded ?? {})) {
        const value = read.issue[field as 'codeCommit']
        let passed = value.state === want
        let evidence = JSON.stringify(value)
        if (passed && value.state === 'recorded') {
          const resolved = await history.resolveRecordedCommit(repo, value.sha)
          passed = resolved.ok && isAncestor(repo, value.sha, 'HEAD')
          evidence += resolved.ok ? ` → "${resolved.value.subject}"` : ` → ${resolved.error.message}`
        }
        out.push({ text: `${item.path} ${field} is ${want}${want === 'recorded' ? ' and resolves in HEAD’s history' : ''}`, passed, evidence })
      }
      const bodies = read.issue.comments.map((comment) => comment.body).join('\n\n')
      for (const pattern of item.commentPatterns ?? []) {
        const passed = new RegExp(pattern, 'm').test(bodies)
        out.push({ text: `${item.path} comments match /${pattern}/`, passed, evidence: passed ? 'found' : `not in ${read.issue.comments.length} comments` })
      }
      return out
    }
    case 'commits': {
      const out: Expectation[] = []
      if (!isAncestor(repo, item.since, 'HEAD')) return [{ text: `HEAD descends from ${item.since.slice(0, 8)}`, passed: false, evidence: 'not an ancestor' }]
      const shas = git(repo, ['rev-list', '--reverse', '--first-parent', `${item.since}..HEAD`]).split('\n').filter(Boolean)
      out.push({ text: `HEAD descends from ${item.since.slice(0, 8)} on the current branch`, passed: true, evidence: `${shas.length} new commits` })
      if (item.count !== undefined) out.push({ text: `exactly ${item.count} new commit(s)`, passed: shas.length === item.count, evidence: String(shas.length) })
      shas.forEach((sha, index) => {
        const message = git(repo, ['log', '-1', '--format=%B', sha])
        const subject = message.split('\n')[0] ?? ''
        const paths = commitPaths(repo, sha)
        const short = sha.slice(0, 8)
        // Fixed subjects that embed an issue path keep it whole: other skills match them exactly.
        const fixedWithPath = /^(Closed Issue: |ATTEMPT PLANS: final review )\.mysdd\/features\//.test(subject)
        out.push({ text: `${short} subject ≤72 chars${fixedWithPath ? ' (fixed subject with a path: exempt)' : ''}`, passed: fixedWithPath || subject.length <= 72, evidence: subject })
        out.push({ text: `${short} carries no attribution`, passed: !ATTRIBUTION.test(message), evidence: message.match(ATTRIBUTION)?.[0] ?? 'none' })
        out.push({ text: `${short} leaves SENTINEL.txt out`, passed: !paths.includes('SENTINEL.txt'), evidence: paths.join(', ') || '(empty)' })
        // Final review finds a change by its `Issue:` trailer; a line Git doesn't read as one is lost.
        const claimed = message.split('\n').filter((line) => /^(Issue|Spec): /.test(line))
        if (claimed.length) {
          const trailers = git(repo, ['log', '-1', '--format=%(trailers:only,unfold)', sha]).split('\n')
          const lost = claimed.filter((line) => !trailers.includes(line))
          out.push({ text: `${short} Issue:/Spec: lines are real Git trailers`, passed: lost.length === 0, evidence: lost.join(' | ') || claimed.join(' | ') })
        }
        const want = item.paths?.[index]
        if (want) {
          const same = want.length === paths.length && want.every((path) => paths.includes(path))
          out.push({ text: `${short} holds exactly ${want.join(', ') || 'nothing'}`, passed: same, evidence: paths.join(', ') || '(empty)' })
        } else if (paths.length === 0 && !item.allowEmpty?.[index]) {
          out.push({ text: `${short} is not empty`, passed: false, evidence: subject })
        }
        const pattern = item.subjects?.[index]
        if (pattern) out.push({ text: `${short} subject matches /${pattern}/`, passed: new RegExp(pattern).test(subject), evidence: subject })
      })
      return out
    }
    case 'sentinel': {
      const staged = git(repo, ['diff', '--cached', '--name-only']).split('\n')
      return [{ text: 'SENTINEL.txt is still staged', passed: staged.includes('SENTINEL.txt'), evidence: staged.filter(Boolean).join(', ') || '(nothing staged)' }]
    }
    case 'reflog': {
      const lines = git(repo, ['reflog', '--format=%H %gs', 'HEAD']).split('\n').filter(Boolean)
      const cut = lines.findIndex((line) => line.startsWith(item.since))
      const recent = cut === -1 ? lines : lines.slice(0, cut)
      const bad = recent.filter((line) => /amend|rebase|reset|checkout|merge/.test(line))
      return [{ text: 'no amend, rebase, reset or branch switch', passed: bad.length === 0, evidence: bad.join(' | ') || `${recent.length} entries, all commits` }]
    }
    case 'plan': {
      const full = join(repo, item.path)
      if (!existsSync(full)) return [{ text: `${item.path} exists`, passed: false, evidence: 'missing' }]
      const contents = readFileSync(full, 'utf8')
      const job = item.jobId.slice(0, 8)
      const owners = planJobIds(contents)
      const out: Expectation[] = [{ text: `${item.path} is owned by Job ${job}`, passed: owners.includes(item.jobId), evidence: owners.join(', ') || 'no <job-record> block' }]
      // One parse is the whole format check: an attempt cannot land outside the block, and a
      // short or retyped SHA fails the schema (contract 5 once recorded a SHA 3 characters short).
      const read = readJobRecord(contents, item.jobId)
      out.push({
        text: `Job ${job}'s record block parses with JobRecordSchema`,
        passed: read.state === 'read',
        evidence: read.state === 'read'
          ? `${read.record.attempts.length} attempts; ${Object.entries(read.record.commits).map(([key, sha]) => `${key} ${sha?.slice(0, 8) ?? 'null'}`).join(', ')}`
          : unread(read),
      })
      if (read.state === 'read') {
        // What skill-check holds a record to: each attempt's fields, its numbering, and
        // every key naming the latest commit its step's attempts made.
        const problems = recordProblems(read.record)
        out.push({ text: `Job ${job}'s record keeps the kanban-jobs contract (skill-check)`, passed: problems.length === 0, evidence: problems.join(' | ') || 'no problems' })
        const shas = recordedShas(read.record)
        const bad = shas.filter(({ sha }) => !RECORDED_SHA_PATTERN.test(sha) || tryGit(repo, ['cat-file', '-e', `${sha}^{commit}`]) === null)
        out.push({ text: `every SHA Job ${job}'s record holds is 40 lowercase hex and names a commit`, passed: bad.length === 0,
          evidence: bad.map(({ at, sha }) => `${at} = ${JSON.stringify(sha)}`).join(' | ') || `${shas.length} SHAs, all full commits` })
      }
      if (item.before !== undefined) out.push(attemptsGrow(resolve(item.before), item.jobId, read))
      for (const key of item.recorded) {
        const record = readPlanRecord(contents, item.jobId, key)
        let passed = record.state === 'recorded'
        let evidence = JSON.stringify(record)
        if (record.state === 'recorded') {
          const resolved = await history.resolveRecordedCommit(repo, record.sha)
          passed = resolved.ok && isAncestor(repo, record.sha, 'HEAD')
          evidence += resolved.ok ? ` → "${resolved.value.subject}"` : ` → ${resolved.error.message}`
        }
        out.push({ text: `plan records ${key} and it resolves in HEAD’s history`, passed, evidence })
      }
      for (const pattern of item.patterns ?? []) {
        out.push({ text: `plan matches /${pattern}/`, passed: new RegExp(pattern, 'm').test(contents), evidence: '' })
      }
      return out
    }
    case 'spec-marker': {
      const full = join(repo, item.path)
      const marker = existsSync(full) ? parseSpecMarker(readFileSync(full, 'utf8')) : { kind: 'missing' }
      return [{ text: `${item.path} carries kanban-brief: ${item.briefId}`, passed: marker.kind === 'brief' && 'briefId' in marker && marker.briefId === item.briefId, evidence: JSON.stringify(marker) }]
    }
    case 'file': {
      const full = join(repo, item.path)
      if (item.absent) return [{ text: `${item.path} is absent`, passed: !existsSync(full), evidence: existsSync(full) ? 'present' : 'absent' }]
      if (!existsSync(full)) return [{ text: `${item.path} exists`, passed: false, evidence: 'missing' }]
      const contents = readFileSync(full, 'utf8')
      return [{ text: `${item.path} exists`, passed: true, evidence: `${contents.length} bytes` },
        ...(item.patterns ?? []).map((pattern) => ({ text: `${item.path} matches /${pattern}/`, passed: new RegExp(pattern, 'm').test(contents), evidence: '' }))]
    }
    case 'recorded-subject': {
      let sha: string | null = null
      if (item.issuePath && item.field) {
        const read = readIssue(repo, item.issuePath)
        const value = 'issue' in read && read.issue ? read.issue[item.field as 'codeCommit'] : null
        sha = value && value.state === 'recorded' ? value.sha : null
      } else if (item.planPath && item.jobId && item.key) {
        const record = readPlanRecord(readFileSync(join(repo, item.planPath), 'utf8'), item.jobId, item.key)
        sha = record.state === 'recorded' ? record.sha : null
      }
      const subject = sha ? tryGit(repo, ['log', '-1', '--format=%s', sha])?.trim() ?? '' : ''
      return [{ text: `recorded ${item.field ?? item.key} names the commit /${item.subject}/`, passed: !!sha && new RegExp(item.subject).test(subject), evidence: sha ? `${sha.slice(0, 8)} "${subject}"` : 'nothing recorded' }]
    }
  }
}

export async function runChecks(repo: string, checks: Check[]): Promise<Expectation[]> {
  const history = new GitHistoryService()
  const results: Expectation[] = []
  for (const item of checks) results.push(...await check(repo, item, history))
  return results
}
