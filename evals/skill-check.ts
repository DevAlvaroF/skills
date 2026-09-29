import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { planProblems, skillProblems } from './job-record-check'

/**
 * Run after touching the skills — from a prompt-kanban checkout:
 *
 *   npm run -s skill-check                  the skills' own statement of the Job Record
 *   npm run -s skill-check -- <plan.md>…    …and each plan's Job Records, as an agent left them
 *
 * Prints every problem and exits 1 when there is any. A maintainer tool, never
 * installed with the skills: see job-record-check.ts.
 */

const plans = process.argv.slice(2)
let failed = false

const skills = skillProblems(join(process.cwd(), 'vendor/skills/skills'))
for (const problem of skills) console.log(`✗ skills: ${problem}`)
if (skills.length === 0) console.log('✓ skills: kanban-jobs states the Job Record the app reads')
failed ||= skills.length > 0

for (const path of plans) {
  const jobs = planProblems(readFileSync(path, 'utf8'))
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
