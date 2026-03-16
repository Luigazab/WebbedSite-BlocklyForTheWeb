import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { fetchTeacherTutorials, deleteTutorial } from '../../../services/tutorial.service'
import { useAuth } from '../../../hooks/useAuth'
import TutorialCard from '../components/TutorialCard'
import { BookOpen, PlusIcon, Search } from 'lucide-react'

export default function TutorialsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [tutorials, setTutorials] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all') // 'all' | 'published' | 'draft'
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const data = await fetchTeacherTutorials(user.id)
      setTutorials(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [user.id])

  const filtered = useMemo(() => {
    let list = tutorials
    if (filter === 'published') list = list.filter((t) => t.is_published)
    if (filter === 'draft') list = list.filter((t) => !t.is_published)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((t) => t.title?.toLowerCase().includes(q))
    }
    return list
  }, [tutorials, filter, search])

  const handleDelete = async () => {
    if (!deleteConfirm) return
    setDeleting(true)
    try {
      await deleteTutorial(deleteConfirm.id)
      setTutorials((prev) => prev.filter((t) => t.id !== deleteConfirm.id))
      setDeleteConfirm(null)
    } catch (err) {
      alert('Failed to delete tutorial: ' + err.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Page header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-700">Tutorials</h1>
            <p className="text-sm text-slate-500 mt-1">
              {tutorials.length} tutorial{tutorials.length !== 1 ? 's' : ''} created
            </p>
          </div>
          <button
            onClick={() => navigate('/teacher/tutorials/create')}
            className="flex btn btn-primary gap-2 items-center text-lg"
          >
            <PlusIcon className="w-5 h-5" /> Create Tutorial
          </button>
        </div>

        {/* Search + Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tutorials…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blockly-blue bg-white shadow-sm transition"
            />
          </div>
          <div className="flex gap-1.5 p-1 bg-white border border-slate-200 rounded-xl shadow-sm">
            {[
              { key: 'all',       label: 'All'       },
              { key: 'published', label: 'Published' },
              { key: 'draft',     label: 'Draft'     },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filter === f.key
                    ? 'btn-primary shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-white rounded-2xl border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col bg-slate-200 rounded-3xl items-center justify-center py-12 text-center gap-3">
            <div className="text-blockly-light bg-blockly-blue p-4 rounded-xl">
              <BookOpen size={48} />
            </div>
            <h2 className="text-lg font-bold text-slate-700">
              {search || filter !== 'all' ? 'No tutorials match your filters' : 'No tutorials yet'}
            </h2>
            <p className="text-sm text-slate-700">
              {search || filter !== 'all'
                ? 'Try adjusting your search or filter.'
                : 'Create your first tutorial to guide students step by step.'}
            </p>
            {!search && filter === 'all' && (
              <button
                onClick={() => navigate('/teacher/tutorials/create')}
                className="flex items-center gap-2 px-5 py-2.5 btn btn-primary text-sm font-bold rounded-xl shadow-sm"
              >
                <PlusIcon size={18} /> Create First Tutorial
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((tutorial) => (
              <TutorialCard
                key={tutorial.id}
                tutorial={tutorial}
                onEdit={(t) => navigate(`/teacher/tutorials/${t.id}/edit`)}
                onDelete={(t) => setDeleteConfirm(t)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="text-base font-bold text-slate-800 mb-2">Delete Tutorial?</h2>
            <p className="text-sm text-slate-500 mb-6">
              <strong>"{deleteConfirm.title}"</strong> and all its steps will be permanently deleted.
              This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}