import { useEffect, useState } from 'react'
import { useFeedbackStore } from '../../../store/feedbackStore'
import { useFeedback }      from '../../../hooks/useFeedback'
import PageWrapper          from '../../../components/layout/PageWrapper'
import {
  MessageSquare, Bug, BookOpen, User, HelpCircle,
  Filter, Trash2, CheckCircle2, Clock, Eye,
  ChevronDown, Loader2, Search, X,
  FilterIcon,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { AppBreadcrumb } from '#components/common/breadcrumb'
import AdminStat from '../components/AdminStat'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '#components/ui/dropdown-menu'

const CATEGORIES = [
  { value: 'all',      label: 'All Category',   icon: Filter },
  { value: 'general',  label: 'General',        icon: MessageSquare },
  { value: 'bug',      label: 'Bug',            icon: Bug           },
  { value: 'lesson',   label: 'Lesson',         icon: BookOpen      },
  { value: 'account',  label: 'Account',        icon: User          },
  { value: 'other',    label: 'Other',          icon: HelpCircle    },
]

const STATUSES = [
  { value: 'open',      label: 'Open',      icon: Clock,         class: 'bg-blue-100  text-blue-600'  },
  { value: 'in_review', label: 'In Review', icon: Eye,           class: 'bg-amber-100 text-amber-600' },
  { value: 'resolved',  label: 'Resolved',  icon: CheckCircle2,  class: 'bg-green-100 text-green-600' },
]

const ROLE_BADGE = {
  student: 'bg-sky-100    text-sky-600',
  teacher: 'bg-violet-100 text-violet-600',
  admin:   'bg-rose-100   text-rose-600',
}

export default function ReportsAndFeedback() {
  const { allFeedback, loading, fetchAllFeedback } = useFeedbackStore()
  const { handleUpdateStatus, handleDelete }       = useFeedback()
  const [search, setSearch]       = useState('')
  const [filterStatus, setFilterStatus]     = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [expandedId, setExpandedId]         = useState(null)
  const [confirmDelete, setConfirmDelete]   = useState(null)

  useEffect(() => { fetchAllFeedback() }, [])

  const filtered = allFeedback.filter((f) => {
    const matchesSearch =
      f.title?.toLowerCase().includes(search.toLowerCase()) ||
      f.sender?.username?.toLowerCase().includes(search.toLowerCase()) ||
      f.message?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus   = filterStatus   === 'all' || f.status   === filterStatus
    const matchesCategory = filterCategory === 'all' || f.category === filterCategory
    return matchesSearch && matchesStatus && matchesCategory
  })

  // Stats
  const counts = {
    open:      allFeedback.filter((f) => f.status === 'open').length,
    in_review: allFeedback.filter((f) => f.status === 'in_review').length,
    resolved:  allFeedback.filter((f) => f.status === 'resolved').length,
  }

  const onDeleteClick = (id) => {
    if (confirmDelete === id) {
      handleDelete(id)
      setConfirmDelete(null)
    } else {
      setConfirmDelete(id)
      setTimeout(() => setConfirmDelete(null), 3000)
    }
  }

  return (
    <div className='p-6 space-y-6'>
      <AppBreadcrumb
        items={[
          { label: 'Home', href: '/admin/' },
          { label: 'Reports and Feedback', href: '/admin/reports' },
        ]}
      />
      <div>
        <h2 className="font-display text-2xl font-semibold">Reports & Feedback</h2>
        <p className="mt-1 text-sm text-muted-foreground">All feedback submitted by students and teachers</p>
      </div>
      {/* Stat cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {STATUSES.map(({ value, label, icon: Icon, class: cls }) => (
          <button key={value}
            onClick={() => setFilterStatus(filterStatus === value ? 'all' : value)}
            className={`rounded-xl border text-left transition-all!`}
          >
            {filterStatus === value ? <AdminStat label={label} value={counts[value]} icon={Icon} accent/> : <AdminStat label={label} value={counts[value]} icon={Icon}/>}
          </button>
        ))}
      </div>

      {/* Search + category filter */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2.5 flex-1 min-w-48 shadow focus-within:border-sky-500/30 transition-colors!">
          <Search className="shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, sender, or message..."
            className="bg-transparent text-sm  outline-none flex-1"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 self-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="min-w-40 justify-between">
              <button className="flex shadow items-center gap-2 px-3 py-2.5 bg-white border border-border rounded-lg hover:bg-slate-50 transition-colors">
                <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="capitalize">
                  {filterCategory === "all" ? "All Category" : filterCategory}
                </span>
                <ChevronDown size={14} className="text-slate-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="min-w-40">
              {CATEGORIES.map(({ value, label, icon: Icon }) => (
                <DropdownMenuItem
                  key={value}
                  onClick={() => setFilterCategory(value)}
                  className={`capitalize ${
                    filterCategory === value
                      ? "bg-blockly-purple/10 text-blockly-purple"
                      : ""
                  }`}
                >
                  <Icon size={13}/>
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <MessageSquare className="w-8 h-8 text-gray-200" />
            <p className="text-sm text-gray-400">No feedback found.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((item) => {
              const status   = STATUSES.find((s) => s.value === item.status)
              const category = CATEGORIES.find((c) => c.value === item.category)
              const isOpen   = expandedId === item.id

              return (
                <div key={item.id} className="px-6 py-4 flex flex-col gap-3">
                  {/* Row */}
                  <div className="flex items-start gap-4">
                    {/* Sender avatar */}
                    <img
                      src={item.sender?.avatar_url || '/default-avatar.png'}
                      alt=""
                      className="w-9 h-9 rounded-full object-cover border border-gray-100 shrink-0 mt-0.5"
                    />

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-gray-800">{item.title}</p>
                        {status && (
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.class}`}>
                            {status.label}
                          </span>
                        )}
                        {category && (
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                            {category.label}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs font-semibold text-gray-600">
                          {item.sender?.username}
                        </span>
                        {item.sender?.role && (
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${ROLE_BADGE[item.sender.role] ?? ''}`}>
                            {item.sender.role}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setExpandedId(isOpen ? null : item.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        title="View message"
                      >
                        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <button
                        onClick={() => onDeleteClick(item.id)}
                        className={`p-2 rounded-lg transition-colors text-xs font-semibold flex items-center gap-1
                          ${confirmDelete === item.id
                            ? 'bg-red-500 text-white'
                            : 'text-gray-400 hover:text-red-400 hover:bg-red-50'
                          }`}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                        {confirmDelete === item.id && 'Sure?'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded message + status controls */}
                  {isOpen && (
                    <div className="ml-13 flex flex-col gap-4 pl-4 border-l-2 border-gray-100">
                      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                        {item.message}
                      </p>

                      {/* Status changer */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Update status:
                        </span>
                        {STATUSES.map(({ value, label, class: cls }) => (
                          <button
                            key={value}
                            disabled={item.status === value}
                            onClick={() => handleUpdateStatus(item.id, value)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
                              ${item.status === value
                                ? `${cls} cursor-default`
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                              }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}