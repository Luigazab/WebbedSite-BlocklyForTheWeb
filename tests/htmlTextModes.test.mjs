import test from 'node:test'
import assert from 'node:assert/strict'
import { build } from 'esbuild'
import { Blockly } from '../src/blockly/core.js'
import { javascriptGenerator } from 'blockly/javascript'
await build({ entryPoints: ['src/blockly/registerBlocks.js'], bundle: true, format: 'esm', platform: 'node', packages: 'external', outfile: 'node_modules/.cache/html-text-modes-test.mjs' })
const { registerBlocklyBlocks } = await import('../node_modules/.cache/html-text-modes-test.mjs')
registerBlocklyBlocks()
const code = block => { javascriptGenerator.init(block.workspace); return javascriptGenerator.blockToCode(block) }
const flush = () => new Promise(resolve => setTimeout(resolve, 25))

test('mixed heading content preserves exact spacing and blocks unsafe collapsing', () => {
  const ws = new Blockly.Workspace()
  try {
    const heading = ws.newBlock('heading'); heading.setFieldValue('Hello ', 'TEXT')
    heading.setFieldValue('BLOCKS', 'TEXT_MODE')
    const hello = heading.getInputTargetBlock('CONTENT')
    assert.equal(hello.getFieldValue('TEXT'), 'Hello ')
    const span = ws.newBlock('span'), world = ws.newBlock('html_plain_text')
    world.setFieldValue('World', 'TEXT')
    span.getInput('CONTENT').connection.connect(world.previousConnection)
    hello.nextConnection.connect(span.previousConnection)
    assert.equal(code(heading), '<h1>Hello <span>World</span></h1>')
    heading.setFieldValue('TEXT', 'TEXT_MODE')
    assert.equal(heading.getFieldValue('TEXT_MODE'), 'BLOCKS')
    assert.equal(span.getParent(), hello)
    const saved = Blockly.serialization.workspaces.save(ws)
    Blockly.serialization.workspaces.load(saved, ws)
    assert.equal(code(ws.getBlocksByType('heading')[0]), '<h1>Hello <span>World</span></h1>')
    const xml = Blockly.Xml.workspaceToDom(ws); ws.clear(); Blockly.Xml.domToWorkspace(xml, ws)
    assert.equal(code(ws.getBlocksByType('heading')[0]), '<h1>Hello <span>World</span></h1>')
  } finally { ws.dispose() }
})

test('switching modes and undo/redo preserve text and connections', async () => {
  const ws = new Blockly.Workspace()
  try {
    const p = ws.newBlock('paragraph'); p.setFieldValue('Hello & goodbye', 'TEXT')
    await flush(); ws.clearUndo()
    p.setFieldValue('BLOCKS', 'TEXT_MODE'); await flush()
    assert.equal(code(p), '<p>Hello &amp; goodbye</p>')
    ws.undo(false); await flush()
    assert.equal(p.getFieldValue('TEXT_MODE'), 'TEXT')
    assert.equal(p.getFieldValue('TEXT'), 'Hello & goodbye')
    assert.equal(ws.getBlocksByType('html_plain_text').length, 0)
    ws.undo(true); await flush()
    assert.equal(p.getInputTargetBlock('CONTENT').getFieldValue('TEXT'), 'Hello & goodbye')
    p.setFieldValue('TEXT', 'TEXT_MODE'); await flush()
    assert.equal(p.getFieldValue('TEXT'), 'Hello & goodbye')
    ws.undo(false); await flush()
    assert.equal(p.getFieldValue('TEXT_MODE'), 'BLOCKS')
    assert.equal(code(p), '<p>Hello &amp; goodbye</p>')
  } finally { ws.dispose() }
})

test('legacy text blocks and all supported types load with their text intact', () => {
  const ws = new Blockly.Workspace()
  try {
    for (const type of ['heading','paragraph','a_tag','strong','em','html_b','html_i','html_mark','html_small','html_del','html_ins','html_sub','html_sup']) {
      const b = Blockly.serialization.blocks.append({ type, fields: { TEXT: 'Original' } }, ws)
      assert.equal(b.getFieldValue('TEXT_MODE'), 'TEXT')
      b.setFieldValue('BLOCKS', 'TEXT_MODE')
      assert.equal(b.getInputTargetBlock('CONTENT').getFieldValue('TEXT'), 'Original')
      b.setFieldValue('TEXT', 'TEXT_MODE')
      assert.equal(b.getFieldValue('TEXT'), 'Original')
    }
  } finally { ws.dispose() }
})
