import test from 'node:test'
import assert from 'node:assert/strict'
import { build } from 'esbuild'
import { mkdir } from 'node:fs/promises'
import { JSDOM } from 'jsdom'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { capturedTests } from '../src/utils/validation/generatedCodeChecks.js'

await mkdir('node_modules/.cache/capture-tests', { recursive: true })
await build({ entryPoints: ['src/components/editor/CaptureValidationPanel.jsx'], bundle: true, format: 'esm', platform: 'neutral', packages: 'external', jsx: 'automatic', outfile: 'node_modules/.cache/capture-tests/panel.mjs' })
const { default: Panel, pickerDocument } = await import('../node_modules/.cache/capture-tests/panel.mjs')

test('capture panel renders initial and expected actions, readable checks and manual option without block classes', () => {
  const html = '<h1>Welcome</h1>'
  const markup = renderToStaticMarkup(React.createElement(Panel, { filename: 'index.html', initialCaptured: true, expected: { code: html, testCases: capturedTests('', html, 'index.html') }, pickerHtml: html }))
  const doc = new JSDOM(markup).window.document
  for (const label of ['Recapture starting', 'Load starting', 'Recapture expected', 'Load expected', 'Pick an element', 'Apply manual tests']) assert.ok([...doc.querySelectorAll('button')].some(button => button.textContent === label), label)
  assert.ok(doc.querySelector('details textarea[aria-label="Manual validation tests"]'))
  assert.equal(doc.querySelectorAll('input[type="checkbox"]').length, 2)
  assert.equal([...doc.querySelectorAll('[class]')].some(node => node.classList.contains('block')), false)
})

test('expected capture is disabled until starting work is available', () => {
  const doc = new JSDOM(renderToStaticMarkup(React.createElement(Panel, { filename: 'index.html', initialCaptured: false }))).window.document
  assert.equal([...doc.querySelectorAll('button')].find(button => button.textContent === 'Capture expected').disabled, true)
})

test('visual picker finds generated element checks and cannot run authored script', () => {
  const html = '<h1 id="title" onclick="window.authoredRan=true">Welcome</h1><script>window.authoredRan=true</script>'
  const checks = capturedTests('', html, 'index.html')[0].checks
  const messages = []
  const dom = new JSDOM(pickerDocument(html, checks), { runScripts: 'dangerously', beforeParse(window) { Object.defineProperty(window, 'parent', { value: { postMessage: data => messages.push(data) } }) } })
  const heading = dom.window.document.querySelector('h1')
  heading.click()
  assert.equal(dom.window.authoredRan, undefined)
  assert.equal(messages[0].type, 'CAPTURE_PICK')
  const selected = messages[0].indexes.split(',').map(Number)
  assert.ok(selected.some(index => checks[index].type === 'htmlOwnText'))
  assert.ok(selected.some(index => checks[index].type === 'htmlExists'))
  dom.window.close()
})
