import test from 'node:test'
import assert from 'node:assert/strict'
import { build } from 'esbuild'
import { Blockly } from '../src/blockly/core.js'
import { javascriptGenerator } from 'blockly/javascript'
import { toolboxConfig } from '../src/blockly/toolboxConfig.js'

await build({ entryPoints: ['src/blockly/registerBlocks.js'], bundle: true, format: 'esm', platform: 'node', packages: 'external', outfile: 'node_modules/.cache/html-attributes-test.mjs' })
const { registerBlocklyBlocks } = await import('../node_modules/.cache/html-attributes-test.mjs')
registerBlocklyBlocks()
const code = block => { javascriptGenerator.init(block.workspace); return javascriptGenerator.blockToCode(block) }
const connect = (parent, name, child) => parent.getInput(name).connection.connect(child.outputConnection)

test('style toolbox shadow accepts typing, replacement, and restores typed CSS after save/load', () => {
  const ws = new Blockly.Workspace()
  try {
    const preset = toolboxConfig.contents.flatMap(item => item.contents ?? []).find(item => item.type === 'body_style')
    const style = Blockly.serialization.blocks.append(preset, ws)
    const shadow = style.getInputTargetBlock('body_style')
    assert.equal(shadow.isShadow(), true)
    shadow.setFieldValue('color: red;', 'CSS')
    assert.equal(code(style)[0], ' style="color: red;"')
    const holder = ws.newBlock('inline_style_group')
    connect(style, 'body_style', holder)
    assert.equal(style.getInputTargetBlock('body_style'), holder)
    const saved = Blockly.serialization.workspaces.save(ws)
    Blockly.serialization.workspaces.load(saved, ws)
    const restoredStyle = ws.getBlocksByType('body_style')[0]
    restoredStyle.getInputTargetBlock('body_style').unplug()
    assert.equal(restoredStyle.getInputTargetBlock('body_style').isShadow(), true)
    assert.equal(code(restoredStyle)[0], ' style="color: red;"')
    const color = ws.newBlock('internal_text_color')
    connect(restoredStyle, 'body_style', color)
    assert.equal(restoredStyle.getInputTargetBlock('body_style'), color)
    color.unplug()
    assert.equal(code(restoredStyle)[0], ' style="color: red;"')
  } finally { ws.dispose() }
})

test('inline style accepts typed CSS or mixed declarations, escapes once, and persists', () => {
  const ws = new Blockly.Workspace()
  try {
    const style = ws.newBlock('body_style'), text = ws.newBlock('inline_style_text')
    text.setFieldValue('font-family: "A&B"', 'CSS')
    connect(style, 'body_style', text)
    assert.equal(code(style)[0], ' style="font-family: &quot;A&amp;B&quot;"')
    text.unplug()
    const group = ws.newBlock('inline_style_group')
    group.resizeAttributes_(3)
    connect(style, 'body_style', group)
    connect(group, 'STYLE_0', text)
    const color = ws.newBlock('internal_text_color'); color.setFieldValue('red', 'COLOR')
    connect(group, 'STYLE_1', color)
    assert.equal(code(style)[0], ' style="font-family: &quot;A&amp;B&quot;; color: red;"')
    const saved = Blockly.serialization.workspaces.save(ws)
    Blockly.serialization.workspaces.load(saved, ws)
    assert.equal(code(ws.getBlocksByType('body_style')[0])[0], ' style="font-family: &quot;A&amp;B&quot;; color: red;"')
    const xml = Blockly.Xml.workspaceToDom(ws); ws.clear(); Blockly.Xml.domToWorkspace(xml, ws)
    assert.equal(ws.getBlocksByType('inline_style_group')[0].itemCount_, 3)
  } finally { ws.dispose() }
})

test('CSS holder removal keeps its child and undo restores the connection', async () => {
  const ws = new Blockly.Workspace()
  const flush = () => new Promise(resolve => setTimeout(resolve, 20))
  try {
    const group = ws.newBlock('inline_style_group'), text = ws.newBlock('inline_style_text')
    connect(group, 'STYLE_0', text)
    await flush(); ws.clearUndo()
    group.resizeAttributes_(0); await flush()
    assert.equal(text.getParent(), null)
    assert.equal(code(group)[0], '')
    ws.undo(false); await flush()
    assert.equal(group.getInputTargetBlock('STYLE_0'), text)
    ws.undo(true); await flush()
    assert.equal(group.itemCount_, 0)
    assert.equal(text.getParent(), null)
  } finally { ws.dispose() }
})

test('holder combines attributes inside an element and escapes values', () => {
  const ws = new Blockly.Workspace()
  try {
    const div = ws.newBlock('div'), holder = ws.newBlock('extra_attributes')
    holder.resizeAttributes_(3)
    connect(div, 'attributes', holder)
    const cls = ws.newBlock('class'); cls.setFieldValue('card" & <', 'NAME')
    const aria = ws.newBlock('html_aria_attribute'); aria.setFieldValue('A & B', 'VALUE')
    const hidden = ws.newBlock('html_boolean_attribute')
    connect(holder, 'body_style', cls); connect(holder, 'ATTR_1', aria); connect(holder, 'ATTR_2', hidden)
    assert.match(code(div), /<div class="card&quot; &amp; &lt;" aria-label="A &amp; B" hidden>/)
    hidden.setFieldValue('FALSE', 'ENABLED')
    assert.doesNotMatch(code(div), / hidden/)
    const saved = Blockly.serialization.workspaces.save(ws)
    Blockly.serialization.workspaces.load(saved, ws)
    assert.equal(ws.getBlocksByType('extra_attributes')[0].itemCount_, 3)
    assert.match(code(ws.getBlocksByType('div')[0]), /aria-label="A &amp; B"/)
    const xml = Blockly.Xml.workspaceToDom(ws)
    ws.clear(); Blockly.Xml.domToWorkspace(xml, ws)
    assert.equal(ws.getBlocksByType('extra_attributes')[0].itemCount_, 3)
  } finally { ws.dispose() }
})

test('legacy one-slot data loads; zero slots and custom attributes generate correctly', () => {
  const ws = new Blockly.Workspace()
  try {
    Blockly.serialization.workspaces.load({ blocks: { languageVersion: 0, blocks: [{ type: 'extra_attributes', inputs: { body_style: { block: { type: 'id', fields: { NAME: 'old' } } } } }] } }, ws)
    const holder = ws.getBlocksByType('extra_attributes')[0]
    assert.equal(code(holder)[0], ' id="old"')
    holder.resizeAttributes_(0)
    assert.equal(code(holder)[0], '')
    assert.ok(ws.getBlocksByType('id')[0])
    for (const [type, expected] of [['html_data_attribute', ' data-name="value"'], ['html_global_attribute', ' title="value"'], ['html_custom_attribute', ' title="value"']]) assert.equal(code(ws.newBlock(type))[0], expected)
    holder.loadExtraState({ itemCount: -1 }); assert.equal(holder.itemCount_, 0)
    holder.loadExtraState({ itemCount: 100 }); assert.equal(holder.itemCount_, 32)
  } finally { ws.dispose() }
})

test('removing a connected slot can be undone and redone without losing its block', async () => {
  const ws = new Blockly.Workspace()
  const flush = () => new Promise(resolve => setTimeout(resolve, 20))
  try {
    const holder = ws.newBlock('extra_attributes')
    holder.resizeAttributes_(2)
    const attr = ws.newBlock('id'); connect(holder, 'ATTR_1', attr)
    await flush(); ws.clearUndo()
    holder.resizeAttributes_(1)
    await flush()
    assert.equal(attr.getParent(), null)
    ws.undo(false); await flush()
    assert.equal(holder.itemCount_, 2)
    assert.equal(holder.getInputTargetBlock('ATTR_1'), attr)
    ws.undo(true); await flush()
    assert.equal(holder.itemCount_, 1)
    assert.equal(attr.getParent(), null)
  } finally { ws.dispose() }
})
