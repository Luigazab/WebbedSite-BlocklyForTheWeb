import { validateTutorialCode, validateTestCases } from './tutorialCodeValidation.js'
import { validateWorkspaceStructure } from './workspaceStructure.js'

export function validateTutorialStep({ files, expected, mode = 'block', fileDefinitions = [] }) {
  if (!['block', 'text'].includes(mode)) return { passed: false, failures: ['Unsupported tutorial mode.'] }
  if (!Array.isArray(expected) || !expected.length) return { passed: false, failures: ['This step has no validation configured.'] }
  const failures = []
  for (const solution of expected) {
    const filename = solution.filename ?? fileDefinitions.find(file => file.id === solution.file_id)?.filename
    const matches = files.filter(file => file.filename === filename)
    if (!filename || matches.length !== 1) { failures.push('A required file is missing or duplicated.'); continue }
    const file = matches[0]
    // Learner DTOs contain objective metadata, never the reference answer.
    // The submission service checks these objectives against the private definition.
    if (solution.server_only) continue
    const result = validateTutorialCode(file.code, solution.expected_code, solution.test_cases ?? [])
    failures.push(...result.failures.map(message => `${filename}: ${message}`))
    if (solution.require_block_structure === true) {
      if (mode !== 'block') failures.push(`${filename}: block requirements are unavailable in text mode.`)
      else failures.push(...validateWorkspaceStructure(file.blocks_json, solution.expected_blocks_json).failures.map(message => `${filename}: ${message}`))
    }
  }
  return { passed: failures.length === 0, failures }
}

export function validateTutorialReference(solution, mode = 'block') {
  validateTestCases(solution.test_cases ?? [])
  if (typeof solution.expected_code !== 'string' || !solution.expected_code.trim()) throw new Error('Capture a nonempty reference solution')
  const filename = solution.filename ?? 'index.html'
  const result = validateTutorialStep({
    mode,
    files: [{ filename, code: solution.expected_code, blocks_json: solution.expected_blocks_json }],
    expected: [{ ...solution, filename }],
  })
  if (!result.passed) throw new Error(result.failures.join(' • '))
  return result
}
