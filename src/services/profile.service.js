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
    const path = `${userId}/${filename}`  // This matches your bucket policy structure

    // Upload to storage (upsert: true will replace existing)
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })
    if (uploadError) throw uploadError

    // Get public URL
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(path)

    // Add cache-busting timestamp to force browser to reload
    const urlWithTimestamp = `${data.publicUrl}?t=${Date.now()}`

    // Save URL to profile
    await profileService.updateProfile(userId, { avatar_url: urlWithTimestamp })
    return urlWithTimestamp
  },

  async deleteAvatar(userId) {
    // List all files in user's folder
    const { data: files } = await supabase.storage
      .from('avatars')
      .list(userId)

    if (files && files.length > 0) {
      // Delete all files in the user's folder
      const filePaths = files.map(f => `${userId}/${f.name}`)
      const { error } = await supabase.storage
        .from('avatars')
        .remove(filePaths)
      if (error) throw error
    }

    // Remove URL from profile
    await profileService.updateProfile(userId, { avatar_url: null })
  },

  async updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
  },
}