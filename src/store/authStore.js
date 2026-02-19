import { create } from 'zustand'
import { authService } from '../services/auth.service'

export const useAuthStore = create((set) => ({
  user: null,
  profile: null,   // { id, username, email, role, bio, avatar_url, last_login }
  loading: true,
  // inside create((set) => ({
  setProfile: (profile) => set({ profile }),

  initialize: async () => {
    set({ loading: true })
    try {
      const session = await authService.getSession()
      if (session?.user) {
        const profile = await authService.getProfile(session.user.id)
        set({ user: session.user, profile, loading: false })
      } else {
        set({ user: null, profile: null, loading: false })
      }
    } catch {
      set({ user: null, profile: null, loading: false })
    }
  },

  signIn: async (email, password) => {
    const data = await authService.signIn(email, password)
    const profile = await authService.getProfile(data.user.id)
    await authService.updateLastLogin(data.user.id)
    set({ user: data.user, profile })
    return profile
  },

  signUp: async (email, password, username, role) => {
    const data = await authService.signUp(email, password, username, role)
    return data
  },

  signOut: async () => {
    await authService.signOut()
    set({ user: null, profile: null })
  },
}))