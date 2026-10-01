import { readFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import { planProblems, skillProblems } from './job-record-check'
import { specProblems, specSkillProblems } from './spec-record-check'

/**
 * Run after touching the skills — from a prompt-kanban checkout:
 *
 *   npm run -s skill-check                          the skills' own statement of the Job and Spec Records
 *   npm run -s skill-check -- <plan.md|spec.md>…    …and each file's records, as an agent left them
 *
 * A file named `spec.md` is checked as a spec (its `<spec-record>` block);
 * anything else as a plan (each Job's `<job-record>` block). Prints every
 * problem and exits 1 when there is any. A maintainer tool, never installed
 * with the skills: see job-record-check.ts and spec-record-check.ts.
 */

const files = process.argv.slice(2)
let failed = false
const root = join(process.cwd(), 'vendor/skills/skills')

const skills = skillProblems(root)
for (const problem of skills) console.log(`✗ skills: ${problem}`)
if (skills.length === 0) console.log('✓ skills: kanban-jobs states the Job Record the app reads')
failed ||= skills.length > 0

const specSkills = specSkillProblems(root)
for (const problem of specSkills) console.log(`✗ skills: ${problem}`)
if (specSkills.length === 0) console.log('✓ skills: to-spec states the Spec Record the app reads, in both flavours')
failed ||= specSkills.length > 0

for (const path of files) {
  const contents = readFileSync(path, 'utf8')
  if (basename(path) === 'spec.md') {
    const problems = specProblems(contents)
    for (const problem of problems) console.log(`✗ ${path}: ${problem}`)
    if (problems.length === 0) console.log(`✓ ${path}`)
    failed ||= problems.length > 0
    continue
  }
  const jobs = planProblems(contents)
  if (jobs.length === 0) {
    console.log(`✗ ${path}: no <job-record> block for any Job`)
    failed = true
  }
  for (const { jobId, problems } of jobs) {
    for (const problem of problems) console.log(`✗ ${path} [${jobId.slice(0, 8)}]: ${problem}`)
    if (problems.length === 0) console.log(`✓ ${path} [${jobId.slice(0, 8)}]`)
    failed ||= problems.length > 0
  }
}

process.exit(failed ? 1 : 0)
