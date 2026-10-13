import test from 'node:test'
import assert from 'node:assert/strict'
import { build } from 'esbuild'
import { mkdir } from 'node:fs/promises'
import { validateTutorialCode, validateTestCases } from '../src/utils/validation/tutorialCodeValidation.js'
import { validateTutorialStep, validateTutorialReference } from '../src/utils/validation/tutorialStepValidation.js'
import { buildStudentSteps, buildTextStudentSteps, resolveStudentStepFiles } from '../src/utils/tutorialSteps.js'
import { PREVIEW_SANDBOX, validPreviewMessage } from '../src/utils/previewSecurity.js'
import { createTutorialHandler } from '../supabase/functions/tutorial/handler.js'
import { tutorialBuilderStore } from '../src/store/tutorialBuilderStore.js'
import { codeGeneratorService } from '../src/services/codeGenerator.service.js'

// Build the same source adapter that is deployed to the Edge Function.
await mkdir('node_modules/.cache/tutorial-tests', { recursive: true })
await build({ entryPoints: ['src/blockly/tutorialRuntime.js'], bundle: true, format: 'esm', platform: 'neutral', packages: 'external', outfile: 'node_modules/.cache/tutorial-tests/runtime.mjs' })
const { canonicalTutorialFiles } = await import('../node_modules/.cache/tutorial-tests/runtime.mjs')
const workspace = (type = 'heading', text = 'Welcome') => ({ blocks: { blocks: [{ type, fields: { LEVEL: '1', TEXT: text } }] } })
const definitions = [{ id: 'file', filename: 'index.html' }]
const expected = [{ file_id: 'file', filename: 'index.html', expected_code: '  <h1>Welcome</h1>\n', expected_blocks_json: workspace(), test_cases: [] }]
const source = (state = workspace(), code = 'forged') => [{ filename: 'index.html', blocks_json: state, code }]
const canonical = state => canonicalTutorialFiles(source(state), 'block', definitions)

test('empty tests enforce source equality even with captured workspace JSON', () => {
  assert.equal(validateTutorialStep({ files: canonical(workspace()), expected, mode: 'block' }).passed, true)
  assert.equal(validateTutorialStep({ files: canonical(workspace('heading', 'Wrong')), expected, mode: 'block' }).passed, false)
})

test('flexible objectives accept equivalent HTML from different blocks and text mode', () => {
  const goal = [{ ...expected[0], test_cases: [{ type: 'htmlText', selector: 'h1', value: 'Welcome' }] }]
  const different = [{ filename: 'index.html', code: '<h1 class="mine">Welcome</h1>', blocks_json: workspace('different') }]
  assert.equal(validateTutorialStep({ files: different, expected: goal, mode: 'block' }).passed, true)
  assert.equal(validateTutorialStep({ files: different, expected: goal, mode: 'text' }).passed, true)
  assert.equal(validateTutorialStep({ files: different, expected: [{ ...goal[0], require_block_structure: true }], mode: 'block' }).passed, false)
  assert.equal(validateTutorialStep({ files: different, expected: [{ ...goal[0], require_block_structure: true }], mode: 'text' }).passed, false)
})

test('trusted Blockly generation ignores supplied code, validates fields, and rejects unknown blocks', () => {
  assert.match(canonical(workspace('heading', 'Wrong'))[0].code, /Wrong/)
  assert.throws(() => canonical(workspace('unknown_block')), /Invalid block definition/)
  assert.throws(() => canonicalTutorialFiles([{ filename: 'index.html', code: '<h1>Welcome</h1>' }], 'block', definitions), /workspace/)
})

test('all file objectives run and duplicate or missing files fail', () => {
  const goals = [...expected, { filename: 'style.css', expected_code: 'h1 { color: red; }', test_cases: [] }]
  assert.equal(validateTutorialStep({ files: canonical(), expected: goals }).passed, false)
  assert.equal(validateTutorialStep({ files: [...canonical(), ...canonical()], expected }).passed, false)
  assert.equal(validateTutorialStep({ files: [...canonical(), { filename: 'style.css', code: 'h1 { color: red; }' }], expected: goals }).passed, true)
  assert.throws(() => canonicalTutorialFiles([...source(), ...source()], 'block', definitions), /unique/)
  assert.throws(() => canonicalTutorialFiles([{ filename: 'other.html', code: '' }], 'text', definitions), /Unknown/)
})

test('server generation preserves JavaScript comparisons and HTML in strings, and CSS fields', () => {
  const jsState = { blocks: { blocks: [{ type: 'js_console_log', inputs: { VALUE: { block: { type: 'js_compare', fields: { OP: '<' }, inputs: { A: { block: { type: 'js_number_val', fields: { VALUE: 1 } } }, B: { block: { type: 'js_number_val', fields: { VALUE: 2 } } } } } } }, next: { block: { type: 'js_console_log', inputs: { VALUE: { block: { type: 'js_string_val', fields: { VALUE: '<script></script>' } } } } } } }] } }
  const files = canonicalTutorialFiles([{ filename: 'main.js', blocks_json: jsState }, { filename: 'style.css', blocks_json: { blocks: { blocks: [{ type: 'external_text_color', fields: { COLOR: 'red' } }] } } }], 'block', [{ filename: 'main.js' }, { filename: 'style.css' }])
  assert.match(files[0].code, /1 < 2/)
  assert.match(files[0].code, /'<script><\/script>'/)
  assert.equal(files[1].code, 'color: red;')
})

test('preview resolves quoted local file links and keeps literal replacement characters', () => {
  const html = codeGeneratorService.combineFilesForPreview([{ filename: 'index.html', generatedCode: "<link href='./style.css'><script src='main.js'></script>" }, { filename: 'style.css', generatedCode: 'color: red;' }, { filename: 'main.js', generatedCode: "console.log('$&');" }], 'index.html')
  assert.match(html, /<style>\ncolor: red;/)
  assert.ok(html.includes("console.log('$&');"))
})

test('clearing captures or deleting files discards their pending test drafts', () => {
  const store = tutorialBuilderStore.getState()
  const step = { id: 'step', expectedByFile: { 'index.html': {} }, workingState: {}, testDraftByFile: { 'index.html': '[invalid]' } }
  store.hydrate({ lessonId: null, tutorialId: null, meta: {}, files: [{ filename: 'index.html' }], steps: [step] })
  store.clearStepExpected(0, 'index.html')
  assert.equal(tutorialBuilderStore.getState().steps[0].testDraftByFile['index.html'], undefined)
  store.setSteps([step])
  store.removeFile('index.html')
  assert.equal(tutorialBuilderStore.getState().steps[0].testDraftByFile['index.html'], undefined)
  store.reset()
})

test('both modes reject steps with no configured objectives', () => {
  for (const mode of ['block', 'text']) assert.equal(validateTutorialStep({ files: [], expected: [], mode }).passed, false)
  assert.equal(validateTutorialCode('', null, []).passed, false)
  assert.throws(() => validateTestCases([{ type: 'htmlText', selector: {}, value: 'x' }]), /selector/)
})

test('publication rejects empty references, impossible selectors and empty required structures', () => {
  assert.throws(() => validateTutorialReference({ expected_code: '', test_cases: [] }), /nonempty/)
  assert.throws(() => validateTutorialReference({ expected_code: '<h1>Welcome</h1>', test_cases: [{ type: 'htmlExists', selector: '[' }] }), /Check/)
  assert.throws(() => validateTutorialReference({ expected_code: '<h1>Welcome</h1>', expected_blocks_json: {}, require_block_structure: true, test_cases: [] }), /expected blocks/)
})

test('shared HTML parser does not run scripts and supports attributes and selectors', () => {
  assert.equal(validateTutorialCode('<script>document.write("<h1>Welcome</h1>")</script>', '', [{ type: 'htmlText', selector: 'h1', value: 'Welcome' }]).passed, false)
  assert.equal(validateTutorialCode('<img class="hero" alt="Remi">', '', [{ type: 'htmlAttribute', selector: 'img.hero', attribute: 'alt', value: 'Remi' }]).passed, true)
})

test('navigation carries submitted additions and preserves unsaved drafts when going back', () => {
  const steps = buildStudentSteps([{ id: 'one', order: 0, block_tutorial_step_expected: expected }, { id: 'two', order: 1 }], [{ ...definitions[0], initial_content_json: {} }])
  const additions = [{ filename: 'index.html', code: 'my additions', blocks_json: workspace('paragraph', 'my additions') }]
  const drafts = new Map([['two', [{ ...additions[0], code: 'unsaved edit' }]]])
  assert.equal(resolveStudentStepFiles(steps[1], steps, [{ step_key: 'one', files: additions }])[0].code, 'my additions')
  assert.equal(resolveStudentStepFiles(steps[1], steps, [], drafts)[0].code, 'unsaved edit')
})

test('code-only legacy rows do not erase starting blocks and text expectations are normalized', () => {
  const initial = workspace('paragraph', 'starter')
  const steps = buildStudentSteps([{ id: 'one', order: 0, block_tutorial_step_expected: [{ file_id: 'file', expected_code: 'legacy' }] }, { id: 'two', order: 1 }], [{ ...definitions[0], initial_content_json: initial }])
  assert.deepEqual(steps[1].tutorial_step_files[0].blocks_json, initial)
  const textSteps = buildTextStudentSteps([{ id: 'two', order: 1, text_tutorial_step_expected: expected }], [{ ...definitions[0], initial_content: '<h1>starter</h1>', step_id: 'two' }])
  assert.deepEqual(textSteps[0].expected, expected)
  assert.equal(textSteps[0].tutorial_step_files[0].code, '<h1>starter</h1>')
})

test('opaque preview messages must come from the exact frame and have valid shapes', () => {
  const frame = {}
  assert.equal(PREVIEW_SANDBOX.includes('allow-same-origin'), false)
  const event = { source: frame, origin: 'null', data: { type: 'CONSOLE_MESSAGE', logType: 'log', message: 'hello' } }
  assert.equal(validPreviewMessage(event, frame), true)
  assert.equal(validPreviewMessage({ ...event, source: {} }, frame), false)
  assert.equal(validPreviewMessage({ ...event, origin: 'https://app.example' }, frame), false)
  assert.equal(validPreviewMessage({ ...event, data: { type: 'CONSOLE_MESSAGE', logType: 'log', message: {} } }, frame), false)
})

function handlerFor(definition = { mode: 'block', files: definitions, expected, revision: 'revision' }) {
  const calls = { saved: [], authored: [] }
  const handler = createTutorialHandler({
    authenticate: async token => token === 'valid' ? { id: 'verified-user' } : null,
    loadDefinition: async user => { assert.equal(user, 'verified-user'); return definition },
    saveSubmission: async (user, body) => { calls.saved.push({ user, body }); return { id: 'submission', files: body.files } },
    saveDefinition: async (user, body, publish) => { calls.authored.push({ user, body, publish }); return { lessonId: 'lesson' } },
    canonicalize: canonicalTutorialFiles, validateStep: validateTutorialStep, validateReference: validateTutorialReference, validateTests: validateTestCases,
  })
  const request = (body, token = 'valid') => handler(new Request('https://example.test/tutorial', { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {}, body: JSON.stringify(body) }))
  return { request, calls }
}

test('HTTP submission rejects forged output, runs flexible objectives and saves canonical source', async () => {
  const { request, calls } = handlerFor({ mode: 'block', files: definitions, expected: [{ ...expected[0], test_cases: [{ type: 'htmlText', selector: 'h1', value: 'Welcome' }] }], revision: 'revision' })
  const failed = await request({ action: 'submit', lessonId: 'lesson', stepId: 'step', finish: true, files: source(workspace('heading', 'Wrong'), '<h1>Welcome</h1>'), userId: 'spoof' })
  assert.equal(failed.status, 422)
  assert.equal(calls.saved.length, 0)
  const passed = await request({ action: 'submit', lessonId: 'lesson', stepId: 'step', finish: true, files: source() })
  assert.equal(passed.status, 200)
  assert.equal(calls.saved[0].user, 'verified-user')
  assert.equal(calls.saved[0].body.files[0].code, '  <h1>Welcome</h1>\n')
  assert.equal(calls.saved[0].body.revision, 'revision')
})

test('text submissions use the same objectives without requiring blocks', async () => {
  const { request, calls } = handlerFor({ mode: 'text', files: definitions, expected, revision: 'text-revision' })
  assert.equal((await request({ action: 'submit', finish: false, files: [{ filename: 'index.html', code: '<h1>Wrong</h1>' }] })).status, 422)
  assert.equal((await request({ action: 'submit', finish: false, files: [{ filename: 'index.html', code: '<h1>Welcome</h1>' }] })).status, 200)
  assert.equal(calls.saved[0].body.files[0].blocks_json, null)
})

test('captured reference workspaces regenerate stale stored source before validation', async () => {
  const { request, calls } = handlerFor({ mode: 'block', files: definitions, expected: [{ ...expected[0], expected_code: 'old generator output' }], revision: 'revision' })
  assert.equal((await request({ action: 'submit', finish: false, files: source() })).status, 200)
  assert.match(calls.saved[0].body.files[0].code, /<h1>Welcome<\/h1>/)
})

test('preview checks validate without recording submissions or progress', async () => {
  const { request, calls } = handlerFor()
  assert.equal((await request({ action: 'check', files: source(workspace('heading', 'Wrong')) })).status, 422)
  assert.equal((await request({ action: 'check', files: source() })).status, 200)
  assert.equal(calls.saved.length, 0)
})

test('HTTP authentication and malformed requests fail before any save', async () => {
  const { request, calls } = handlerFor()
  assert.equal((await request({ action: 'submit' }, null)).status, 401)
  assert.equal((await request({ action: 'submit' }, 'invalid')).status, 401)
  assert.equal((await request({ action: 'submit', finish: 'yes', files: source() })).status, 400)
  assert.equal(calls.saved.length, 0)
})

test('authoring sends one complete definition, regenerates references, and rejects empty publication', async () => {
  const { request, calls } = handlerFor()
  const definition = { mode: 'block', files: definitions, steps: [{ instruction: 'Add a heading', expectedByFile: { 'index.html': { blocksJson: workspace(), code: 'forged', testCases: [] } } }] }
  assert.equal((await request({ action: 'save', publish: true, definition })).status, 200)
  assert.equal(calls.authored.length, 1)
  assert.equal(calls.authored[0].body.steps[0].expectedByFile['index.html'].code, '  <h1>Welcome</h1>\n')
  definition.steps[0].expectedByFile['index.html'].blocksJson = {}
  assert.equal((await request({ action: 'save', publish: true, definition })).status, 400)
  assert.equal(calls.authored.length, 1)
})

test('registration carries a permitted role and works before email confirmation without a public profile insert', async () => {
  const calls = []
  globalThis.__tutorialAuthClient = { auth: { signUp: async args => { calls.push(args); return { data: { user: { id: 'new-user' }, session: null }, error: null } } }, from: () => { throw new Error('Profile insertion must be server-owned') } }
  await build({ entryPoints: ['src/services/auth.service.js'], bundle: true, format: 'esm', platform: 'neutral', packages: 'external', outfile: 'node_modules/.cache/tutorial-tests/auth.mjs', plugins: [{ name: 'auth-test-client', setup(builder) {
    builder.onResolve({ filter: /supabaseClient$/ }, () => ({ path: 'auth-client', namespace: 'test-client' }))
    builder.onLoad({ filter: /.*/, namespace: 'test-client' }, () => ({ contents: 'export const supabase = globalThis.__tutorialAuthClient' }))
  } }] })
  try {
    const { authService } = await import('../node_modules/.cache/tutorial-tests/auth.mjs')
    await assert.rejects(authService.signUp('test@example.invalid', 'password', 'Test', 'admin'), /student or teacher/)
    assert.equal(calls.length, 0)
    for (const role of ['student', 'teacher']) {
      const result = await authService.signUp('test@example.invalid', 'password', 'Test', role)
      assert.equal(result.session, null)
      assert.deepEqual(calls.at(-1).options.data, { username: 'Test', role })
    }
  } finally { delete globalThis.__tutorialAuthClient }
})
