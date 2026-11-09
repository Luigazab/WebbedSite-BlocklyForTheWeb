import test from 'node:test'
import assert from 'node:assert/strict'
import { build } from 'esbuild'
import { Blockly } from '../src/blockly/core.js'
import { javascriptGenerator } from 'blockly/javascript'
import { appendListChild } from '../src/blockly/htmlListControls.js'
import { toolboxConfig } from '../src/blockly/toolboxConfig.js'

await build({ entryPoints: ['src/blockly/registerBlocks.js'], bundle: true, format: 'esm', platform: 'node', packages: 'external', outfile: 'node_modules/.cache/html-lists-test.mjs' })
const { registerBlocklyBlocks } = await import('../node_modules/.cache/html-lists-test.mjs')
registerBlocklyBlocks()
const entries = toolboxConfig.contents.flatMap(category => category.contents ?? [])
const preset = type => entries.find(entry => entry.type === type)
const childTypes = parent => {
  const types = []
  for (let child = parent.getInputTargetBlock('CONTENT'); child; child = child.getNextBlock()) types.push(child.type)
  return types
}

test('JSON toolbox starters contain the right editable children and generate HTML', () => {
  const ws = new Blockly.Workspace()
  try {
    for (const [type, expected, closing] of [['ul', ['li'], '</ul>'], ['ol', ['li'], '</ol>'], ['select', ['option'], '</select>'], ['html_dl', ['html_dt', 'html_dd'], '</dl>']]) {
      const parent = Blockly.serialization.blocks.append(preset(type), ws)
      assert.deepEqual(childTypes(parent), expected)
      assert.ok(parent.getInput('LIST_ACTIONS'))
      const first = parent.getInputTargetBlock('CONTENT')
      assert.ok(first.getInput('attributes'))
      assert.equal(first.isShadow(), false)
      if (type === 'ul' || type === 'ol') {
        assert.equal(first.getInputTargetBlock('CONTENT').type, 'html_plain_text')
        assert.equal(first.getInputTargetBlock('CONTENT').getFieldValue('TEXT'), '')
      }
      javascriptGenerator.init(ws)
      assert.ok(javascriptGenerator.blockToCode(parent).includes(closing))
    }
  } finally { ws.dispose() }
})

test('append preserves children, attributes, parent siblings, and save/load', () => {
  const ws = new Blockly.Workspace()
  try {
    const parent = Blockly.serialization.blocks.append(preset('ul'), ws)
    const first = parent.getInputTargetBlock('CONTENT')
    const id = ws.newBlock('id'); first.getInput('attributes').connection.connect(id.outputConnection)
    const sibling = ws.newBlock('paragraph'); parent.nextConnection.connect(sibling.previousConnection)
    const added = appendListChild(parent, 'li')
    assert.equal(added.getInputTargetBlock('CONTENT').type, 'html_plain_text')
    assert.equal(first.getNextBlock(), added)
    assert.equal(first.getInputTargetBlock('attributes'), id)
    assert.equal(parent.getNextBlock(), sibling)
    assert.equal(appendListChild(parent, 'option'), null)
    const saved = Blockly.serialization.workspaces.save(ws)
    Blockly.serialization.workspaces.load(saved, ws)
    assert.deepEqual(childTypes(ws.getBlocksByType('ul')[0]), ['li', 'li'])
    const dl = ws.newBlock('html_dl')
    appendListChild(dl, 'html_dt'); appendListChild(dl, 'html_dd'); appendListChild(dl, 'html_dd')
    assert.deepEqual(childTypes(dl), ['html_dt', 'html_dd', 'html_dd'])
    const select = ws.newBlock('select'); appendListChild(select, 'option')
    assert.deepEqual(childTypes(select), ['option'])
  } finally { ws.dispose() }
})

test('one undo removes an added child; redo restores it', async () => {
  const ws = new Blockly.Workspace()
  const flush = () => new Promise(resolve => setTimeout(resolve, 20))
  try {
    const parent = ws.newBlock('ol')
    await flush(); ws.clearUndo()
    const child = appendListChild(parent, 'li'), id = child.id
    const textId = child.getInputTargetBlock('CONTENT').id
    await flush(); ws.undo(false); await flush()
    assert.deepEqual(childTypes(parent), [])
    assert.equal(ws.getBlockById(id), null)
    assert.equal(ws.getBlockById(textId), null)
    ws.undo(true); await flush()
    assert.deepEqual(childTypes(parent), ['li'])
    assert.equal(parent.getInputTargetBlock('CONTENT').id, id)
    assert.equal(ws.getBlockById(id).getInputTargetBlock('CONTENT').id, textId)
  } finally { ws.dispose() }
})

test('plain text starts empty, escapes HTML, and survives saving inside a standalone li', () => {
  const ws = new Blockly.Workspace()
  try {
    const li = Blockly.serialization.blocks.append(preset('li'), ws)
    const text = li.getInputTargetBlock('CONTENT')
    assert.equal(text.type, 'html_plain_text')
    assert.ok(preset('html_plain_text'))
    javascriptGenerator.init(ws)
    assert.equal(javascriptGenerator.blockToCode(text), '')
    text.setFieldValue('Bread & butter <b>literal</b>', 'TEXT')
    const saved = Blockly.serialization.workspaces.save(ws)
    Blockly.serialization.workspaces.load(saved, ws)
    javascriptGenerator.init(ws)
    const output = javascriptGenerator.blockToCode(ws.getBlocksByType('li')[0])
    assert.match(output, /Bread &amp; butter &lt;b&gt;literal&lt;\/b&gt;/)
    assert.doesNotMatch(output, /<p>|<span>|<b>/)
  } finally { ws.dispose() }
})
