import { useState } from 'react'
import { profileService } from '../services/profile.service'
import { useAuthStore } from '../store/authStore'
import { useUIStore } from '../store/uiStore'

export function useProfile() {
  const { profile, user }  = useAuthStore()
  const setProfile         = useAuthStore((s) => s.setProfile)
  const addToast           = useUIStore((s) => s.addToast)
  const [saving, setSaving]  = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleUpdateProfile = async (updates) => {
    setSaving(true)
    try {
      const updated = await profileService.updateProfile(profile.id, updates)
      setProfile(updated)
      addToast('Profile updated!', 'success')
      return updated
    } catch (err) {
      addToast(err.message || 'Failed to update profile.', 'error')
      throw err
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (file) => {
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      addToast('Image must be under 2MB.', 'error')
      return
    }
    setUploading(true)
    try {
      const url = await profileService.uploadAvatar(profile.id, file)
      setProfile({ ...profile, avatar_url: url })
      addToast('Avatar updated!', 'success')
      return url
    } catch (err) {
      addToast(err.message || 'Failed to upload avatar.', 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleUpdatePassword = async (newPassword, confirmPassword) => {
    if (newPassword !== confirmPassword) {
      addToast('Passwords do not match.', 'error')
      return
    }
    if (newPassword.length < 8) {
      addToast('Password must be at least 8 characters.', 'error')
      return
    }
    setSaving(true)
    try {
      await profileService.updatePassword(newPassword)
      addToast('Password updated successfully!', 'success')
    } catch (err) {
      addToast(err.message || 'Failed to update password.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return {
    profile,
    saving,
    uploading,
    handleUpdateProfile,
    handleAvatarUpload,
    handleUpdatePassword,
  }
}