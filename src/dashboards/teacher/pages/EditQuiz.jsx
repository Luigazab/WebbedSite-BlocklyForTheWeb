import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useQuizStore } from '../../../store/quizStore'
import { useQuiz } from '../../../hooks/useQuiz'
import PageWrapper from '../../../components/layout/PageWrapper'
import QuestionEditor from '../components/QuestionEditor'
import {
  ArrowLeft, Save, Plus, Loader2, GripVertical,
  Trash2, Edit2
} from 'lucide-react'

export default function EditQuiz() {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const { currentQuiz, loading, fetchQuiz } = useQuizStore()
  const {
    handleUpdateQuiz,
    handleAddQuestion,
    handleUpdateQuestion,
    handleDeleteQuestion
  } = useQuiz()

  const [form, setForm] = useState({
    title: '',
    description: '',
    time_limit: null,
    passing_score: 70,
  })
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [showQuestionEditor, setShowQuestionEditor] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (quizId) {
      fetchQuiz(quizId)
    }
  }, [quizId])

  useEffect(() => {
    if (currentQuiz) {
      setForm({
        title: currentQuiz.title || '',
        description: currentQuiz.description || '',
        time_limit: currentQuiz.time_limit,
        passing_score: currentQuiz.passing_score || 70,
      })
    }
  }, [currentQuiz])

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    if (!form.title.trim()) {
      alert('Title is required')
      return
    }

    setSaving(true)
    try {
      await handleUpdateQuiz(quizId, form)
    } finally {
      setSaving(false)
    }
  }

  const handleEditQuestion = (question) => {
    setEditingQuestion(question)
    setShowQuestionEditor(true)
  }

  const handleDeleteQuestionClick = async (questionId) => {
    if (!confirm('Delete this question?')) return
    await handleDeleteQuestion(questionId)
  }

  const questions = currentQuiz?.questions || []

  if (loading && !currentQuiz) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/teacher/quizzes')}
              className="btn p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Quiz</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                Manage quiz settings and questions
              </p>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn flex items-center gap-2 px-6 py-2 bg-blockly-purple text-white rounded-lg text-sm font-semibold hover:bg-blockly-purple/90 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </button>
        </div>

        {/* Quiz Settings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
          <h2 className="text-lg font-bold text-gray-900">Quiz Settings</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-sm font-semibold text-gray-700">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setField('title', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blockly-purple focus:ring-2 focus:ring-blockly-purple/10 transition"
                required
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-sm font-semibold text-gray-700">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                rows={2}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blockly-purple focus:ring-2 focus:ring-blockly-purple/10 transition resize-none"
              />
            </div>

            {/* Time Limit */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Time Limit (minutes)</label>
              <input
                type="number"
                value={form.time_limit || ''}
                onChange={(e) => setField('time_limit', e.target.value ? parseInt(e.target.value) : null)}
                placeholder="No limit"
                min="1"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blockly-purple focus:ring-2 focus:ring-blockly-purple/10 transition"
              />
            </div>

            {/* Passing Score */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Passing Score (%)</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  value={form.passing_score}
                  onChange={(e) => setField('passing_score', parseInt(e.target.value))}
                  min="0"
                  max="100"
                  step="5"
                  className="flex-1"
                />
                <span className="text-sm font-bold text-blockly-purple w-12">
                  {form.passing_score}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Questions</h2>
              <p className="text-xs text-gray-400 mt-0.5">{questions.length} question{questions.length !== 1 ? 's' : ''}</p>
            </div>
            <button
              onClick={() => {
                setEditingQuestion(null)
                setShowQuestionEditor(true)
              }}
              className="btn flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </button>
          </div>

          <div className="p-6">
            {questions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm text-gray-500">No questions yet</p>
                <p className="text-xs text-gray-400 mt-1">Add questions to build your quiz</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {questions.map((question, index) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    index={index}
                    onEdit={() => handleEditQuestion(question)}
                    onDelete={() => handleDeleteQuestionClick(question.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Question Editor Modal */}
      {showQuestionEditor && (
        <QuestionEditor
          quizId={quizId}
          question={editingQuestion}
          onClose={() => {
            setShowQuestionEditor(false)
            setEditingQuestion(null)
          }}
          onSave={(question) => {
            if (editingQuestion) {
              handleUpdateQuestion(editingQuestion.id, question)
            } else {
              handleAddQuestion(quizId, question)
            }
            setShowQuestionEditor(false)
            setEditingQuestion(null)
          }}
        />
      )}
    </PageWrapper>
  )
}

// ──────────────────────────────────────────────────────────
// Question Card Component
// ──────────────────────────────────────────────────────────
function QuestionCard({ question, index, onEdit, onDelete }) {
  const correctOption = ['A', 'B', 'C', 'D'][question.correct_answer]

  return (
    <div className="border border-gray-200 rounded-xl p-4 hover:border-blockly-purple transition-colors group">
      <div className="flex items-start gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <GripVertical className="w-4 h-4 text-gray-300" />
          <span className="text-sm font-bold text-gray-400">Q{index + 1}</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 mb-2">{question.question_text}</p>
          <div className="grid grid-cols-2 gap-2">
            {question.options.map((option, i) => {
              const label = ['A', 'B', 'C', 'D'][i]
              const isCorrect = i === question.correct_answer
              return (
                <div
                  key={i}
                  className={`text-xs px-3 py-2 rounded-lg border ${
                    isCorrect
                      ? 'bg-green-50 border-green-200 text-green-700 font-semibold'
                      : 'bg-gray-50 border-gray-200 text-gray-600'
                  }`}
                >
                  <span className="font-bold">{label}.</span> {option}
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-2 rounded-lg hover:bg-blue-50 transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>
    </div>
  )
}