// Declarative checks only: student code is never evaluated in the application.
export function validateTestCases(tests) {
  if (!Array.isArray(tests)) throw new Error('Test cases must be an array')
  for (const test of tests) {
    if (!test || !['codeIncludes', 'codeEquals', 'htmlExists', 'htmlText', 'htmlAttribute'].includes(test.type)) throw new Error('Unsupported test type')
    if (test.type.startsWith('html') && !test.selector?.trim()) throw new Error('HTML tests need a selector')
    if (test.type !== 'htmlExists' && typeof test.value !== 'string') throw new Error('Test value must be text')
    if (test.type === 'codeIncludes' && !test.value.trim()) throw new Error('Required code cannot be empty')
    if (test.type === 'htmlAttribute' && !test.attribute?.trim()) throw new Error('Attribute name is required')
  }
  return tests
}

export function validateTutorialCode(code, expectedCode, tests = [], Parser = globalThis.DOMParser) {
  try { validateTestCases(tests) } catch (error) { return { passed: false, failures: [error.message] } }
  const checks = tests.length ? tests : [{ type: 'codeEquals', value: expectedCode ?? '', message: 'Match the expected code, or ask your teacher to configure flexible tests.' }]
  const failures = []
  for (const test of checks) {
    let passed = false
    try {
      if (test.type === 'codeIncludes') passed = code.includes(test.value)
      else if (test.type === 'codeEquals') passed = code.replace(/\r\n/g, '\n').trim() === test.value.replace(/\r\n/g, '\n').trim()
      else {
        const doc = new Parser().parseFromString(code, 'text/html')
        const nodes = [...doc.querySelectorAll(test.selector)]
        if (test.type === 'htmlExists') passed = nodes.length > 0
        if (test.type === 'htmlText') passed = nodes.some(node => node.textContent.trim() === test.value.trim())
        if (test.type === 'htmlAttribute') passed = nodes.some(node => node.getAttribute(test.attribute) === test.value)
      }
    } catch { /* Invalid selectors and unavailable parsers fail closed. */ }
    if (!passed) failures.push(test.message || `Check ${test.selector || test.type}${test.attribute ? ` (${test.attribute})` : ''}`)
  }
  return { passed: failures.length === 0, failures }
}
