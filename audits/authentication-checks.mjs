// Regression checks for the remediated authentication flows.
// This runs isolated tests and never creates users, sends emails, or changes passwords.
import { spawnSync } from 'node:child_process'
const result = spawnSync(process.execPath, ['--test', 'tests/authentication.test.mjs'], {
  cwd: new URL('../', import.meta.url), stdio: 'inherit',
})
if (result.error) throw result.error
process.exitCode = result.status ?? 1