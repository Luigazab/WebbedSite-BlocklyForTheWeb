import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuthStore } from '../../../store/authStore'
import { useQuizStore } from '../../../store/quizStore'
import { useQuiz } from '../../../hooks/useQuiz'
import PageWrapper from '../../../components/layout/PageWrapper'
import CreateQuizModal from '../components/CreateQuizModal'
import DeleteModal from '../../../components/ui/DeleteModal'
import {
  Plus, Search, FileQuestion, Edit, Trash2,
  Eye, Loader2, Clock, Target
} from 'lucide-react'

export default function QuizManagement() {
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const { quizzes, loading, fetchTeacherQuizzes } = useQuizStore()
  const { handleDeleteQuiz } = useQuiz()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (profile?.id) {
      fetchTeacherQuizzes(profile.id)
    }
  }, [profile?.id])

  const filteredQuizzes = quizzes.filter((quiz) =>
    quiz.title.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await handleDeleteQuiz(deleteTarget.id)
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <PageWrapper
      title="Quiz Management"
      subtitle="Create and manage quizzes for your lessons"
      actions={
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn flex items-center gap-2 px-4 py-2 bg-blockly-purple text-white text-sm font-semibold rounded-lg hover:bg-blockly-purple/90"
        >
          <Plus className="w-4 h-4" />
          Create Quiz
        </button>
      }
    >
      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search quizzes..."
          className="w-full pl-11 pr-4 py-2.5 bg-gray-100 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blockly-purple/20 transition"
        />
      </div>

      {/* Quiz Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center bg-gray-100 rounded-3xl">
          <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center">
            <FileQuestion className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">No quizzes yet</p>
            <p className="text-sm text-gray-400 mt-1">Create your first quiz to get started</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn px-4 py-2 bg-blockly-purple text-white text-sm font-semibold rounded-lg hover:bg-blockly-purple/90"
          >
            Create Quiz
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredQuizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              onEdit={() => navigate(`/teacher/quizzes/${quiz.id}/edit`)}
              onDelete={() => setDeleteTarget(quiz)}
            />
          ))}
        </div>
      )}

      {/* Create Quiz Modal */}
      {showCreateModal && (
        <CreateQuizModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={(quiz) => {
            setShowCreateModal(false)
            navigate(`/teacher/quizzes/${quiz.id}/edit`)
          }}
        />
      )}

      {/* Delete Confirmation */}
      <DeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Quiz"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This will remove it from all lessons and delete all student attempts.`}
        confirmText="Delete"
        loading={deleting}
      />
    </PageWrapper>
  )
}

// ──────────────────────────────────────────────────────────
// Quiz Card Component
// ──────────────────────────────────────────────────────────
function QuizCard({ quiz, onEdit, onDelete }) {
  const questionCount = quiz.questions?.length || 0
  const lessonCount = quiz.lessons?.length || 0

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
            <FileQuestion className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 truncate">{quiz.title}</h3>
            {quiz.description && (
              <p className="text-xs text-gray-400 mt-1 line-clamp-2">{quiz.description}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <FileQuestion className="w-3.5 h-3.5" />
            <span>{questionCount} question{questionCount !== 1 ? 's' : ''}</span>
          </div>
          {quiz.time_limit && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{quiz.time_limit} min</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5" />
            <span>{quiz.passing_score}% pass</span>
          </div>
        </div>

        {lessonCount > 0 && (
          <div className="text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg">
            Used in {lessonCount} lesson{lessonCount !== 1 ? 's' : ''}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-gray-50">
          <button
            onClick={onEdit}
            className="btn flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blockly-purple text-white rounded-lg text-sm font-semibold hover:bg-blockly-purple/90 transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            onClick={onDelete}
            className="btn flex items-center justify-center gap-2 px-3 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}