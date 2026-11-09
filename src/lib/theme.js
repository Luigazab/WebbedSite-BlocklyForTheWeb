export const THEME_KEY = 'webbedsite.theme'
export const normalizeTheme = value => ['light', 'dark', 'system'].includes(value) ? value : 'system'
export const resolveTheme = (preference, systemDark) => preference === 'system' ? (systemDark ? 'dark' : 'light') : preference

export function createThemeController(browser) {
  const media = browser.matchMedia('(prefers-color-scheme: dark)')
  let preference = 'system'
  try { preference = normalizeTheme(browser.localStorage.getItem(THEME_KEY)) } catch { /* Storage is optional. */ }
  let snapshot
  const listeners = new Set()
  function apply() {
    const resolvedTheme = resolveTheme(preference, media.matches)
    browser.document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
    browser.document.documentElement.style.colorScheme = resolvedTheme
    if (snapshot?.preference === preference && snapshot?.resolvedTheme === resolvedTheme) return
    snapshot = { preference, resolvedTheme }
    listeners.forEach(listener => listener())
  }
  const onStorage = event => {
    if (event.key === THEME_KEY || event.key === null) {
      preference = normalizeTheme(event.newValue)
      apply()
    }
  }
  media.addEventListener('change', apply)
  browser.addEventListener('storage', onStorage)
  apply()
  return {
    getSnapshot: () => snapshot,
    subscribe: listener => { listeners.add(listener); return () => listeners.delete(listener) },
    setPreference(value) {
      preference = normalizeTheme(value)
      try { browser.localStorage.setItem(THEME_KEY, preference) } catch { /* Keep the in-memory choice. */ }
      apply()
    },
    destroy() { media.removeEventListener('change', apply); browser.removeEventListener('storage', onStorage); listeners.clear() },
  }
}
