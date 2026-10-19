import test from 'node:test'
import assert from 'node:assert/strict'
import { build } from 'esbuild'
import { mkdir } from 'node:fs/promises'
import { JSDOM, VirtualConsole } from 'jsdom'
import vm from 'node:vm'
import { Blockly } from '../src/blockly/core.js'
import { codeGeneratorService } from '../src/services/codeGenerator.service.js'
import { block, practiceProjects } from '../src/blockly/practiceProjects.js'
import { buildPreviewDocument } from '../src/utils/previewRuntime.js'
import { parseJavaScript, sourceDiagnostics, instrumentLoops } from '../src/utils/javascriptSource.js'
import { createLearningToolbox, deprecatedJSTypes, lessonBlockTypes } from '../src/blockly/learningToolbox.js'
import { legacyToolboxConfig } from '../src/blockly/toolboxConfig.js'
import { workspaceDiagnostics } from '../src/blockly/workspaceDiagnostics.js'
import { propagateNameChange, scopeChain } from '../src/blockly/jsSupport.js'
import { readPracticeStorage, savePracticeStorage } from '../src/utils/previewRuntime.js'
import { validPreviewMessage } from '../src/utils/previewSecurity.js'

await mkdir('node_modules/.cache/js-regression', { recursive: true })
await build({ entryPoints: ['src/blockly/tutorialRuntime.js'], bundle: true, format: 'esm', platform: 'neutral', packages: 'external', outfile: 'node_modules/.cache/js-regression/runtime.mjs' })
const { initializeTutorialRuntime, canonicalTutorialFiles } = await import('../node_modules/.cache/js-regression/runtime.mjs')
initializeTutorialRuntime()
await build({ entryPoints: ['src/blockly/tutorialRuntime.js'], bundle: true, format: 'esm', platform: 'browser', outfile: 'node_modules/.cache/js-regression/worker.mjs' })
const worker = await import('../node_modules/.cache/js-regression/worker.mjs')
const state = (...blocks) => ({ blocks: { blocks } })
const string = VALUE => block('js_string_val', { VALUE })
const number = VALUE => block('js_number_val', { VALUE })
const log = (VALUE, next) => block('js_console_log', {}, { VALUE }, next)
const generate = (json, filename = 'main.js') => codeGeneratorService.generateCodeFromState(json, filename)
const tick = () => new Promise(resolve => setTimeout(resolve, 15))
function run(html, snapshot, fetch) {
  const errors = [], messages = []
  const console = new VirtualConsole().on('jsdomError', error => errors.push(error.message))
  const dom = new JSDOM(buildPreviewDocument(html, snapshot), { runScripts: 'dangerously', url: 'https://preview.invalid/', virtualConsole: console,
    beforeParse(window) { if (fetch) window.fetch = fetch } })
  dom.window.addEventListener('message', event => messages.push(event.data))
  return { dom, errors, messages }
}
function projectHTML(project) {
  const issues = []
  const ws = new Blockly.Workspace()
  try { Blockly.serialization.workspaces.load(project.state, ws); issues.push(...workspaceDiagnostics(ws, 'main.js')) }
  finally { ws.dispose() }
  assert.deepEqual(issues, [], `${project.id} has no block context issues`)
  const code = generate(project.state)
  assert.deepEqual(sourceDiagnostics(code, 'main.js'), [])
  return codeGeneratorService.combineFilesForPreview([{ filename: 'index.html', generatedCode: project.html }, { filename: 'main.js', generatedCode: code }], 'index.html')
}

test('all palette and compatibility types load, with no deprecated default entries', () => {
  const types = []
  const walk = contents => contents.forEach(item => { if (item.type) types.push(item.type); if (item.contents) walk(item.contents) })
  walk(createLearningToolbox(legacyToolboxConfig, { filename: 'main.js', level: 'full' }).contents)
  assert.equal(types.length, new Set(types).size)
  for (const type of types) { assert.ok(Blockly.Blocks[type], type); assert.ok(!deprecatedJSTypes.has(type), type) }
  for (const type of deprecatedJSTypes) assert.ok(Blockly.Blocks[type], `legacy ${type}`)
  const files = canonicalTutorialFiles([{ filename: 'main.js', blocks_json: state(block('controls_if')) }], 'block', [{ filename: 'main.js' }])
  assert.match(files[0].code, /if/)
})
test('the browser-compatible worker bundle accepts all six serialized practice projects', () => {
  for (const project of practiceProjects) {
    const files = worker.canonicalTutorialFiles([{ filename: 'main.js', blocks_json: project.state }], 'block', [{ filename: 'main.js' }])
    assert.equal(files[0].code, generate(project.state), project.id)
  }
})
test('beginner and lesson palettes are smaller; files and old lesson references stay usable', () => {
  const flatten = config => JSON.stringify(config)
  assert.ok(flatten(createLearningToolbox(legacyToolboxConfig, { filename: 'main.js', level: 'beginner' })).length < flatten(createLearningToolbox(legacyToolboxConfig, { filename: 'main.js', level: 'full' })).length)
  assert.ok(!flatten(createLearningToolbox(legacyToolboxConfig, { filename: 'main.js' })).includes('html_script_inline'))
  const required = lessonBlockTypes({ highlight_block_type: 'js_if', tutorial_step_files: [{ blocks_json: state(block('js_let')) }] })
  const lesson = createLearningToolbox(legacyToolboxConfig, { filename: 'main.js', level: 'lesson', lessonBlocks: required })
  assert.match(flatten(lesson), /js_if/); assert.ok(!flatten(lesson).includes('js_fetch_request'))
})
test('literals escape text, inline script endings, and negative powers', () => {
  const source = generate(state(log(string("O'Brien\nC:\\temp")), log(block('js_template_literal', { BEFORE: '` ${literal} ', AFTER: '\\' }, { EXPR: string('hi') })), log(block('js_arithmetic', { OP: '**' }, { A: number(-2), B: number(2) }))))
  const logs = []
  vm.runInNewContext(source, { console: { log: value => logs.push(value) } })
  assert.equal(logs[0], "O'Brien\nC:\\temp"); assert.equal(logs[1], '` ${literal} hi\\'); assert.equal(logs[2], 4)
  const html = generate(state(block('js_script_body', {}, { CONTENT: log(string('</script>')) })), 'index.html')
  assert.equal((html.match(/<\/script>/g) ?? []).length, 1)
})
test('native definitions stay inside HTML scripts and variables share custom declarations', async () => {
  const definition = block('procedures_defnoreturn', { NAME: 'hello' }, { STACK: log(string('hello')) })
  const html = generate(state(definition, block('html_script_inline', {}, { CONTENT: block('js_function_call_stmt', { NAME: 'hello', ARGS: '' }) })), 'index.html')
  assert.ok(html.indexOf('<script>') < html.indexOf('function hello'))
  const preview = run(html); await tick(); assert.deepEqual(preview.errors, []); preview.dom.window.close()
  const mixed = state(block('js_let', { NAME: 'score' }, { VALUE: number(1) }, block('variables_set', { VAR: { id: 'score-id' } }, { VALUE: number(2) })))
  mixed.variables = [{ id: 'score-id', name: 'score' }]
  assert.doesNotThrow(() => parseJavaScript(generate(mixed)))
})
test('native and custom functions with the same name retain separate call bindings', () => {
  const json = state(block('procedures_defnoreturn', { NAME: 'greet' }, { STACK: log(string('legacy')) }),
    block('js_function_def', { NAME: 'greet', PARAMS: '' }, { BODY: log(string('custom')) }),
    block('procedures_callnoreturn', {}, {}, block('js_function_call_stmt', { NAME: 'greet', ARGS: '' }), { name: 'greet', params: [] }))
  const logs = []; vm.runInNewContext(generate(json), { console: { log: value => logs.push(value) } })
  assert.deepEqual(logs, ['legacy', 'custom'])
})
test('variable-sized blocks retain values and extra state after save/load', () => {
  const object = block('js_object_new', { KEY0: 'age', KEY1: 'active', KEY2: "user's name" }, { VALUE0: number(25), VALUE1: block('js_boolean_val', { VALUE: 'true' }), VALUE2: string('Ada') }, null, { itemCount: 3 })
  const call = block('js_call_value', { NAME: 'sum' }, { ARG0: number(2), ARG1: number(3) }, null, { itemCount: 2 })
  const ws = new Blockly.Workspace()
  Blockly.serialization.workspaces.load(state(log(object), log(call)), ws)
  const saved = Blockly.serialization.workspaces.save(ws); ws.dispose()
  const code = generate(saved)
  const logs = []
  vm.runInNewContext(code, { sum: (a, b) => a + b, console: { log: value => logs.push(value) } })
  assert.equal(logs[0].age, 25); assert.equal(logs[0].active, true); assert.equal(logs[0]["user's name"], 'Ada'); assert.equal(logs[1], 5)
})
test('context and syntax checks reject illegal code without execution', () => {
  for (const type of ['js_break', 'js_continue', 'js_return_void']) assert.throws(() => canonicalTutorialFiles([{ filename: 'main.js', blocks_json: state(block(type)) }], 'block', [{ filename: 'main.js' }]), /needs/)
  assert.throws(() => canonicalTutorialFiles([{ filename: 'main.js', code: 'return 1;' }], 'text', [{ filename: 'main.js' }]), /outside/)
  const ws = new Blockly.Workspace(); const script = ws.newBlock('html_script_inline'), paragraph = ws.newBlock('paragraph')
  assert.equal(ws.connectionChecker.doTypeChecks(script.getInput('CONTENT').connection, paragraph.previousConnection), false); ws.dispose()
})
test('preview limits loops including single-statement and labeled loops, while exported source stays clean', () => {
  const source = 'let n = 0; outer: for(let i=0;i<3;i++) { if(i===1) continue outer; n++; }'
  const instrumented = instrumentLoops(source)
  vm.runInNewContext(instrumented, { __webbedTick() {} })
  let count = 0
  assert.throws(() => vm.runInNewContext(instrumentLoops('while(true);'), { __webbedTick() { if (++count > 10) throw new Error('limit') } }, { timeout: 100 }), /limit/)
  const sourceCode = generate(state(block('js_for_count', { VAR: 'i' }, { TO: number(2) })))
  assert.ok(!sourceCode.includes('__webbedTick'))
})
test('counter: five clicks render 5', async () => {
  const preview = run(projectHTML(practiceProjects[0])); await tick()
  for (let i = 0; i < 5; i++) preview.dom.window.document.getElementById('increment').click()
  assert.equal(preview.dom.window.document.getElementById('count').textContent, '5'); assert.deepEqual(preview.errors, []); preview.dom.window.close()
})
test('theme: two clicks restore the original theme', async () => {
  const preview = run(projectHTML(practiceProjects[1])); await tick(); const document = preview.dom.window.document
  document.getElementById('theme').click(); assert.ok(document.body.classList.contains('dark'))
  document.getElementById('theme').click(); assert.ok(!document.body.classList.contains('dark')); assert.deepEqual(preview.errors, []); preview.dom.window.close()
})
test('form: invalid and valid email feedback, focus, and prevented submission', async () => {
  const preview = run(projectHTML(practiceProjects[2])); await tick(); const document = preview.dom.window.document
  const submit = () => document.getElementById('signup').dispatchEvent(new preview.dom.window.Event('submit', { bubbles: true, cancelable: true }))
  document.getElementById('email').value = 'bad'; assert.equal(submit(), false)
  assert.equal(document.getElementById('feedback').textContent, 'Enter a valid email.'); assert.equal(document.activeElement.id, 'email')
  document.getElementById('email').value = 'student@example.com'; submit(); assert.equal(document.getElementById('feedback').textContent, 'Saved'); assert.deepEqual(preview.errors, []); preview.dom.window.close()
})
test('search: cards filter by input, ignore case, and recover from zero results', async () => {
  const preview = run(projectHTML(practiceProjects[3])); await tick(); const document = preview.dom.window.document
  const cards = () => [...document.querySelectorAll('article')].map(card => card.textContent)
  assert.deepEqual(cards(), ['HTML', 'CSS', 'JavaScript'])
  for (const [query, expected] of [['script', ['JavaScript']], ['css', ['CSS']], ['none', []], ['', ['HTML', 'CSS', 'JavaScript']]]) {
    document.getElementById('search').value = query; document.getElementById('search').dispatchEvent(new preview.dom.window.Event('input')); assert.deepEqual(cards(), expected)
  }
  assert.deepEqual(preview.errors, []); preview.dom.window.close()
})
test('preference: isolated practice storage survives reruns and restores dark theme', async () => {
  const html = projectHTML(practiceProjects[4]); const first = run(html); await tick(); first.dom.window.document.getElementById('theme').click(); await tick()
  const snapshot = first.messages.findLast(message => message.type === 'PREVIEW_STORAGE')
  assert.equal(snapshot.local.theme, 'dark'); first.dom.window.close()
  const second = run(html, snapshot); await tick(); assert.ok(second.dom.window.document.body.classList.contains('dark'))
  assert.equal(second.dom.window.localStorage.getItem('application-session'), null); assert.deepEqual(second.errors, []); second.dom.window.close()
})
test('API: cards render, HTTP failures show feedback, and retry recovers', async () => {
  const project = practiceProjects[5]; const json = structuredClone(project.state)
  json.blocks.blocks[0].inputs.BODY.block.inputs.URL.block.fields.VALUE = 'https://practice.invalid/cards'
  let fail = true
  const fetch = async () => ({ ok: !fail, status: fail ? 500 : 200, json: async () => [{ title: 'HTML' }, { title: 'CSS' }] })
  const preview = run(projectHTML({ ...project, state: json }), {}, fetch); await tick(); const document = preview.dom.window.document
  assert.match(document.getElementById('feedback').textContent, /Could not load/); assert.equal(document.querySelectorAll('article').length, 0)
  fail = false; document.getElementById('retry').click(); await tick()
  assert.equal(document.getElementById('feedback').textContent, 'Loaded'); assert.deepEqual([...document.querySelectorAll('article')].map(card => card.textContent), ['HTML', 'CSS']); assert.deepEqual(preview.errors, []); preview.dom.window.close()
})

test('renaming a declaration updates references while preserving local shadowing and legacy IDs', () => {
  const local = block('js_let', { NAME: 'score' }, { VALUE: number(10) }, log(block('js_get_var', { NAME: 'score' })))
  const json = state(block('js_let', { NAME: 'score' }, { VALUE: number(1) }, log(block('js_get_var', { NAME: 'score' }))),
    block('js_function_def', { NAME: 'localScore', PARAMS: '' }, { BODY: local }), block('variables_get', { VAR: { id: 'score-id' } }))
  json.variables = [{ id: 'score-id', name: 'score' }]
  const ws = new Blockly.Workspace(); Blockly.serialization.workspaces.load(json, ws)
  const declaration = ws.getAllBlocks(false).find(b => b.type === 'js_let' && !b.getSurroundParent())
  declaration.setFieldValue('points', 'NAME')
  propagateNameChange(ws, { type: Blockly.Events.BLOCK_CHANGE, element: 'field', name: 'NAME', oldValue: 'score', newValue: 'points', blockId: declaration.id })
  const references = ws.getAllBlocks(false).filter(b => b.type === 'js_get_var')
  assert.equal(references.find(b => scopeChain(b)[0] === 'global').getFieldValue('NAME'), 'points')
  assert.equal(references.find(b => scopeChain(b)[0] !== 'global').getFieldValue('NAME'), 'score')
  assert.equal(ws.getVariableMap().getVariableById('score-id').name, 'points'); ws.dispose()
})
test('optional slices and removed array values remain composable', () => {
  const list = block('js_array_new', {}, { ITEM0: number(1), ITEM1: number(2), ITEM2: number(3) }, null, { itemCount: 3 })
  const code = generate(state(log(block('js_array_slice', {}, { ARR: list, START: number(1) })), log(block('js_array_take', { METHOD: 'pop' }, { ARR: list }))))
  const logs = []; vm.runInNewContext(code, { console: { log: value => logs.push(value) } })
  assert.deepEqual(Array.from(logs[0]), [2, 3]); assert.equal(logs[1], 3)
})
test('serialized invalid names are rejected instead of silently changing submitted work', () => {
  assert.throws(() => canonicalTutorialFiles([{ filename: 'main.js', blocks_json: state(block('js_let', { NAME: 'my score' }, { VALUE: number(1) })) }], 'block', [{ filename: 'main.js' }]), /Invalid name/)
})
test('legacy qualified references and function calls preserve their serialized names', () => {
  const json = state(log(block('js_function_call_expr', { NAME: 'Math.max', ARGS: '1, 3' })), log(block('js_get_var', { NAME: 'user.name' })))
  const files = canonicalTutorialFiles([{ filename: 'main.js', blocks_json: json }], 'block', [{ filename: 'main.js' }])
  const logs = []; vm.runInNewContext(files[0].code, { user: { name: 'Ada' }, console: { log: value => logs.push(value) } })
  assert.deepEqual(logs, [3, 'Ada']); assert.equal(files[0].blocks_json.blocks.blocks[0].inputs.VALUE.block.fields.NAME, 'Math.max')
})
test('constant reassignment is rejected but changing an item in a constant array is allowed', () => {
  const definition = next => block('js_const', { NAME: 'items' }, { VALUE: block('js_array_new', {}, {}, null, { itemCount: 0 }) }, next)
  assert.throws(() => canonicalTutorialFiles([{ filename: 'main.js', blocks_json: state(definition(block('js_set_var', { NAME: 'items' }, { VALUE: number(1) }))) }], 'block', [{ filename: 'main.js' }]), /constant/)
  assert.doesNotThrow(() => canonicalTutorialFiles([{ filename: 'main.js', blocks_json: state(definition(block('js_array_push', {}, { ARR: block('js_get_var', { NAME: 'items' }), ITEM: number(1) }))) }], 'block', [{ filename: 'main.js' }]))
})
test('practice storage persists separately per project and rejects oversized or foreign messages', () => {
  const map = new Map(), session = new Map()
  const store = { getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, value) }
  const sessionStore = { getItem: key => session.get(key) ?? null, setItem: (key, value) => session.set(key, value) }
  savePracticeStorage('one', { local: { theme: 'dark' }, session: { draft: 'text' } }, store, sessionStore)
  assert.deepEqual(readPracticeStorage('one', store, sessionStore), { local: { theme: 'dark' }, session: { draft: 'text' } })
  assert.deepEqual(readPracticeStorage('two', store, sessionStore), { local: {}, session: {} })
  const frame = {}, event = { source: frame, origin: 'null', data: { type: 'PREVIEW_STORAGE', local: { theme: 'dark' }, session: {} } }
  assert.equal(validPreviewMessage(event, frame), true)
  assert.equal(validPreviewMessage(event, {}), false)
  event.data.local.theme = 'x'.repeat(10001); assert.equal(validPreviewMessage(event, frame), false)
})
test('preview actual loop guard stops an infinite loop and renders syntax failures as feedback', async () => {
  const preview = run('<script>while(true) {}</script>'); await tick()
  assert.ok(preview.errors.some(error => error.includes('long loop'))); preview.dom.window.close()
  const broken = run('<script>const = ;</script>')
  assert.match(broken.dom.window.document.body.textContent, /Fix JavaScript/); assert.deepEqual(broken.errors, []); broken.dom.window.close()
})
test('page dialogs resolve answers through their callback without native browser dialogs', async () => {
  const json = state(block('js_ask_text', { RESULT: 'answer' }, { TEXT: string('Your topic?'), BODY: block('js_set_text_content', {}, { ELEM: block('js_get_by_id', { ID: 'answer' }), TEXT: block('js_get_var', { NAME: 'answer' }) }) }))
  const code = generate(json)
  const errors = [], console = new VirtualConsole().on('jsdomError', error => errors.push(error.message))
  const dom = new JSDOM(`<p id="answer"></p><script>${code}</script>`, { runScripts: 'dangerously', virtualConsole: console, beforeParse(window) {
    window.HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', '') }
    window.HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); this.dispatchEvent(new window.Event('close')) }
  } })
  dom.window.document.querySelector('input').value = 'CSS'; dom.window.document.querySelector('button').click(); await tick()
  assert.equal(dom.window.document.getElementById('answer').textContent, 'CSS'); assert.equal(dom.window.document.querySelector('dialog'), null); assert.deepEqual(errors, []); dom.window.close()
})
test('named listener references can be removed and once listeners run once', async () => {
  const get = NAME => block('js_get_var', { NAME })
  const element = ID => block('js_get_by_id', { ID })
  const json = state(block('js_let', { NAME: 'clicks' }, { VALUE: number(0) },
    block('js_function_def', { NAME: 'bump', PARAMS: 'event' }, { BODY: block('js_increment', { NAME: 'clicks', OP: '++' }, {}, block('js_set_text_content', {}, { ELEM: element('count'), TEXT: get('clicks') })) },
      block('js_listener_ref', { EVENT: 'click', OPTION: 'ONCE' }, { ELEM: element('increment'), HANDLER: get('bump') },
        block('js_listener_ref', { EVENT: 'click', OPTION: 'NORMAL' }, { ELEM: element('other'), HANDLER: get('bump') },
          block('js_remove_listener', { EVENT: 'click' }, { ELEM: element('other'), HANDLER: get('bump') }))))))
  const preview = run(`<button id="increment">Add</button><button id="other">Removed</button><output id="count">0</output><script>${generate(json)}</script>`)
  await tick(); const document = preview.dom.window.document
  document.getElementById('increment').click(); document.getElementById('increment').click(); document.getElementById('other').click()
  assert.equal(document.getElementById('count').textContent, '1'); assert.deepEqual(preview.errors, []); preview.dom.window.close()
})
test('timer and animation IDs compose with cancellation blocks', () => {
  const get = NAME => block('js_get_var', { NAME })
  const json = state(block('js_const', { NAME: 'timer' }, { VALUE: block('js_timer_value', { METHOD: 'setTimeout' }, { DELAY: number(5), BODY: log(string('later')) }) },
    block('js_cancel_timer', { METHOD: 'clearTimeout' }, { ID: get('timer') },
      block('js_const', { NAME: 'frame' }, { VALUE: block('js_request_frame', { VAR: 'time' }, { BODY: log(get('time')) }) }, block('js_cancel_frame', {}, { ID: get('frame') })))))
  const logs = [], cancelled = []
  vm.runInNewContext(generate(json), { console: { log: value => logs.push(value) }, setTimeout: callback => { callback(); return 41 }, clearTimeout: id => cancelled.push(id), requestAnimationFrame: callback => { callback(12); return 72 }, cancelAnimationFrame: id => cancelled.push(id) })
  assert.deepEqual(logs, ['later', 12]); assert.deepEqual(cancelled, [41, 72])
})
test('splice inserts connected items and returns the removed values', () => {
  const array = values => block('js_array_new', {}, Object.fromEntries(values.map((item, i) => [`ITEM${i}`, number(item)])), null, { itemCount: values.length })
  const json = state(block('js_const', { NAME: 'items' }, { VALUE: array([1, 2, 3]) },
    log(block('js_array_splice_value', {}, { ARR: block('js_get_var', { NAME: 'items' }), START: number(1), COUNT: number(1), ITEMS: array([8, 9]) }), log(block('js_get_var', { NAME: 'items' })))))
  const logs = []; vm.runInNewContext(generate(json), { console: { log: value => logs.push(Array.from(value)) } })
  assert.deepEqual(logs, [[2], [1, 8, 9, 3]])
})
