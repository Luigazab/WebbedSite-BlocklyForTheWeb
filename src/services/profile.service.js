import { supabase, createLoginClient } from '../supabaseClient'
import { validateNewPassword } from './passwordPolicy.service'

export const profileService = {
  async getPresetAvatars() {
    const bucket = supabase.storage.from('avatar-pool')
    const avatars = []
    let offset = 0
    const limit = 100
    while (true) {
      const { data, error } = await bucket.list('', {
        limit,
        offset,
        sortBy: { column: 'name', order: 'asc' },
      })
      console.log('avatar-pool list:', { data, error })
      if (error) throw error
      const files = data ?? []
      avatars.push(...files
        .filter(file => file.id && /\.(png|jpe?g|webp|gif|avif)$/i.test(file.name))
        .map(file => ({
          name: file.name,
          path: file.name,
          url: bucket.getPublicUrl(file.name).data.publicUrl,
        })))
      if (files.length < limit) break
      offset += limit
    }
    return avatars
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
    if (!file?.type?.startsWith('image/') || file.size > 2 * 1024 * 1024) {
      throw new Error('Choose an image smaller than 2 MB.')
    }
    const ext = file.name.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '') || 'png'
    const filename = `${crypto.randomUUID()}.${ext}`
    const path = `${userId}/${filename}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: false, contentType: file.type })
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

  async updatePassword(newPassword, currentPassword) {
    if (!currentPassword) throw new Error('Enter your current password.')
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user?.email) throw new Error('Please sign in again before changing your password.')
    const verifier = createLoginClient()
    const { data, error: verificationError } = await verifier.auth.signInWithPassword({ email: user.email, password: currentPassword })
    if (verificationError || data.user?.id !== user.id) throw new Error('Your current password is incorrect.')
    try {
      await validateNewPassword(newPassword)
      const { error } = await supabase.auth.updateUser({ password: newPassword, current_password: currentPassword })
      if (error) throw error
    } finally {
      await verifier.auth.signOut({ scope: 'local' })
    }
  },
}
