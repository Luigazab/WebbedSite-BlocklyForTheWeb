import { useEffect, useState } from 'react'
import { useAuthStore }     from '../../store/authStore'
import { useFeedbackStore } from '../../store/feedbackStore'
import { useFeedback }      from '../../hooks/useFeedback'
import PageWrapper          from '../layout/PageWrapper'
import {
  Send, MessageSquare, Clock,
  CheckCircle2, Loader2, ChevronDown,
  AlertCircle, Bug, BookOpen, User, HelpCircle,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const CATEGORIES = [
  { value: 'general',  label: 'General',       icon: MessageSquare },
  { value: 'bug',      label: 'Bug / Issue',    icon: Bug           },
  { value: 'lesson',   label: 'Lesson Content', icon: BookOpen      },
  { value: 'account',  label: 'Account',        icon: User          },
  { value: 'other',    label: 'Other',          icon: HelpCircle    },
]

const STATUS_CONFIG = {
  open:      { label: 'Open',       class: 'bg-blue-100  text-blue-600'  },
  in_review: { label: 'In Review',  class: 'bg-amber-100 text-amber-600' },
  resolved:  { label: 'Resolved',   class: 'bg-green-100 text-green-600' },
}

const EMPTY_FORM = { title: '', message: '', category: 'general' }

export default function FeedbackPage() {
  const profile              = useAuthStore((s) => s.profile)
  const { myFeedback, loading, fetchMyFeedback } = useFeedbackStore()
  const { handleSubmit }     = useFeedback()
  const [form, setForm]      = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [tab, setTab]        = useState('submit')  // 'submit' | 'history'

  useEffect(() => {
    if (profile?.id) fetchMyFeedback(profile.id)
  }, [profile?.id])

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.message.trim()) return
    setSubmitting(true)
    try {
      await handleSubmit(form)
      setForm(EMPTY_FORM)
      setTab('history')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageWrapper
      title="Feedback & Support"
      subtitle="Report an issue or share your thoughts with the admin team"
    >
      <div className="max-w-3xl mx-auto flex flex-col gap-5">

        {/* Tab switcher */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {[
            { key: 'submit',  label: 'Submit Feedback' },
            { key: 'history', label: `My Reports${myFeedback.length ? ` (${myFeedback.length})` : ''}` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors
                ${tab === key
                  ? 'bg-white text-blockly-purple shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Submit tab ──────────────────────────────── */}
        {tab === 'submit' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
                className="flex items-center justify-center gap-2 w-full py-3 bg-blockly-purple text-white font-semibold btn disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <><Send className="w-4 h-4" />Send Feedback</>
                }
              </button>
            </form>
          </div>
        )}

        {/* ── History tab ─────────────────────────────── */}
        {tab === 'history' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden md:min-w-2xl px-4">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
              </div>
            ) : myFeedback.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <MessageSquare className="w-8 h-8 text-gray-200" />
                <p className="text-sm text-gray-400">You haven't submitted any feedback yet.</p>
                <button
                  onClick={() => setTab('submit')}
                  className="text-sm text-blockly-purple hover:underline font-medium"
                >
                  Submit your first report
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {myFeedback.map((item) => (
                  <FeedbackHistoryItem key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}

function FeedbackHistoryItem({ item }) {
  const [open, setOpen] = useState(false)
  const status = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.open
  const category = CATEGORIES.find((c) => c.value === item.category)

  return (
    <div className="px-6 py-4">
      <button
        onClick={() => setOpen((p) => !p)}
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

        <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 mt-1 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="mt-3 ml-13 pl-4 border-l-2 border-gray-100">
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
            {item.message}
          </p>
        </div>
      )}
    </div>
  )
}