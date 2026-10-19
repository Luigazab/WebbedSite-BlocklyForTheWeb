/**
 * Service for authentication
 * functions are:
 *    > signIn
 *    > signUp
 *    > signOut
 *    > getSession
 *    > getProfile
 *    > updateLastLogin
 *    > onAuthStateChange
 *    > resendConfirmation
 *    > resetPasswordRequest
 *    > updatePassword
 */
import { supabase, authStorage, createLoginClient, recoveryAccessToken } from '../supabaseClient'
import { validateNewPassword } from './passwordPolicy.service'

export const authService = {
  async signIn(email, password, rememberMe = true) {
    const attempt = createLoginClient()
    const { data, error } = await attempt.auth.signInWithPassword({ email: email.trim(), password })
    if (error) throw error
    try {
      const { data: profile, error: profileError } = await attempt.from('profiles').select('*').eq('id', data.user.id).single()
      if (profileError) throw new Error('Your account profile could not be loaded. Please try signing in again.')
      const previousMode = authStorage.getPersistence()
      authStorage.setPersistence(rememberMe)
      const { error: sessionError } = await supabase.auth.setSession({ access_token: data.session.access_token, refresh_token: data.session.refresh_token })
      if (sessionError) {
        authStorage.setPersistence(previousMode)
        throw sessionError
      }
      authStorage.finishLogin()
      return { ...data, profile }
    } catch (failure) {
      await attempt.auth.signOut({ scope: 'local' })
      throw failure
    }
  },

  async signUp(email, password, username, role) {
    if (role && role !== 'student') throw new Error('Teacher accounts are created by your administrator.')
    role = 'student'
    if (username.trim().length < 3 || username.trim().length > 80) throw new Error('Username must be 3–80 characters.')
    await validateNewPassword(password)
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: `${window.location.origin}/login`, data: { username: username.trim(), role } } })
    if (error) throw error
    // The auth signup trigger creates the profile before email confirmation.
    return data
  },

  async signOut() {
    authStorage.clearOtherCopies()
    const { error } = await supabase.auth.signOut({ scope: 'global' })
    authStorage.clearRecovery()
    if (error) {
      authStorage.clearSession()
      await supabase.auth.signOut({ scope: 'local' })
      throw new Error('Signed out on this browser. Other sessions could not be revoked; please try again when connected.')
    }
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    if (data.session?.access_token === recoveryAccessToken) authStorage.markRecovery(data.session)
    return data.session
  },

  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) throw error
    return data
  },

  async updateLastLogin(userId) {
    await supabase
      .from('profiles')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userId)
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  },

  async resendConfirmation(email) {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/login` },
    });
    if (error) throw error;
  },

  async resetPasswordRequest(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/update-password`,
    });
    if (error) throw error;
  },

  async updatePassword(newPassword) {
    await validateNewPassword(newPassword)
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },
  ownsSession: session => authStorage.ownsSession(session),
  isRecoverySession: session => authStorage.isRecovery(session),
  markRecovery: session => authStorage.markRecovery(session),
  onStorageChange(callback) {
    const listener = event => {
      if (event.storageArea === localStorage && event.key?.endsWith('-auth-token')) callback()
    }
    window.addEventListener('storage', listener)
    return () => window.removeEventListener('storage', listener)
  },
}
