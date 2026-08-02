import { supabase } from '../supabaseClient'

export const profileService = {
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) throw error
    return data
  },

  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async uploadAvatar(userId, file) {
    const ext  = file.name.split('.').pop()
    const filename = `avatar.${ext}`
    const path = `${userId}/${filename}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })
    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(path)

    const urlWithTimestamp = `${data.publicUrl}?t=${Date.now()}`

    await profileService.updateProfile(userId, { avatar_url: urlWithTimestamp })
    return urlWithTimestamp
  },

  async deleteAvatar(userId) {
    const { data: files } = await supabase.storage
      .from('avatars')
      .list(userId)

    if (files && files.length > 0) {
      const filePaths = files.map(f => `${userId}/${f.name}`)
      const { error } = await supabase.storage
        .from('avatars')
        .remove(filePaths)
      if (error) throw error
    }

    await profileService.updateProfile(userId, { avatar_url: null })
  },

  async updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
  },
}