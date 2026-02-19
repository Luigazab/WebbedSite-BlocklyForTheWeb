import { useState, useRef } from 'react'
import { useProfile }   from '../../hooks/useProfile'
import PageWrapper      from '../layout/PageWrapper'
import {
  Camera, Save, Lock, Loader2,
  User, Mail, FileText, Calendar,
  Shield, Eye, EyeOff,
} from 'lucide-react'
import { format } from 'date-fns'

const ROLE_CONFIG = {
  student: { label: 'Student', class: 'bg-sky-100    text-sky-700'    },
  teacher: { label: 'Teacher', class: 'bg-violet-100 text-violet-700' },
  admin:   { label: 'Admin',   class: 'bg-rose-100   text-rose-700'   },
}

export default function ProfilePage() {
  const { profile, saving, uploading, handleUpdateProfile, handleAvatarUpload, handleUpdatePassword } = useProfile()

  const [form, setForm]         = useState({
    username: profile?.username ?? '',
    bio:      profile?.bio      ?? '',
  })
  const [passwords, setPasswords] = useState({
    newPassword: '', confirmPassword: '',
  })
  const [showPasswords, setShowPasswords] = useState(false)
  const [activeSection, setActiveSection] = useState('info') // 'info' | 'security'
  const fileRef = useRef(null)

  if (!profile) return null

  const roleConfig = ROLE_CONFIG[profile.role] ?? ROLE_CONFIG.student
  const isDirty    = form.username !== profile.username || form.bio !== (profile.bio ?? '')

  const onSaveProfile = (e) => {
    e.preventDefault()
    if (!form.username.trim()) return
    handleUpdateProfile(form)
  }

  const onSavePassword = (e) => {
    e.preventDefault()
    handleUpdatePassword(passwords.newPassword, passwords.confirmPassword)
    setPasswords({ newPassword: '', confirmPassword: '' })
  }

  const onFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) handleAvatarUpload(file)
  }

  return (
    <PageWrapper title="My Profile" subtitle="Manage your account information">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">

        {/* Profile hero card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <img
                src={profile.avatar_url || '/default-avatar.png'}
                alt="avatar"
                className="w-24 h-24 rounded-2xl object-cover border-2 border-gray-100"
              />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-blockly-purple text-white rounded-full flex items-center justify-center shadow-md hover:bg-blockly-purple/90 disabled:opacity-60 transition-colors"
                title="Change avatar"
              >
                {uploading
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Camera className="w-3.5 h-3.5" />
                }
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFileChange}
              />
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h2 className="text-xl font-black text-gray-800">{profile.username}</h2>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full w-fit mx-auto sm:mx-0 ${roleConfig.class}`}>
                  {roleConfig.label}
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-1">{profile.email}</p>
              {profile.bio && (
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{profile.bio}</p>
              )}
            </div>

            {/* Stats */}
            <div className="flex sm:flex-col items-center gap-4 sm:gap-2 text-center shrink-0">
              <div>
                <p className="text-xs text-gray-400 font-medium">Member since</p>
                <p className="text-sm font-bold text-gray-700">
                  {format(new Date(profile.created_at), 'MMM yyyy')}
                </p>
              </div>
              {profile.last_login && (
                <div>
                  <p className="text-xs text-gray-400 font-medium">Last seen</p>
                  <p className="text-sm font-bold text-gray-700">
                    {format(new Date(profile.last_login), 'MMM d')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {[
            { key: 'info',     label: 'Profile Info', icon: User  },
            { key: 'security', label: 'Security',     icon: Lock  },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors
                ${activeSection === key
                  ? 'bg-white text-blockly-purple shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ── Profile Info ─────────────────────────────── */}
        {activeSection === 'info' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <h3 className="font-bold text-gray-800">Profile Information</h3>
              <p className="text-xs text-gray-400 mt-0.5">Update your public profile details</p>
            </div>

            <form onSubmit={onSaveProfile} className="p-6 flex flex-col gap-5">
              {/* Username */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  Username
                </label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blockly-purple focus:ring-2 focus:ring-blockly-purple/10 transition"
                  required
                />
              </div>

              {/* Email — read only */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  Email
                  <span className="text-xs text-gray-400 font-normal">(cannot be changed)</span>
                </label>
                <input
                  type="email"
                  value={profile.email ?? ''}
                  readOnly
                  className="w-full border border-gray-100 rounded-lg px-4 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                />
              </div>

              {/* Role — read only */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-400" />
                  Role
                </label>
                <div className="flex items-center gap-2 px-4 py-2.5 border border-gray-100 rounded-lg bg-gray-50">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${roleConfig.class}`}>
                    {roleConfig.label}
                  </span>
                  <span className="text-xs text-gray-400">
                    Role cannot be changed from this page
                  </span>
                </div>
              </div>

              {/* Bio */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  Bio
                  <span className="text-xs text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                  placeholder="Tell others a little about yourself..."
                  rows={3}
                  maxLength={200}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blockly-purple focus:ring-2 focus:ring-blockly-purple/10 transition resize-none"
                />
                <p className="text-xs text-gray-400 text-right">{form.bio.length}/200</p>
              </div>

              <button
                type="submit"
                disabled={saving || !isDirty}
                className="flex items-center justify-center gap-2 w-full sm:w-auto sm:self-end px-6 py-2.5 bg-blockly-purple text-white text-sm font-semibold rounded-lg hover:bg-blockly-purple/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {saving
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <><Save className="w-4 h-4" />Save Changes</>
                }
              </button>
            </form>
          </div>
        )}

        {/* ── Security ─────────────────────────────────── */}
        {activeSection === 'security' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <h3 className="font-bold text-gray-800">Change Password</h3>
              <p className="text-xs text-gray-400 mt-0.5">Must be at least 8 characters</p>
            </div>

            <form onSubmit={onSavePassword} className="p-6 flex flex-col gap-5">
              {[
                { key: 'newPassword',     label: 'New Password'     },
                { key: 'confirmPassword', label: 'Confirm Password' },
              ].map(({ key, label }) => (
                <div key={key} className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700">{label}</label>
                  <div className="relative">
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={passwords[key]}
                      onChange={(e) => setPasswords((p) => ({ ...p, [key]: e.target.value }))}
                      placeholder="••••••••"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-blockly-purple focus:ring-2 focus:ring-blockly-purple/10 transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}

              {/* Match indicator */}
              {passwords.newPassword && passwords.confirmPassword && (
                <div className={`flex items-center gap-2 text-xs font-medium
                  ${passwords.newPassword === passwords.confirmPassword ? 'text-green-500' : 'text-red-400'}`}
                >
                  {passwords.newPassword === passwords.confirmPassword
                    ? <><CheckCircle2Placeholder />Passwords match</>
                    : <>✕ Passwords don't match</>
                  }
                </div>
              )}

              <button
                type="submit"
                disabled={
                  saving ||
                  !passwords.newPassword ||
                  passwords.newPassword !== passwords.confirmPassword
                }
                className="flex items-center justify-center gap-2 w-full sm:w-auto sm:self-end px-6 py-2.5 bg-blockly-purple text-white text-sm font-semibold rounded-lg hover:bg-blockly-purple/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {saving
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <><Lock className="w-4 h-4" />Update Password</>
                }
              </button>
            </form>
          </div>
        )}
      </div>
    </PageWrapper>
  )
}

// Inline tiny icon to avoid extra import
function CheckCircle2Placeholder() {
  return <span className="text-green-500">✓</span>
}