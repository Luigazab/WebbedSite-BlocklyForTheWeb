import test from 'node:test'
import assert from 'node:assert/strict'
import { build } from 'esbuild'
import { Blockly } from '../src/blockly/core.js'
import { javascriptGenerator } from 'blockly/javascript'

await build({ entryPoints: ['src/blockly/registerBlocks.js'], bundle: true, format: 'esm', platform: 'node', packages: 'external', outfile: 'node_modules/.cache/html-tables-test.mjs' })
const { registerBlocklyBlocks } = await import('../node_modules/.cache/html-tables-test.mjs')
registerBlocklyBlocks()
const code = block => { javascriptGenerator.init(block.workspace); return javascriptGenerator.blockToCode(block) }

test('table cells generate spans, optional scope, attributes and content after saving', () => {
  const ws = new Blockly.Workspace()
  try {
    for (const type of ['td', 'th']) {
      const cell = ws.newBlock(type)
      cell.setFieldValue(3, 'COLSPAN'); cell.setFieldValue(0, 'ROWSPAN')
      if (type === 'th') cell.setFieldValue('colgroup', 'SCOPE')
      const id = ws.newBlock('id'); id.setFieldValue('cell', 'NAME')
      cell.getInput('attributes').connection.connect(id.outputConnection)
      const text = ws.newBlock('html_plain_text'); text.setFieldValue('Cell text', 'TEXT')
      cell.getInput('CONTENT').connection.connect(text.previousConnection)
      assert.match(code(cell), /colspan="3" rowspan="0"/)
      assert.match(code(cell), /id="cell"/)
      assert.match(code(cell), /Cell text/)
      if (type === 'th') assert.match(code(cell), /scope="colgroup"/)
    }
    const saved = Blockly.serialization.workspaces.save(ws)
    Blockly.serialization.workspaces.load(saved, ws)
    assert.match(code(ws.getBlocksByType('th')[0]), /colspan="3" rowspan="0" scope="colgroup"/)
    const old = Blockly.serialization.blocks.append({ type: 'th' }, ws)
    assert.doesNotMatch(code(old), /scope=/)
    assert.doesNotMatch(code(old), /colspan=|rowspan=/)
    old.setFieldValue(-1, 'COLSPAN'); old.setFieldValue(999999, 'ROWSPAN')
    assert.equal(old.getFieldValue('COLSPAN'), '')
    assert.equal(old.getFieldValue('ROWSPAN'), '')
  } finally { ws.dispose() }
})

test('optional spans can be cleared, reject invalid values, and load old numeric fields', () => {
  const ws = new Blockly.Workspace()
  try {
    for (const type of ['td', 'th']) {
      const cell = Blockly.serialization.blocks.append({ type, fields: { COLSPAN: 2, ROWSPAN: 0 } }, ws)
      assert.match(code(cell), /colspan="2" rowspan="0"/)
      for (const invalid of ['abc', '1.5', '-1', '1001']) cell.setFieldValue(invalid, 'COLSPAN')
      assert.equal(cell.getFieldValue('COLSPAN'), '2')
      cell.setFieldValue('', 'COLSPAN')
      assert.doesNotMatch(code(cell), /colspan=/)
      assert.match(code(cell), /rowspan="0"/)
      cell.setFieldValue('', 'ROWSPAN')
      assert.doesNotMatch(code(cell), /colspan=|rowspan=/)
    }
    const saved = Blockly.serialization.workspaces.save(ws)
    Blockly.serialization.workspaces.load(saved, ws)
    for (const cell of ws.getAllBlocks(false)) assert.doesNotMatch(code(cell), /colspan=|rowspan=/)
  } finally { ws.dispose() }
})

test('column groups emit span only without children; column span is preserved', () => {
  const ws = new Blockly.Workspace()
  try {
    const group = ws.newBlock('html_colgroup'); group.setFieldValue(4, 'SPAN')
    assert.match(code(group), /<colgroup span="4">/)
    const col = ws.newBlock('html_col'); col.setFieldValue(2, 'SPAN')
    group.getInput('CONTENT').connection.connect(col.previousConnection)
    assert.match(code(group), /<colgroup>/)
    assert.match(code(group), /<col span="2">/)
    col.unplug()
    assert.match(code(group), /<colgroup span="4">/)
  } finally { ws.dispose() }
})
