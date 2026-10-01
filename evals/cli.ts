import { execFileSync, spawnSync } from 'node:child_process'
import { appendFileSync, cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import {
  ALL_STEP_BLUEPRINTS,
  BUILT_IN_PROMPT_TEMPLATES,
  blueprintFor,
  blueprintsFor,
  isBlockingDiagnostic,
  renderStepPrompt,
  specRecordTemplate,
  type WorkflowStepKey,
  type WorkflowStepNode,
} from '@shared/domain'
import { runChecks, type Check } from './verify'

/**
 * The skill-eval harness: disposable repos, the app's own Step prompts, one
 * Codex session per Step, and a verifier built on the app's parsers.
 *
 *   npm run skill-evals -- repo <dir> --flavour modified-matt|makerkit-custom --skills new|old [--clone <src>] [--setup committed|local]
 *   npm run skill-evals -- seed-spec <repo> <spec path> --record none|empty|saved|committed|recorded|malformed|duplicate [--brief <id>] [--secret]
 *   npm run skill-evals -- prompt <step-key> --templates new|old --subject <subject.json>
 *   npm run skill-evals -- step <repo> <run-dir> <label> <prompt-file> [--no-sentinel] [--plan <path>] [--spec <path>]
 *   npm run skill-evals -- answer <repo> <run-dir> <label> <text-or-@file>
 *   npm run skill-evals -- verify <repo> <run-dir> <checks.json>
 *   npm run skill-evals -- snapshot <repo> <run-dir> [<extra path>…]
 *   npm run skill-evals -- aggregate <iteration-dir>
 *
 * Repos live under /tmp/pk-e2e, never inside this project, and every Codex run
 * gets `danger-full-access` — which is only acceptable because the repo is
 * disposable. Workspaces (outputs, timing.json, grading.json) go to the
 * gitignored `.skill-evals/` of the prompt-kanban checkout it runs from. See
 * vendor/skills/evals/README.md.
 */

const ROOT = process.cwd()
const NEW_SKILLS = join(ROOT, 'vendor/skills/skills')
const OLD_SKILLS = join(ROOT, '.skill-evals/baseline/old_skill')
const OLD_PROMPTS = join(ROOT, '.skill-evals/baseline/old_prompts.json')
const SKILL_CREATOR = [
  join(process.env.HOME ?? '', '.claude/plugins/marketplaces/claude-plugins-official/plugins/skill-creator/skills/skill-creator'),
].find((path) => existsSync(path))

const ISO = '2026-01-01T00:00:00.000Z'
const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`

function die(message: string): never {
  process.stderr.write(`skill-evals: ${message}\n`)
  process.exit(1)
}

function flag(args: string[], name: string): string | undefined {
  const at = args.indexOf(`--${name}`)
  return at === -1 ? undefined : args[at + 1]
}

function git(repo: string, args: string[]): string {
  return execFileSync('git', args, { cwd: repo, encoding: 'utf8', maxBuffer: 1024 * 1024 * 1024 })
}

/* ---------- repo ---------- */

function makeRepo(args: string[]): void {
  const dir = resolve(args[0] ?? die('repo needs a directory'))
  if (!dir.startsWith('/tmp/pk-e2e/') && !dir.startsWith('/private/tmp/pk-e2e/')) die('repos live under /tmp/pk-e2e/')
  const flavour = flag(args, 'flavour') ?? die('--flavour modified-matt|makerkit-custom')
  const which = flag(args, 'skills') ?? die('--skills new|old')
  const source = which === 'old' ? OLD_SKILLS : NEW_SKILLS
  const clone = flag(args, 'clone')

  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dirname(dir), { recursive: true })
  if (clone) {
    execFileSync('git', ['clone', '-q', '--no-hardlinks', clone, dir])
    git(dir, ['remote', 'remove', 'origin'])
  } else {
    cpSync(join(ROOT, 'vendor/skills/evals/fixtures/node-app'), dir, { recursive: true })
    git(dir, ['init', '-q', '-b', 'main'])
  }
  git(dir, ['config', 'user.name', 'Eval User'])
  git(dir, ['config', 'user.email', 'eval@example.com'])
  git(dir, ['config', 'commit.gpgsign', 'false'])

  for (const agentDir of ['.agents/skills', '.claude/skills']) {
    // Only the skills under test are replaced: a cloned project's other skills stay.
    const target = join(dir, agentDir)
    mkdirSync(target, { recursive: true })
    for (const group of [flavour, 'kanban']) {
      for (const skill of readdirSync(join(source, group))) {
        rmSync(join(target, skill), { recursive: true, force: true })
        cpSync(join(source, group, skill), join(target, skill), { recursive: true })
      }
    }
  }
  const setup = flag(args, 'setup')
  if (setup !== undefined) writeSetup(dir, join(source, flavour, `${flavour}-setup-skills`), setup)
  git(dir, ['add', '-A'])
  git(dir, ['commit', '-q', '-m', clone ? 'Install the skills under test' : 'Initial commit'])
  process.stdout.write(`${dir} ${git(dir, ['rev-parse', 'HEAD']).trim()}\n`)
}

/**
 * What the setup skill writes in a fresh repo, without a Codex session: its two seeds verbatim, from the skills
 * under test so the tracker's contract matches its readers, and for `local` the one ignore rule that makes Feature
 * files local. For scenarios that start past setup; setup itself stays a scenario step where it is under test.
 */
function writeSetup(dir: string, setupSkill: string, mode: string): void {
  if (mode !== 'committed' && mode !== 'local') die('--setup committed|local')
  mkdirSync(join(dir, '.mysdd/docs/agents'), { recursive: true })
  cpSync(join(setupSkill, 'issue-tracker-local.md'), join(dir, '.mysdd/issue-tracker.md'))
  cpSync(join(setupSkill, 'domain.md'), join(dir, '.mysdd/docs/agents/domain.md'))
  if (mode === 'local') appendFileSync(join(dir, '.gitignore'), '.mysdd/features/\n')
}

/* ---------- seed-spec ---------- */

const FIXTURE_SPEC = join(ROOT, 'vendor/skills/evals/fixtures/specs/slugify.md')
const SECRET_LINE = '\nThe staging deploy key is AKIAIOSFODNN7EXAMPLE; keep it handy for the demo.\n'

/** The empty record with `attempts` and `commits` replaced: the block a review leaves, built on the app's template. */
function recordBlock(attempts: unknown[], sha: string | null): string {
  const record = { commits: { 'spec-review': sha }, attempts }
  return specRecordTemplate().replace(/```json\n[\s\S]*?\n```/, () => `\`\`\`json\n${JSON.stringify(record, null, 2)}\n\`\`\``)
}

const savedAttempt = (commit: string | null) => ({
  attempt: 1, agent: 'Codex', commit,
  summary: 'Reviewed the spec with the user; it passes the publish checks. No open questions.',
})

/**
 * A spec in the state a scenario starts from, at `<repo>/<spec path>`, built from the fixture spec:
 *
 * - `none`: as a contract-5 Step 2 left it, with no record — a legacy spec.
 * - `empty`: as Step 2 leaves it now, ending with `specRecordTemplate()`.
 * - `saved`: a passing review saved attempt 1, `commit: null`, and was interrupted before committing.
 * - `committed`: …and committed it (`REVIEW HISTORY: Record spec review attempt 1`, `Spec:` trailer), but was
 *   interrupted before writing the SHA. The commit is made here, so it is `HEAD` before the step.
 * - `recorded`: …and wrote that SHA into the attempt and `commits`, uncommitted: a finished first review.
 * - `malformed`: the record's JSON does not parse. `duplicate`: a second, column-zero record precedes the real one.
 *
 * Every state but `committed`/`recorded` leaves the spec untracked, as Step 2 does. `--secret` then appends a
 * secret-shaped line to Further Notes, uncommitted, for the publication check.
 */
function seedSpec(args: string[]): void {
  const [repoArg, specPath] = args
  if (!repoArg || !specPath) die('seed-spec <repo> <spec path> --record <state>')
  const repo = resolve(repoArg)
  const state = flag(args, 'record') ?? die('--record none|empty|saved|committed|recorded|malformed|duplicate')
  const brief = flag(args, 'brief')
  let spec = readFileSync(FIXTURE_SPEC, 'utf8')
  if (brief) spec = spec.replace(/^(# .*\n)/, `$1\nkanban-brief: ${brief}\n`)
  const withRecord = (block: string) => `${spec.trimEnd()}\n\n${block}\n`
  const full = join(repo, specPath)
  mkdirSync(dirname(full), { recursive: true })

  switch (state) {
    case 'none': writeFileSync(full, spec); break
    case 'empty': writeFileSync(full, withRecord(specRecordTemplate())); break
    case 'saved': writeFileSync(full, withRecord(recordBlock([savedAttempt(null)], null))); break
    case 'committed':
    case 'recorded': {
      writeFileSync(full, withRecord(recordBlock([savedAttempt(null)], null)))
      git(repo, ['add', '--', specPath])
      git(repo, ['commit', '-q', '-m', 'REVIEW HISTORY: Record spec review attempt 1', '-m', `Spec: ${specPath}`, '--', specPath])
      const sha = git(repo, ['rev-parse', 'HEAD']).trim()
      if (state === 'recorded') writeFileSync(full, withRecord(recordBlock([savedAttempt(sha)], sha)))
      break
    }
    case 'malformed': writeFileSync(full, withRecord(specRecordTemplate().replace('"attempts": []', '"attempts": [,]'))); break
    case 'duplicate': writeFileSync(full, withRecord(`${specRecordTemplate()}\n\n${specRecordTemplate()}`)); break
    default: die(`unknown --record ${state}`)
  }
  if (args.includes('--secret')) {
    const text = readFileSync(full, 'utf8')
    writeFileSync(full, text.replace('Not decided yet.\n', `Not decided yet.\n${SECRET_LINE}`))
  }
  process.stdout.write(`${full} ${git(repo, ['rev-parse', 'HEAD']).trim()}\n`)
}

/* ---------- prompt ---------- */

interface Subject {
  featureTitle?: string
  featureDescription?: string
  specPath?: string | null
  issuePath?: string | null
  planPath?: string | null
  briefId?: string | null
  jobId?: string | null
  /** The commit step 5 or C recorded, which 6 and D are handed. */
  commitSha?: string | null
  skills?: string[]
  notes?: string
}

function node(key: WorkflowStepKey, template: string, subject: Subject, own: boolean): WorkflowStepNode {
  const seed = ALL_STEP_BLUEPRINTS.findIndex((candidate) => candidate.key === key) + 1
  const id = uuid(seed)
  const blueprint = blueprintFor(key)
  const sha = subject.commitSha ?? null
  return {
    step: {
      id, workflowId: uuid(900), key, position: blueprint.position, template: own ? template : '',
      notes: own ? subject.notes ?? '' : '', copiedAt: null, completedAt: null, copiedPrompt: null,
      copiedPromptTruncated: false, copiedSkills: [], createdAt: ISO, updatedAt: ISO,
    },
    skills: own ? (subject.skills ?? []).map((name, position) => ({
      id: uuid(300 + seed * 10 + position), stepId: id, name, scope: 'local' as const, position, createdAt: ISO, updatedAt: ISO,
    })) : [],
    commit: sha && (key === 'implement' || key === 'code')
      ? { id: uuid(200 + seed), stepId: id, sha, subject: 'recorded', authoredAt: ISO, createdAt: ISO, updatedAt: ISO }
      : null,
    recordedCommit: null,
    manualCommitAt: null,
  }
}

function renderPrompt(args: string[]): void {
  const key = (args[0] ?? die('prompt needs a step key')) as WorkflowStepKey
  const which = flag(args, 'templates') ?? 'new'
  const subject = JSON.parse(readFileSync(flag(args, 'subject') ?? die('--subject <json>'), 'utf8')) as Subject
  const templates: Record<string, string> = which === 'old'
    ? JSON.parse(readFileSync(OLD_PROMPTS, 'utf8'))
    : BUILT_IN_PROMPT_TEMPLATES
  const blueprint = blueprintFor(key)
  const steps = blueprintsFor(blueprint.kind).map((candidate) =>
    node(candidate.key, templates[candidate.key] ?? '', subject, candidate.key === key))
  const rendered = renderStepPrompt({
    blueprint,
    step: steps.find((step) => step.step.key === key)!,
    steps,
    subject: {
      featureTitle: subject.featureTitle ?? '',
      featureDescription: subject.featureDescription ?? '',
      specPath: subject.specPath ?? null,
      issuePath: subject.issuePath ?? null,
      planPath: subject.planPath ?? null,
      briefId: subject.briefId ?? null,
      jobId: subject.jobId ?? null,
      roles: { coder: 'claude', reviewer: 'codex' },
    },
  })
  // Every Step runs in Codex here, so a coder step's `/skill` becomes `$skill`.
  let text = rendered.text
  for (const name of subject.skills ?? []) text = text.split(`/${name}`).join(`$${name}`)
  const blocking = rendered.diagnostics.filter((diagnostic) => isBlockingDiagnostic(diagnostic.code))
  if (blocking.length) process.stderr.write(`blocking diagnostics: ${JSON.stringify(blocking)}\n`)
  process.stdout.write(text)
}

/* ---------- step / answer ---------- */

interface Usage { input_tokens: number; cached_input_tokens: number; output_tokens: number; reasoning_output_tokens: number }
interface StepTiming { label: string; turns: number; seconds: number; input_tokens: number; cached_input_tokens: number; output_tokens: number; commands: number }

const SENTINEL = 'SENTINEL.txt'

/** A staged change the Step must leave staged and out of every commit it makes. */
function stageSentinel(repo: string, label: string): void {
  writeFileSync(join(repo, SENTINEL), `staged before ${label}; never commit this\n`)
  git(repo, ['add', '--', SENTINEL])
}

function runCodex(repo: string, dir: string, label: string, codexArgs: string[], promptText: string, turn: number): void {
  mkdirSync(dir, { recursive: true })
  const started = Date.now()
  const result = spawnSync('codex', [...codexArgs, '-'], {
    cwd: repo, input: promptText, encoding: 'utf8', maxBuffer: 512 * 1024 * 1024,
  })
  const seconds = (Date.now() - started) / 1000
  writeFileSync(join(dir, `events-${turn}.jsonl`), result.stdout ?? '')
  writeFileSync(join(dir, `stderr-${turn}.txt`), result.stderr ?? '')
  writeFileSync(join(dir, `prompt-${turn}.txt`), promptText)

  const events = (result.stdout ?? '').split('\n').filter(Boolean).flatMap((line) => {
    try { return [JSON.parse(line) as { type: string; thread_id?: string; usage?: Usage; item?: { type: string } }] } catch { return [] }
  })
  const thread = events.find((event) => event.type === 'thread.started')?.thread_id
  if (thread) writeFileSync(join(dir, 'thread.txt'), thread)
  const usage = events.filter((event) => event.type === 'turn.completed' && event.usage).map((event) => event.usage!)
  const commands = events.filter((event) => event.type === 'item.completed' && event.item?.type === 'command_execution').length

  const timingPath = join(dir, 'timing.json')
  const previous: StepTiming = existsSync(timingPath)
    ? JSON.parse(readFileSync(timingPath, 'utf8'))
    : { label, turns: 0, seconds: 0, input_tokens: 0, cached_input_tokens: 0, output_tokens: 0, commands: 0 }
  const timing: StepTiming = {
    label,
    turns: previous.turns + 1,
    seconds: previous.seconds + seconds,
    input_tokens: previous.input_tokens + usage.reduce((sum, u) => sum + u.input_tokens, 0),
    cached_input_tokens: previous.cached_input_tokens + usage.reduce((sum, u) => sum + u.cached_input_tokens, 0),
    output_tokens: previous.output_tokens + usage.reduce((sum, u) => sum + u.output_tokens, 0),
    commands: previous.commands + commands,
  }
  writeFileSync(timingPath, JSON.stringify(timing, null, 2))
  process.stdout.write(`--- ${label} turn ${turn} (${seconds.toFixed(0)}s, exit ${result.status}) ---\n`)
  process.stdout.write(existsSync(join(dir, 'last.txt')) ? readFileSync(join(dir, 'last.txt'), 'utf8') : '(no last message)')
  process.stdout.write('\n')
}

function runStep(args: string[]): void {
  const [repoArg, runDir, label, promptFile] = args
  if (!repoArg || !runDir || !label || !promptFile) die('step <repo> <run-dir> <label> <prompt-file>')
  const repo = resolve(repoArg)
  const dir = join(resolve(runDir), 'steps', label)
  rmSync(dir, { recursive: true, force: true })
  if (!args.includes('--no-sentinel')) stageSentinel(repo, label)
  mkdirSync(join(resolve(runDir), 'steps'), { recursive: true })
  writeFileSync(join(resolve(runDir), 'steps', `${label}.head`), git(repo, ['rev-parse', 'HEAD']).trim(), { flag: 'w' })
  // The Job's plan as the step found it, working tree and all: the `plan` check's
  // `before`, against which attempts may only grow.
  const plan = flag(args, 'plan')
  if (plan && existsSync(join(repo, plan))) cpSync(join(repo, plan), join(resolve(runDir), 'steps', `${label}.plan-before`))
  // The same for a Feature's spec: the `spec` check's `before`.
  const spec = flag(args, 'spec')
  if (spec && existsSync(join(repo, spec))) cpSync(join(repo, spec), join(resolve(runDir), 'steps', `${label}.spec-before`))
  runCodex(repo, dir, label, ['exec', '-C', repo, '-s', 'danger-full-access', '--json', '-o', join(dir, 'last.txt')],
    readFileSync(promptFile, 'utf8'), 1)
  rollUp(resolve(runDir))
}

function answer(args: string[]): void {
  const [repoArg, runDir, label, text] = args
  if (!repoArg || !runDir || !label || text === undefined) die('answer <repo> <run-dir> <label> <text-or-@file>')
  const repo = resolve(repoArg)
  const dir = join(resolve(runDir), 'steps', label)
  const thread = readFileSync(join(dir, 'thread.txt'), 'utf8').trim()
  const turn = readdirSync(dir).filter((name) => name.startsWith('events-')).length + 1
  const body = text.startsWith('@') ? readFileSync(text.slice(1), 'utf8') : text
  runCodex(repo, dir, label, ['exec', 'resume', thread, '--json', '-o', join(dir, 'last.txt'),
    '-c', 'sandbox_mode="danger-full-access"'], body, turn)
  rollUp(resolve(runDir))
}

/** The run's timing.json: every Step's totals, in the shape aggregate_benchmark reads. */
function rollUp(runDir: string): void {
  const stepsDir = join(runDir, 'steps')
  const steps = readdirSync(stepsDir)
    .filter((name) => existsSync(join(stepsDir, name, 'timing.json')))
    .map((name) => JSON.parse(readFileSync(join(stepsDir, name, 'timing.json'), 'utf8')) as StepTiming)
  const sum = (pick: (step: StepTiming) => number) => steps.reduce((total, step) => total + pick(step), 0)
  writeFileSync(join(runDir, 'timing.json'), JSON.stringify({
    total_tokens: sum((step) => step.input_tokens + step.output_tokens),
    uncached_input_tokens: sum((step) => step.input_tokens - step.cached_input_tokens),
    output_tokens: sum((step) => step.output_tokens),
    total_duration_seconds: Math.round(sum((step) => step.seconds)),
    commands: sum((step) => step.commands),
    steps,
  }, null, 2))
}

/* ---------- verify / snapshot / aggregate ---------- */

function verify(args: string[]): void {
  const [repoArg, runDir, checksFile] = args
  if (!repoArg || !runDir || !checksFile) die('verify <repo> <run-dir> <checks.json>')
  const checks = JSON.parse(readFileSync(checksFile, 'utf8')) as Check[]
  void runChecks(resolve(repoArg), checks).then((results) => {
    const gradingPath = join(resolve(runDir), 'grading.json')
    const grading = existsSync(gradingPath) ? JSON.parse(readFileSync(gradingPath, 'utf8')) : { expectations: [] }
    grading.expectations.push(...results)
    const passed = grading.expectations.filter((result: { passed: boolean }) => result.passed).length
    grading.summary = { passed, failed: grading.expectations.length - passed, total: grading.expectations.length,
      pass_rate: grading.expectations.length ? passed / grading.expectations.length : 0 }
    writeFileSync(gradingPath, JSON.stringify(grading, null, 2))
    for (const result of results) process.stdout.write(`${result.passed ? 'PASS' : 'FAIL'}  ${result.text}\n      ${result.evidence}\n`)
  })
}

function snapshot(args: string[]): void {
  const [repoArg, runDir, ...extra] = args
  if (!repoArg || !runDir) die('snapshot <repo> <run-dir> [<extra path>…]')
  const repo = resolve(repoArg)
  const out = join(resolve(runDir), 'outputs')
  mkdirSync(out, { recursive: true })
  writeFileSync(join(out, 'git-log.txt'), git(repo, ['log', '--stat', '--format=--- %H%n%B']))
  writeFileSync(join(out, 'git-status.txt'), git(repo, ['status', '--short']))
  writeFileSync(join(out, 'reflog.txt'), git(repo, ['reflog', '--format=%H %gs']))
  for (const path of ['.mysdd', ...extra]) {
    if (existsSync(join(repo, path))) cpSync(join(repo, path), join(out, 'files', path), { recursive: true })
  }
  const stepsDir = join(resolve(runDir), 'steps')
  if (existsSync(stepsDir)) {
    for (const label of readdirSync(stepsDir)) {
      const last = join(stepsDir, label, 'last.txt')
      if (existsSync(last)) appendFileSync(join(out, 'last-messages.md'), `\n## ${label}\n\n${readFileSync(last, 'utf8')}\n`)
    }
  }
  process.stdout.write(`${out}\n`)
}

function aggregate(args: string[]): void {
  const iteration = resolve(args[0] ?? die('aggregate <iteration-dir>'))
  if (!SKILL_CREATOR) die('skill-creator not found; install the skill-creator plugin')
  const result = spawnSync('python3', ['-m', 'scripts.aggregate_benchmark', iteration, '--skill-name', 'prompt-kanban skills'],
    { cwd: SKILL_CREATOR, stdio: 'inherit' })
  process.exit(result.status ?? 1)
}

const [command, ...rest] = process.argv.slice(2)
switch (command) {
  case 'repo': makeRepo(rest); break
  case 'seed-spec': seedSpec(rest); break
  case 'prompt': renderPrompt(rest); break
  case 'step': runStep(rest); break
  case 'answer': answer(rest); break
  case 'verify': verify(rest); break
  case 'snapshot': snapshot(rest); break
  case 'aggregate': aggregate(rest); break
  default: die('commands: repo | seed-spec | prompt | step | answer | verify | snapshot | aggregate')
}
