import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { fetchTeacherQuizzes, deleteQuiz } from '../../../services/quizService'
import { useAuth } from '../../../hooks/useAuth'
import QuizCard from '../components/QuizCard'
import { FileEdit, Plus, Search } from 'lucide-react'

export default function QuizzesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const data = await fetchTeacherQuizzes(user.id)
      setQuizzes(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [user.id])

  const filtered = useMemo(() => {
    if (!search.trim()) return quizzes
    const q = search.toLowerCase()
    return quizzes.filter((quiz) => quiz.title.toLowerCase().includes(q))
  }, [quizzes, search])

  const handleDelete = async () => {
    if (!deleteConfirm) return
    setDeleting(true)
    try {
      await deleteQuiz(deleteConfirm.id)
      setQuizzes((prev) => prev.filter((q) => q.id !== deleteConfirm.id))
      setDeleteConfirm(null)
    } catch (err) {
      alert('Failed to delete quiz: ' + err.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">My Quizzes</h1>
            <p className="text-sm text-slate-500 mt-1">
              {quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''} created
            </p>
          </div>
          <button
            onClick={() => navigate('/teacher/quizzes/create')}
            className="flex items-center gap-2 btn btn-primary text-lg font-bold rounded-xl shadow-sm shadow-indigo-200"
          >
            <span className="text-lg"><Plus size={18} /></span> Create Quiz
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search quizzes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blockly-blue bg-white shadow-sm transition"
            />
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 bg-white rounded-2xl border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col bg-slate-200 rounded-3xl items-center justify-center py-12 text-center">
            <div className="text-5xl mb-4 text-blockly-light bg-blockly-blue p-4 rounded-xl"><FileEdit size={48}/></div>
            <h2 className="text-lg font-bold text-slate-700">
              {search ? 'No quizzes match your search' : 'No quizzes yet'}
            </h2>
            <p className="text-sm text-slate-700">
              {search ? 'Try a different search.' : 'Create your first quiz to get started.'}
            </p>
            {!search && (
              <button
                onClick={() => navigate('/teacher/quizzes/create')}
                className="flex items-center gap-2 px-5 py-2.5 mt-2 btn btn-primary text-sm font-bold rounded-xl shadow-sm shadow-indigo-200"
              >
                <span className="text-lg"><Plus size={18} /></span> Create First Quiz
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                onEdit={(q) => navigate(`/teacher/quizzes/${q.id}/edit`)}
                onDelete={(q) => setDeleteConfirm(q)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="text-base font-bold text-slate-800 mb-2">Delete Quiz?</h2>
            <p className="text-sm text-slate-500 mb-6">
              <strong>"{deleteConfirm.title}"</strong> and all its questions will be permanently deleted.
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