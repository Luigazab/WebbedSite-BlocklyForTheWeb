import test from 'node:test'
import assert from 'node:assert/strict'
import { splitQuizTime, quizTimeInSeconds } from '../src/utils/quizTimer.js'

test('quiz timer round-trips saved seconds without changing duration', () => {
  for (const total of [1, 45, 60, 90, 185, 3600]) {
    const parts = splitQuizTime(total)
    assert.equal(quizTimeInSeconds(parts.minutes, parts.seconds), total)
  }
  assert.deepEqual(splitQuizTime(185), { minutes: '3', seconds: '5' })
  assert.equal(quizTimeInSeconds('2', '30'), 150)
})
test('blank and zero timers remain unlimited; either field may be omitted', () => {
  assert.deepEqual(splitQuizTime(null), { minutes: '', seconds: '' })
  assert.equal(quizTimeInSeconds('', ''), null)
  assert.equal(quizTimeInSeconds('0', '0'), null)
  assert.equal(quizTimeInSeconds('', '45'), 45)
  assert.equal(quizTimeInSeconds('5', ''), 300)
})
test('invalid timer parts cannot be persisted', () => {
  for (const [min, sec] of [['-1','0'], ['1.5','0'], ['0','60'], ['0','-2'], ['1','2.5'], ['1e3','0'], ['99999999999','0']]) {
    assert.throws(() => quizTimeInSeconds(min, sec))
  }
})
