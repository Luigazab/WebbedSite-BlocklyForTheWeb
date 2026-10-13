import { create } from 'zustand'
import { authService } from '../services/auth.service'

export function createAuthStore(service = authService) {
  let revision = 0
  let subscription = null
  let syncTimer = null
  let unsubscribeStorage = null
  return create((set, get) => {
    const clear = () => {
      clearTimeout(syncTimer)
      revision++
      set({ user: null, profile: null, profileError: null, recovery: false, loading: false })
    }
    const applySession = async (session, forceProfile = false) => {
      const currentRevision = ++revision
      if (!session?.user) { clear(); return }
      const recovery = service.isRecoverySession(session)
      if (recovery) {
        set({ user: session.user, profile: null, profileError: null, recovery: true, loading: false })
        return
      }
      if (!forceProfile && get().user?.id === session.user.id && get().profile) {
        set({ user: session.user, recovery: false, loading: false })
        return
      }
      set({ user: session.user, profile: null, profileError: null, recovery: false, loading: true })
      try {
        const profile = await service.getProfile(session.user.id)
        if (currentRevision === revision) set({ profile, loading: false })
      } catch {
        if (currentRevision === revision) set({ profile: null, loading: false, profileError: 'Your account is signed in, but its profile could not be loaded. Please retry.' })
      }
    }
    return {
      user: null, profile: null, profileError: null, recovery: false, loading: true,
      setProfile: profile => set({ profile, profileError: null }),
      initialize: async () => {
        const currentRevision = revision
        try {
          const session = await service.getSession()
          if (currentRevision === revision) await applySession(session, true)
        } catch {
          if (currentRevision === revision) clear()
        }
      },
      start: () => {
        if (!subscription) {
          const { data } = service.onAuthStateChange((event, session) => {
            // Ignore another tab's tab-only credentials; use our stored session.
            if (!service.ownsSession(session)) return
            if (event === 'PASSWORD_RECOVERY' && session) service.markRecovery(session)
            if (!session) { clear(); return }
            clearTimeout(syncTimer)
            // Defer SDK calls until its synchronous auth callback has returned.
            syncTimer = setTimeout(() => { void applySession(session) }, 0)
          })
          subscription = data.subscription
          unsubscribeStorage = service.onStorageChange?.(() => {
            clearTimeout(syncTimer)
            syncTimer = setTimeout(async () => {
              const currentRevision = revision
              try {
                const session = await service.getSession()
                if (currentRevision === revision) await applySession(session)
              } catch { if (currentRevision === revision) clear() }
            }, 0)
          })
        }
        void get().initialize()
        return () => {
          subscription?.unsubscribe()
          subscription = null
          unsubscribeStorage?.()
          unsubscribeStorage = null
          clearTimeout(syncTimer)
          revision++
        }
      },
      signIn: async (email, password, rememberMe = true) => {
        const data = await service.signIn(email, password, rememberMe)
        revision++
        set({ user: data.user, profile: data.profile, profileError: null, recovery: false, loading: false })
        return data.profile
      },
      signUp: (email, password, username, role) => service.signUp(email, password, username, role),
      signOut: async () => {
        revision++
        clearTimeout(syncTimer)
        try { await service.signOut() } finally { clear() }
      },
    }
  })
}

export const useAuthStore = createAuthStore()
