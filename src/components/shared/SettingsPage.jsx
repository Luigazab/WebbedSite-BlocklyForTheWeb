import { useState, useRef } from 'react'
import { useProfile }     from '../../hooks/useProfile'
import { useFeedback }    from '../../hooks/useFeedback'
import { useAuthStore }   from '../../store/authStore'
import { useFeedbackStore } from '../../store/feedbackStore'
import PageWrapper        from '../layout/PageWrapper'
import { useEffect } from 'react'
import {
  User, Mail, FileText, Lock, Eye, EyeOff,
  Save, Camera, Loader2, Send, ChevronDown,
  MessageSquare, Bug, BookOpen, HelpCircle,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const TABS = ['Profile Info', 'Security', 'Submit Feedback', 'My Reports']

const CATEGORIES = [
  { value: 'general',  label: 'General',         icon: MessageSquare },
  { value: 'bug',      label: 'Bug / Issue',     icon: Bug           },
  { value: 'lesson',   label: 'Lesson Content',  icon: BookOpen      },
  { value: 'account',  label: 'Account',         icon: User          },
  { value: 'other',    label: 'Other',           icon: HelpCircle    },
]

const STATUS_CONFIG = {
  open:      { label: 'Open',       class: 'bg-blue-100  text-blue-600'  },
  in_review: { label: 'In Review',  class: 'bg-amber-100 text-amber-600' },
  resolved:  { label: 'Resolved',   class: 'bg-green-100 text-green-600' },
}

const ROLE_CONFIG = {
  student: { label: 'Student', class: 'bg-sky-100    text-sky-700'    },
  teacher: { label: 'Teacher', class: 'bg-violet-100 text-violet-700' },
  admin:   { label: 'Admin',   class: 'bg-rose-100   text-rose-700'   },
}

export default function SettingsPage() {
  const profile = useAuthStore((s) => s.profile)
  const { myFeedback } = useFeedbackStore()
  const [activeTab, setActiveTab] = useState('Profile Info')

  if (!profile) return null

  return (
    <PageWrapper>
      <div className="max-w-3xl w-full mx-auto flex flex-col gap-5">
        <div className='font-bold'>
          <h1 className='text-2xl'>Settings</h1>
          <p className='text-slate-400'>Manage your account and preferences</p>
        </div>
        {/* Tab navigation */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors
                ${activeTab === tab
                  ? 'bg-blockly-purple text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
            >
              {tab}
              {tab === 'My Reports' && myFeedback.length > 0 && (
                <span className="ml-1.5 text-xs opacity-75">
                  ({myFeedback.length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'Profile Info' && <ProfileInfoTab />}
        {activeTab === 'Security' && <SecurityTab />}
        {activeTab === 'Submit Feedback' && <SubmitFeedbackTab />}
        {activeTab === 'My Reports' && <MyReportsTab />}
      </div>
    </PageWrapper>
  )
}

// ──────────────────────────────────────────────────────────
// Profile Info Tab
// ──────────────────────────────────────────────────────────
function ProfileInfoTab() {
  const { profile, saving, uploading, handleUpdateProfile, handleAvatarUpload } = useProfile()
  const [form, setForm] = useState({
    username: profile?.username ?? '',
    bio:      profile?.bio      ?? '',
  })
  const fileRef = useRef(null)

  const roleConfig = ROLE_CONFIG[profile?.role] ?? ROLE_CONFIG.student
  const isDirty = form.username !== profile?.username || form.bio !== (profile?.bio ?? '')

  const onSave = (e) => {
    e.preventDefault()
    if (!form.username.trim()) return
    handleUpdateProfile(form)
  }

  const onFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) handleAvatarUpload(file)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden w-full">
      {/* Header with avatar */}
      <div className="px-6 py-5 border-b border-gray-50 bg-gray-50/50">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            <img
              src={profile?.avatar_url || '/default-avatar.png'}
              alt="avatar"
              className="w-20 h-20 rounded-2xl object-cover border-2 border-gray-100"
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-blockly-purple text-white rounded-full flex items-center justify-center shadow-md hover:bg-blockly-purple/90 disabled:opacity-60 transition-colors"
              title="Change avatar"
            >
              {uploading
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Camera className="w-3 h-3" />
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
          <div className="flex-1">
            <h3 className="font-bold text-gray-800">{profile?.username}</h3>
            <p className="text-sm text-gray-400 mt-0.5">{profile?.email}</p>
            <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full mt-2 ${roleConfig.class}`}>
              {roleConfig.label}
            </span>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={onSave} className="p-6 flex flex-col gap-5">
        {/* Username */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            Name
          </label>
          <input
            type="text"
            value={form.username}
            onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
            placeholder="Your name"
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
            value={profile?.email ?? ''}
            readOnly
            className="w-full border border-gray-100 rounded-lg px-4 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
          />
        </div>

        {/* Bio */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" />
            Bio
          </label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
            placeholder="Biooo"
            rows={3}
            maxLength={200}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blockly-purple focus:ring-2 focus:ring-blockly-purple/10 transition resize-none"
          />
          <p className="text-xs text-gray-400 text-right">{form.bio.length}/200</p>
        </div>

        <button
          type="submit"
          disabled={saving || !isDirty}
          className="flex items-center justify-center gap-2 w-full sm:w-auto sm:self-end px-6 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {saving
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <><Save className="w-4 h-4" />Save Changes</>
          }
        </button>
      </form>
    </div>
  )
}

// ──────────────────────────────────────────────────────────
// Security Tab
// ──────────────────────────────────────────────────────────
function SecurityTab() {
  const { saving, handleUpdatePassword } = useProfile()
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPasswords, setShowPasswords] = useState(false)

  const onSave = (e) => {
    e.preventDefault()
    handleUpdatePassword(passwords.newPassword, passwords.confirmPassword)
    setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' })
  }

  const allFilled = passwords.oldPassword && passwords.newPassword && passwords.confirmPassword
  const passwordsMatch = passwords.newPassword === passwords.confirmPassword

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden w-full">
      <div className="px-6 py-4 border-b border-gray-50">
        <h3 className="font-bold text-gray-800">Change Password</h3>
        <p className="text-xs text-gray-400 mt-0.5">Must be at least 8 characters</p>
      </div>

      <form onSubmit={onSave} className="p-6 flex flex-col gap-5">
        {[
          { key: 'oldPassword',     label: 'Old Password'     },
          { key: 'newPassword',     label: 'New Password'     },
          { key: 'confirmPassword', label: 'Confirm New Password' },
        ].map(({ key, label }) => (
          <div key={key} className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">{label}</label>
            <div className="relative">
              <input
                type={showPasswords ? 'text' : 'password'}
                value={passwords[key]}
                onChange={(e) => setPasswords((p) => ({ ...p, [key]: e.target.value }))}
                placeholder="*********"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-blockly-purple focus:ring-2 focus:ring-blockly-purple/10 transition"
                required
              />
              {key === 'confirmPassword' && (
                <button
                  type="button"
                  onClick={() => setShowPasswords((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>
        ))}

        <button
          type="submit"
          disabled={saving || !allFilled || !passwordsMatch}
          className="flex items-center justify-center gap-2 w-full sm:w-auto sm:self-end px-6 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {saving
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <><Lock className="w-4 h-4" />Update Password</>
          }
        </button>
      </form>
    </div>
  )
}

// ──────────────────────────────────────────────────────────
// Submit Feedback Tab
// ──────────────────────────────────────────────────────────
function SubmitFeedbackTab() {
  const { handleSubmit } = useFeedback()
  const [form, setForm] = useState({ title: '', message: '', category: 'general' })
  const [submitting, setSubmitting] = useState(false)

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.message.trim()) return
    setSubmitting(true)
    try {
      await handleSubmit(form)
      setForm({ title: '', message: '', category: 'general' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden w-full">
      <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
        <p className="text-sm text-gray-500">
          All feedback goes directly to our admin team. We typically respond within 1–2 business days.
        </p>
      </div>

      <form onSubmit={onSubmit} className="p-6 flex flex-col gap-5">
        {/* Category */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(({ value, label, icon: Icon }) => (
              <button
                type="button"
                key={value}
                onClick={() => setField('category', value)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-all
                  ${form.category === value
                    ? 'border-blockly-purple bg-blockly-purple/10 text-blockly-purple'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setField('title', e.target.value)}
            placeholder="Brief summary of your issue..."
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blockly-purple focus:ring-2 focus:ring-blockly-purple/10 transition"
            required
          />
        </div>

        {/* Message */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">
            Message <span className="text-red-400">*</span>
          </label>
          <textarea
            value={form.message}
            onChange={(e) => setField('message', e.target.value)}
            placeholder="Describe your issue in as much detail as possible..."
            rows={5}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blockly-purple focus:ring-2 focus:ring-blockly-purple/10 transition resize-none"
            required
          />
          <p className="text-xs text-gray-400 text-right">
            {form.message.length} characters
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting || !form.title.trim() || !form.message.trim()}
          className="flex items-center justify-center gap-2 w-full py-3 bg-blockly-purple text-white font-semibold rounded-xl hover:bg-blockly-purple/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {submitting
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <><Send className="w-4 h-4" />Send Feedback</>
          }
        </button>
      </form>
    </div>
  )
}

// ──────────────────────────────────────────────────────────
// My Reports Tab
// ──────────────────────────────────────────────────────────
function MyReportsTab() {
  const profile = useAuthStore((s) => s.profile)
  const { myFeedback, loading, fetchMyFeedback } = useFeedbackStore()
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    if (profile?.id) fetchMyFeedback(profile.id)
  }, [profile?.id])

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 flex items-center justify-center w-full">
        <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
      </div>
    )
  }

  if (myFeedback.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 flex flex-col items-center justify-center gap-3 w-full">
        <MessageSquare className="w-8 h-8 text-gray-200" />
        <p className="text-sm text-gray-400">You haven't submitted any feedback yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50 w-full">
      {myFeedback.map((item) => {
        const isOpen = expandedId === item.id
        const status = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.open
        const category = CATEGORIES.find((c) => c.value === item.category)

        return (
          <div key={item.id} className="px-6 py-4">
            <button
              onClick={() => setExpandedId(isOpen ? null : item.id)}
              className="w-full flex items-start gap-4 text-left"
            >
              {/* Category icon */}
              <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                {category && <category.icon className="w-4 h-4 text-gray-500" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-gray-800 truncate">{item.title}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.class}`}>
                    {status.label}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-400 capitalize">{category?.label}</span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>

              <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 mt-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
              <div className="mt-3 ml-13 pl-4 border-l-2 border-gray-100">
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {item.message}
                </p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}