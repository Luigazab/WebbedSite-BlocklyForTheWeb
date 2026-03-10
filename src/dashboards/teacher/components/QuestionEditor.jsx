import { ArrowDown, ArrowUp, MessageCircleWarningIcon, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

export default function QuestionEditor({ index, question, onChange, onRemove, onMoveUp, onMoveDown, isFirst, isLast }) {
  const [collapsed, setCollapsed] = useState(false)

  const updateField = (field, value) => {
    onChange({ ...question, [field]: value })
  }

  const updateOption = (i, value) => {
    const opts = [...question.options]
    const wasCorrect = question.correct_answer === question.options[i]
    opts[i] = value
    onChange({
      ...question,
      options: opts,
      correct_answer: wasCorrect ? value : question.correct_answer,
    })
  }

  const addOption = () => {
    if (question.options.length >= 6) return
    onChange({ ...question, options: [...question.options, ''] })
  }

  const removeOption = (i) => {
    if (question.options.length <= 2) return
    const opts = question.options.filter((_, idx) => idx !== i)
    onChange({
      ...question,
      options: opts,
      correct_answer: question.correct_answer === question.options[i] ? '' : question.correct_answer,
    })
  }

  const isValid =
    question.question_text.trim() &&
    question.options.every((o) => o.trim()) &&
    question.correct_answer &&
    question.options.includes(question.correct_answer)

  return (
    <div className={`shadow border rounded-2xl transition-all ${
      isValid ? 'border-slate-200' : 'border-blockly-yellow'
    } bg-white overflow-hidden`}>
      {/* Question header */}
      <div
        className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setCollapsed((v) => !v)}
      >
        <span className="w-7 h-7 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-black flex-shrink-0">
          {index + 1}
        </span>
        <p className="flex-1 text-sm font-semibold text-slate-700 truncate">
          {question.question_text || <span className="text-slate-400 font-normal">Untitled question</span>}
        </p>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst}
            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded"
            title="Move up"
          >
            <ArrowUp size={16} />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast}
            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded"
            title="Move down"
          >
            <ArrowDown size={16} />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="p-1 text-red-400 hover:text-red-600 rounded"
            title="Remove question"
          >
            <Trash2 size={16} />
          </button>
          <span className="text-slate-300 ml-1">{collapsed ? '▸' : '▾'}</span>
        </div>
      </div>

      {/* Collapsible body */}
      {!collapsed && (
        <div className="px-5 pb-5 pt-1 border-t border-slate-100 space-y-4">
          {/* Question text */}
          <div>
            <label className="text-md font-semibold text-slate-600 mb-1">Question</label>
            <textarea
              rows={2}
              value={question.question_text}
              onChange={(e) => updateField('question_text', e.target.value)}
              placeholder="Enter the question…"
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
          </div>

          {/* Options */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-md font-semibold text-slate-600">Answer Choices</label>
              <span className="text-xs text-slate-400">Click the circle to mark the correct answer</span>
            </div>
            <div className="space-y-2">
              {question.options.map((opt, i) => {
                const isCorrect = question.correct_answer === opt && opt.trim()
                return (
                  <div key={i} className="flex items-center gap-2">
                    {/* Correct answer selector */}
                    <button
                      type="button"
                      onClick={() => updateField('correct_answer', opt)}
                      disabled={!opt.trim()}
                      className={`shrink-0 w-5 h-5 rounded-full border-2 transition-all ${
                        isCorrect
                          ? 'bg-emerald-500 border-emerald-500'
                          : 'border-slate-300 hover:border-emerald-400'
                      } disabled:opacity-30`}
                      title="Mark as correct answer"
                    >
                      {isCorrect && (
                        <span className="text-white text-xs flex items-center justify-center w-full h-full leading-none">✓</span>
                      )}
                    </button>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => updateOption(i, e.target.value)}
                      placeholder={`Option ${i + 1}`}
                      className={`flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blockly-blue transition-all ${
                        isCorrect
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 bg-white'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => removeOption(i)}
                      disabled={question.options.length <= 2}
                      className="text-slate-300 hover:text-red-400 disabled:opacity-20 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                )
              })}
            </div>

            {question.options.length < 6 && (
              <button
                type="button"
                onClick={addOption}
                className="mt-2 flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 px-3 py-1.5 border border-dashed border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                <Plus size={16} /> Add option
              </button>
            )}
          </div>

          {/* Validation hint */}
          {!isValid && (
            <p className="flex gap-2 text-sm font-bold items-center text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
              <MessageCircleWarningIcon size={16} /> Fill in the question, all options, and select a correct answer.
            </p>
          )}
        </div>
      )}
    </div>
  )
}