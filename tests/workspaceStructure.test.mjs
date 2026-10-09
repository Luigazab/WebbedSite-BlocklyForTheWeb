import test from 'node:test'
import assert from 'node:assert/strict'
import { validateWorkspaceStructure } from '../src/utils/validation/workspaceStructure.js'

const state = blocks => ({ blocks: { blocks } })

test('ignores coordinates, IDs, and harmless top-level extras', () => {
  const expected = state([{ type: 'html', x: 0, inputs: { BODY: { block: { type: 'body' } } } }])
  const actual = state([{ type: 'note' }, { type: 'html', x: 500, y: 300, id: 'new', inputs: { BODY: { block: { type: 'body', id: 'child' } } } }])
  assert.equal(validateWorkspaceStructure(actual, expected).passed, true)
})

test('rejects the correct block in the wrong parent', () => {
  const expected = state([{ type: 'html', inputs: { BODY: { block: { type: 'body', inputs: { CONTENT: { block: { type: 'heading' } } } } } } }])
  const actual = state([{ type: 'html', inputs: { BODY: { block: { type: 'body' } } } }, { type: 'heading' }])
  const result = validateWorkspaceStructure(actual, expected)
  assert.equal(result.passed, false)
  assert.match(result.failures.join(' '), /heading/)
})

test('requires configured expected blocks', () => {
  assert.equal(validateWorkspaceStructure(state([{ type: 'anything' }]), state([])).passed, false)
})

test('does not reuse one block for two required copies', () => {
  assert.equal(validateWorkspaceStructure(state([{ type: 'paragraph' }]), state([{ type: 'paragraph' }, { type: 'paragraph' }])).passed, false)
})
