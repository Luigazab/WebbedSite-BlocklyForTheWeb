import test from 'node:test'
import assert from 'node:assert/strict'
import { capturedTests, generateCodeChecks, countChecks } from '../src/utils/validation/generatedCodeChecks.js'
import { validateTutorialCode, validateTestCases } from '../src/utils/validation/tutorialCodeValidation.js'
import { buildStudentSteps, resolveStudentStepFiles } from '../src/utils/tutorialSteps.js'
import { createTutorialHandler } from '../supabase/functions/tutorial/handler.js'

const passes = (code, checks) => validateTutorialCode(code, '', [{ type: 'generatedChanges', checks }]).passed

test('HTML capture checks only changed content and accepts alternative generated formatting', () => {
  const checks = generateCodeChecks('<h1>Before</h1><p>Unchanged</p>', '<h1>After</h1><p>Unchanged</p>', 'index.html')
  assert.equal(checks.length, 1)
  assert.equal(passes('<h1 class="extra"> After </h1><p>Other</p>', checks), true)
  assert.equal(passes('<h1>Before</h1><p>Unchanged</p>', checks), false)
  assert.equal(passes('<!-- <h1>After</h1> -->', checks), false)
})

test('HTML additions, removals, attributes and repeated siblings validate actual source nodes', () => {
  const initial = '<main><p>A</p><p>B</p><img alt="old"><span id="remove">Old</span></main>'
  const expected = '<main><p>A</p><p>C</p><img alt="new"><a href="page.html">Next</a></main>'
  const checks = generateCodeChecks(initial, expected, 'index.html')
  assert.equal(passes(expected, checks), true)
  assert.equal(passes(initial, checks), false)
  assert.equal(passes(expected.replace('alt="new"', 'alt="old"'), checks), false)
  assert.equal(passes(expected.replace('<p>C</p>', '<p>B</p>'), checks), false)
})

test('CSS checks bind values to selectors, respect importance, context, and removed properties', () => {
  const initial = 'h1 {color: blue; margin: 10px;} @media (max-width: 600px) { h1 {font-size: 20px;} }'
  const expected = 'h1 {color: red !important;} @media (max-width: 600px) { h1 {font-size: 24px;} }'
  const checks = generateCodeChecks(initial, expected, 'style.css')
  assert.equal(passes(expected, checks), true)
  assert.equal(passes(initial, checks), false)
  assert.equal(passes(expected.replace('h1 {color', 'p {color'), checks), false)
  assert.equal(passes(expected.replace(' !important', ''), checks), false)
  assert.equal(passes(expected.replace('(max-width: 600px)', '(min-width: 600px)'), checks), false)
  assert.equal(passes(expected.replace('color: red !important;', 'color: red !important; margin:10px;'), checks), false)
})

test('inline and embedded CSS are validated as CSS instead of raw fragments', () => {
  const initial = '<style>h1 {color: blue;}</style><h1 style="margin: 0">Title</h1>'
  const expected = '<style>h1 {color: red;}</style><h1 style="margin: 10px">Title</h1>'
  const checks = generateCodeChecks(initial, expected, 'index.html')
  assert.equal(passes(expected, checks), true)
  assert.equal(passes(expected.replace('margin: 10px', 'margin: 0'), checks), false)
  assert.equal(passes(expected.replace('color: red', 'color: blue'), checks), false)
})

test('recapture replaces automatic checks while retaining manual tests', () => {
  const manual = { type: 'htmlExists', selector: 'footer' }
  const first = capturedTests('', '<h1>A</h1>', 'index.html', [manual])
  const next = capturedTests('', '<h1>B</h1>', 'index.html', first)
  assert.equal(next.filter(item => item.type === 'generatedChanges').length, 1)
  assert.deepEqual(next[1], manual)
  assert.equal(passes('<h1>A</h1>', next[0].checks), false)
})

test('no changes and deferred JavaScript never fall back to exact code equality', () => {
  const html = capturedTests('<h1>A</h1>', '<h1>A</h1>', 'index.html')
  assert.equal(countChecks(html), 0)
  assert.equal(validateTutorialCode('<h1>Other</h1>', '<h1>A</h1>', html).passed, true)
  assert.equal(countChecks(capturedTests('', 'alert(1)', 'main.js')), 0)
  assert.equal(countChecks(capturedTests('<script>old()</script>', '<script>new()</script>', 'index.html')), 0)
})

test('disabled checks are ignored and generated check shape is validated', () => {
  const checks = [{ type: 'htmlExists', selector: 'h1', enabled: false }]
  assert.equal(passes('', checks), true)
  assert.equal(countChecks([{ type: 'generatedChanges', checks }]), 0)
  assert.throws(() => validateTestCases([{ type: 'generatedChanges', checks: [{ type: 'generatedChanges', checks: [] }] }]))
  assert.throws(() => validateTestCases([{ type: 'cssDeclaration', value: 'red' }]))
})

test('an explicit starting snapshot overrides prior submissions but preserves this step drafts', () => {
  const initial = { blocks: { blocks: [] } }
  const steps = buildStudentSteps([{ id: 'one', order: 0 }, { id: 'two', order: 1, initial_files: { 'index.html': initial } }], [{ id: 'file', filename: 'index.html', initial_content_json: {} }])
  const submissions = [{ step_key: 'one', files: [{ filename: 'index.html', blocks_json: { old: true } }] }]
  assert.deepEqual(resolveStudentStepFiles(steps[1], steps, submissions)[0].blocks_json, initial)
  const draft = [{ filename: 'index.html', blocks_json: { draft: true } }]
  assert.deepEqual(resolveStudentStepFiles(steps[1], steps, submissions, new Map([['two', draft]])), draft)
})

test('trusted authoring requires starts and active checks for captured publication', async () => {
  let saved
  const handler = createTutorialHandler({ authenticate: async () => ({ id: 'author' }), canonicalize: files => files.map(file => ({ ...file, code: '<h1>A</h1>' })), validateTests: validateTestCases, validateReference: () => {}, saveDefinition: async (_, definition) => { saved = definition; return definition } })
  const definition = { mode: 'block', files: [{ filename: 'index.html' }], steps: [{ instruction: 'Add a heading', initialByFile: { 'index.html': {} }, expectedByFile: { 'index.html': { blocksJson: {}, requireStructure: true, testCases: capturedTests('', '<h1>A</h1>', 'index.html') } } }] }
  const send = () => handler(new Request('https://test/', { method: 'POST', headers: { Authorization: 'Bearer token' }, body: JSON.stringify({ action: 'save', definition, publish: true }) }))
  assert.equal((await send()).status, 200)
  assert.equal(saved.steps[0].expectedByFile['index.html'].requireStructure, false)
  definition.steps[0].initialByFile = {}
  assert.equal((await send()).status, 400)
  definition.steps[0].initialByFile = { 'index.html': {} }
  definition.steps[0].expectedByFile['index.html'].testCases = [{ type: 'generatedChanges', checks: [] }]
  assert.equal((await send()).status, 400)
})
