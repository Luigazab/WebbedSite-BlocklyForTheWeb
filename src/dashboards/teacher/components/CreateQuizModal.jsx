import { useState } from 'react'
import { useQuiz } from '../../../hooks/useQuiz'
import { X, Loader2 } from 'lucide-react'

export default function CreateQuizModal({ onClose, onSuccess }) {
  const { handleCreateQuiz } = useQuiz()
  const [form, setForm] = useState({
    title: '',
    description: '',
    time_limit: null,
    passing_score: 70,
  })
  const [creating, setCreating] = useState(false)

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return

    setCreating(true)
    try {
      const quiz = await handleCreateQuiz(form)
      onSuccess(quiz)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Create New Quiz</h2>
          <button
            onClick={onClose}
            disabled={creating}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Quiz Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              placeholder="e.g., HTML Basics Quiz"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blockly-purple focus:ring-2 focus:ring-blockly-purple/10 transition"
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Description <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              placeholder="Brief description of what this quiz covers..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blockly-purple focus:ring-2 focus:ring-blockly-purple/10 transition resize-none"
            />
          </div>

          {/* Time Limit */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Time Limit (minutes) <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <input
              type="number"
              value={form.time_limit || ''}
              onChange={(e) => setField('time_limit', e.target.value ? parseInt(e.target.value) : null)}
              placeholder="Leave empty for no time limit"
              min="1"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blockly-purple focus:ring-2 focus:ring-blockly-purple/10 transition"
            />
            <p className="text-xs text-gray-400">
              Students must complete the quiz within this time
            </p>
          </div>

          {/* Passing Score */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Passing Score (%)
            </label>
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
              <span className="text-sm font-bold text-blockly-purple w-12 text-right">
                {form.passing_score}%
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Students need this score or higher to pass
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={creating}
              className="btn flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating || !form.title.trim()}
              className="btn flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blockly-purple text-white text-sm font-semibold rounded-lg hover:bg-blockly-purple/90 disabled:opacity-50 transition-colors"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Quiz'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}