import { useState, useEffect } from 'react'
import { X, Check } from 'lucide-react'

export default function QuestionEditor({ quizId, question, onClose, onSave }) {
  const [form, setForm] = useState({
    question_text: '',
    options: ['', '', '', ''],
    correct_answer: 0,
    order_index: 0,
  })

  useEffect(() => {
    if (question) {
      setForm({
        question_text: question.question_text || '',
        options: question.options || ['', '', '', ''],
        correct_answer: question.correct_answer || 0,
        order_index: question.order_index || 0,
      })
    }
  }, [question])

  const setOption = (index, value) => {
    const newOptions = [...form.options]
    newOptions[index] = value
    setForm((prev) => ({ ...prev, options: newOptions }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.question_text.trim()) {
      alert('Question text is required')
      return
    }
    if (form.options.some((opt) => !opt.trim())) {
      alert('All options must be filled')
      return
    }
    onSave(form)
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-bold text-gray-800">
            {question ? 'Edit Question' : 'Add Question'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {/* Question Text */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Question <span className="text-red-400">*</span>
            </label>
            <textarea
              value={form.question_text}
              onChange={(e) => setForm((prev) => ({ ...prev, question_text: e.target.value }))}
              placeholder="Enter your question here..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blockly-purple focus:ring-2 focus:ring-blockly-purple/10 transition resize-none"
              required
            />
          </div>

          {/* Options */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-gray-700">
              Answer Options <span className="text-red-400">*</span>
            </label>
            <p className="text-xs text-gray-400 -mt-2">
              Click the checkmark to mark the correct answer
            </p>

            <div className="grid grid-cols-1 gap-3">
              {['A', 'B', 'C', 'D'].map((label, index) => (
                <div key={index} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, correct_answer: index }))}
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      form.correct_answer === index
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                    }`}
                    title="Mark as correct"
                  >
                    <Check className="w-4 h-4" />
                  </button>

                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-600 w-6">{label}.</span>
                    <input
                      type="text"
                      value={form.options[index]}
                      onChange={(e) => setOption(index, e.target.value)}
                      placeholder={`Option ${label}`}
                      className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blockly-purple focus:ring-2 focus:ring-blockly-purple/10 transition"
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="btn flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="btn flex-1 px-4 py-2.5 bg-blockly-purple text-white text-sm font-semibold rounded-lg hover:bg-blockly-purple/90 transition-colors"
          >
            {question ? 'Update' : 'Add'} Question
          </button>
        </div>
      </div>
    </div>
  )
}