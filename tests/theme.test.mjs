import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { createThemeController, THEME_KEY } from '../src/lib/theme.js'

function browserMock({ saved = null, dark = false, blocked = false } = {}) {
  const events = new Map(), mediaEvents = new Map(), classes = new Set()
  const media = { matches: dark, addEventListener: (k, fn) => mediaEvents.set(k, fn), removeEventListener: k => mediaEvents.delete(k) }
  const browser = {
    document: { documentElement: { classList: { toggle: (key, on) => on ? classes.add(key) : classes.delete(key) }, style: {} } },
    localStorage: { getItem: () => { if (blocked) throw Error('denied'); return saved }, setItem: (key, value) => { assert.equal(key, THEME_KEY); if (blocked) throw Error('denied'); saved = value } },
    matchMedia: () => media,
    addEventListener: (k, fn) => events.set(k, fn), removeEventListener: k => events.delete(k),
  }
  return { browser, classes, saved: () => saved, system: value => { media.matches = value; mediaEvents.get('change')?.() }, storage: value => events.get('storage')?.({ key: THEME_KEY, newValue: value }) }
}

test('System follows device changes; explicit choices do not', () => {
  const env = browserMock(), controller = createThemeController(env.browser)
  assert.deepEqual(controller.getSnapshot(), { preference: 'system', resolvedTheme: 'light' })
  env.system(true)
  assert.equal(controller.getSnapshot().resolvedTheme, 'dark')
  controller.setPreference('light')
  env.system(false); env.system(true)
  assert.equal(controller.getSnapshot().resolvedTheme, 'light')
  assert.equal(env.saved(), 'light')
  controller.setPreference('system')
  assert.equal(controller.getSnapshot().resolvedTheme, 'dark')
  assert.equal(env.browser.document.documentElement.style.colorScheme, 'dark')
  controller.destroy()
})

test('Saved preferences survive reload; other tabs synchronize', () => {
  const env = browserMock({ saved: 'dark' }), controller = createThemeController(env.browser)
  assert.equal(controller.getSnapshot().resolvedTheme, 'dark')
  let notifications = 0
  const unsubscribe = controller.subscribe(() => notifications++)
  env.storage('light')
  assert.equal(controller.getSnapshot().resolvedTheme, 'light')
  assert.equal(notifications, 1)
  unsubscribe(); controller.destroy()
})

test('Invalid values and disabled storage remain usable', () => {
  for (const options of [{ saved: 'invalid' }, { blocked: true }]) {
    const env = browserMock(options), controller = createThemeController(env.browser)
    assert.equal(controller.getSnapshot().preference, 'system')
    controller.setPreference('dark')
    assert.equal(controller.getSnapshot().resolvedTheme, 'dark')
    assert.ok(env.classes.has('dark'))
    controller.destroy()
  }
})

test('Pre-render bootstrap and React controller agree in every preference/device combination', () => {
  const source = readFileSync(new URL('../public/theme-init.js', import.meta.url), 'utf8')
  for (const saved of [null, 'light', 'dark', 'system', 'invalid']) for (const dark of [false, true]) for (const blocked of [false, true]) {
    const env = browserMock({ saved, dark, blocked })
    runInNewContext(source, { window: env.browser, document: env.browser.document, localStorage: env.browser.localStorage })
    const initialDark = env.classes.has('dark')
    const controller = createThemeController(env.browser)
    assert.equal(controller.getSnapshot().resolvedTheme === 'dark', initialDark)
    controller.destroy()
  }
})
