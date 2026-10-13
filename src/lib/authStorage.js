// Persistence belongs to this tab/session, never to a shared preference flag.
export function createAuthStorage(local, tab, storageKey) {
  const modeKey = `${storageKey}:persistence`
  const recoveryKey = `${storageKey}:recovery`
  let mode = tab.getItem(modeKey)
  if (!['local', 'session'].includes(mode)) {
    mode = tab.getItem(storageKey) ? 'session' : local.getItem(storageKey) ? 'local' : 'session'
    tab.setItem(modeKey, mode)
  }
  const selected = () => mode === 'local' ? local : tab
  return {
    storage: {
      getItem: key => selected().getItem(key),
      setItem: (key, value) => selected().setItem(key, value),
      removeItem: key => selected().removeItem(key),
    },
    setPersistence(remember) {
      mode = remember ? 'local' : 'session'
      tab.setItem(modeKey, mode)
    },
    getPersistence: () => mode === 'local',
    getStoredSession() {
      try { return JSON.parse(selected().getItem(storageKey) ?? 'null') } catch { return null }
    },
    ownsSession(session) {
      const stored = this.getStoredSession()
      return session ? stored?.access_token === session.access_token : !stored
    },
    markRecovery(session) { tab.setItem(recoveryKey, session.user.id) },
    isRecovery(session) { return !!session?.user && tab.getItem(recoveryKey) === session.user.id },
    clearRecovery() { tab.removeItem(recoveryKey) },
    clearOtherCopies() {
      const userId = this.getStoredSession()?.user?.id
      if (!userId) return
      const other = mode === 'local' ? tab : local
      try {
        if (JSON.parse(other.getItem(storageKey) ?? 'null')?.user?.id === userId) {
          other.removeItem(storageKey)
          other.removeItem(`${storageKey}-code-verifier`)
        }
      } catch { /* malformed unrelated storage cannot affect this session */ }
    },
    finishLogin() {
      if (mode === 'local') tab.removeItem(storageKey)
      tab.removeItem(recoveryKey)
    },
    clearSession() {
      selected().removeItem(storageKey)
      selected().removeItem(`${storageKey}-code-verifier`)
      tab.removeItem(recoveryKey)
    },
  }
}
