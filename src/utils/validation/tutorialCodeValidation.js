import { DOMParser } from 'linkedom'
import { checkCss, ownText } from './generatedCodeChecks.js'

// The same inert parser is used in the browser and the trusted submission service.
// Student JavaScript is never executed by validation.
export function validateTestCases(tests) {
  if (!Array.isArray(tests)) throw new Error('Test cases must be an array')
  if (tests.length > 100) throw new Error('Use at most 100 tests per file')
  for (const test of tests) {
    if (test?.type === 'generatedChanges') {
      if (!Array.isArray(test.checks) || test.checks.some(check => check?.type === 'generatedChanges')) throw new Error('Invalid generated checks')
      validateTestCases(test.checks)
      continue
    }
    if (!test || !['codeIncludes', 'codeEquals', 'htmlExists', 'htmlAbsent', 'htmlText', 'htmlOwnText', 'htmlAttribute', 'htmlAttributeAbsent', 'cssDeclaration', 'cssAbsent'].includes(test.type)) throw new Error('Unsupported test type')
    if (test.type.startsWith('html') && (typeof test.selector !== 'string' || !test.selector.trim())) throw new Error('HTML tests need a selector')
    if (!['htmlExists', 'htmlAbsent', 'htmlAttributeAbsent', 'cssAbsent'].includes(test.type) && typeof test.value !== 'string') throw new Error('Test value must be text')
    if (test.type === 'codeIncludes' && !test.value.trim()) throw new Error('Required code cannot be empty')
    if (['htmlAttribute', 'htmlAttributeAbsent'].includes(test.type) && (typeof test.attribute !== 'string' || !test.attribute.trim())) throw new Error('Attribute name is required')
    if (test.type.startsWith('css') && (typeof test.selector !== 'string' || !test.selector.trim() || typeof test.property !== 'string' || !test.property.trim() || (test.context != null && (!Array.isArray(test.context) || test.context.some(item => typeof item !== 'string'))))) throw new Error('CSS checks need a selector, property and valid context')
    if (test.enabled != null && typeof test.enabled !== 'boolean') throw new Error('Enabled must be a boolean')
    if (test.message != null && typeof test.message !== 'string') throw new Error('Test feedback must be text')
  }
  return tests
}

export function validateTutorialCode(code, expectedCode, tests = [], Parser = DOMParser) {
  try { validateTestCases(tests) } catch (error) { return { passed: false, failures: [error.message] } }
  if (typeof code !== 'string') return { passed: false, failures: ['Source code is missing.'] }
  if (!tests.length && typeof expectedCode !== 'string') return { passed: false, failures: ['No code objective is configured.'] }
  const checks = tests.length ? tests.flatMap(test => test.type === 'generatedChanges' ? test.checks : [test]) : [{ type: 'codeEquals', value: expectedCode ?? '', message: 'Match the expected code, or ask your teacher to configure flexible tests.' }]
  const failures = []
  for (const test of checks) {
    if (test.enabled === false) continue
    let passed = false
    try {
      if (test.type === 'codeIncludes') passed = code.includes(test.value)
      else if (test.type === 'codeEquals') passed = code.replace(/\r\n/g, '\n').trim() === test.value.replace(/\r\n/g, '\n').trim()
      else if (test.type.startsWith('css')) passed = checkCss(code, test)
      else {
        const doc = new Parser().parseFromString(code, 'text/html')
        const nodes = [...doc.querySelectorAll(test.selector)]
        if (test.type === 'htmlExists') passed = nodes.length > 0
        if (test.type === 'htmlAbsent') passed = nodes.length === 0
        if (test.type === 'htmlText') passed = nodes.some(node => node.textContent.trim() === test.value.trim())
        if (test.type === 'htmlOwnText') passed = nodes.some(node => ownText(node) === test.value)
        if (test.type === 'htmlAttribute') passed = nodes.some(node => node.getAttribute(test.attribute) === test.value)
        if (test.type === 'htmlAttributeAbsent') passed = nodes.some(node => !node.hasAttribute(test.attribute))
      }
    } catch { /* Invalid selectors and unavailable parsers fail closed. */ }
    if (!passed) failures.push(test.message || `Check ${test.selector || test.type}${test.attribute ? ` (${test.attribute})` : ''}`)
  }
  return { passed: failures.length === 0, failures }
}
