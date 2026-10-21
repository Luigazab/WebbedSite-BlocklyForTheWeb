const RELOAD_MARKER = 'webbedsite:last-chunk-reload'

export function shouldReloadAfterChunkError(storage, now = Date.now(), cooldownMs = 60000) {
  const previous = Number(storage.getItem(RELOAD_MARKER) || 0)
  if (Number.isFinite(previous) && previous > 0 && now - previous < cooldownMs) return false
  storage.setItem(RELOAD_MARKER, String(now))
  return true
}

export function installChunkRecovery(browserWindow = window) {
  const recover = event => {
    if (!shouldReloadAfterChunkError(browserWindow.sessionStorage)) return
    event.preventDefault()
    browserWindow.location.reload()
  }
  browserWindow.addEventListener('vite:preloadError', recover)
  return () => browserWindow.removeEventListener('vite:preloadError', recover)
}
