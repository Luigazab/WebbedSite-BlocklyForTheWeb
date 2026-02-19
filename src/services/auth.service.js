import { supabase } from '../supabaseClient'

export const authService = {
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  async signUp(email, password, username, role) {
    // 1. Create auth user
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error

    // 2. Insert into profiles table (id comes from auth user)
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        email,
        username,
        role,
        created_at: new Date().toISOString(),
      })
    if (profileError) throw profileError

    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
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
  }
}