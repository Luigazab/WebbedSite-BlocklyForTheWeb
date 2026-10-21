import test from 'node:test'
import assert from 'node:assert/strict'
import { shouldReloadAfterChunkError } from '../src/lib/chunkRecovery.js'

function memoryStorage() {
  const values = new Map()
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
  }
}

test('a stale deployment chunk reloads once within the cooldown window', () => {
  const storage = memoryStorage()
  assert.equal(shouldReloadAfterChunkError(storage, 100000), true)
  assert.equal(shouldReloadAfterChunkError(storage, 100001), false)
  assert.equal(shouldReloadAfterChunkError(storage, 160001), true)
})
