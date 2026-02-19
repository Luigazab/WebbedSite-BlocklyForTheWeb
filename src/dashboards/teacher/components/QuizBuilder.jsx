import { useState } from 'react'
import { Plus, Trash2, GripVertical, HelpCircle, XCircle, CheckCircle2 } from 'lucide-react'

const OPTION_LABELS = ['A', 'B', 'C', 'D']

const emptyQuestion = () => ({
  _id: crypto.randomUUID(),   // local-only key for list rendering
  question_text: '',
  options: ['', '', '', ''],
  correct_answer: '',
})

export default function QuizBuilder({ quiz, onChange, onDisable }) {
  const setTitle = (title) => onChange({ ...quiz, title })
  const setQuestions = (questions) => onChange({ ...quiz, questions })

  const addQuestion = () => {
    setQuestions([...quiz.questions, emptyQuestion()])
  }

  const removeQuestion = (index) => {
    setQuestions(quiz.questions.filter((_, i) => i !== index))
  }

  const updateQuestion = (index, updates) => {
    setQuestions(quiz.questions.map((q, i) => (i === index ? { ...q, ...updates } : q)))
  }

  const updateOption = (qIndex, oIndex, value) => {
    const options = [...quiz.questions[qIndex].options]
    const oldOption = options[oIndex]
    options[oIndex] = value

    // If this was the correct answer, update it too
    const correct = quiz.questions[qIndex].correct_answer
    updateQuestion(qIndex, {
      options,
      correct_answer: correct === oldOption ? value : correct,
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blockly-purple" />
          <h2 className="font-bold text-gray-800">Quiz Builder</h2>
        </div>
        <button
          onClick={onDisable}
          className="text-xs text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1"
        >
          <XCircle className="w-4 h-4" />
          Remove quiz
        </button>
      </div>

      <div className="px-6 py-5 flex flex-col gap-6">
        {/* Quiz title */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">Quiz Title</label>
          <input
            type="text"
            value={quiz.title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. HTML Basics Quiz"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blockly-purple focus:ring-2 focus:ring-blockly-purple/10 transition"
          />
        </div>

        {/* Questions */}
        {quiz.questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3 border-2 border-dashed border-gray-200 rounded-xl">
            <HelpCircle className="w-8 h-8 text-gray-200" />
            <p className="text-sm text-gray-400">No questions yet. Add your first question below.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {quiz.questions.map((question, qi) => (
              <QuestionBlock
                key={question._id ?? question.id ?? qi}
                question={question}
                index={qi}
                onUpdate={(updates) => updateQuestion(qi, updates)}
                onUpdateOption={(oi, val) => updateOption(qi, oi, val)}
                onRemove={() => removeQuestion(qi)}
              />
            ))}
          </div>
        )}

        {/* Add question */}
        <button
          onClick={addQuestion}
          className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-blockly-purple/30 text-blockly-purple text-sm font-semibold rounded-xl hover:border-blockly-purple hover:bg-blockly-purple/5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Question
        </button>
      </div>
    </div>
  )
}

function QuestionBlock({ question, index, onUpdate, onUpdateOption, onRemove }) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Question header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200">
        <GripVertical className="w-4 h-4 text-gray-300" />
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Question {index + 1}
        </span>
        <div className="ml-auto">
          <button
            onClick={onRemove}
            className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {/* Question text */}
        <textarea
          value={question.question_text}
          onChange={(e) => onUpdate({ question_text: e.target.value })}
          placeholder="Write your question here..."
          rows={2}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blockly-purple focus:ring-2 focus:ring-blockly-purple/10 transition resize-none"
        />

        {/* Options */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Options — click ✓ to mark correct answer
          </p>
          {question.options.map((option, oi) => {
            const isCorrect = option !== '' && option === question.correct_answer

            return (
              <div key={oi} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onUpdate({ correct_answer: option })}
                  disabled={!option.trim()}
                  title="Mark as correct answer"
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                    ${isCorrect
                      ? 'border-green-400 bg-green-400 text-white'
                      : 'border-gray-300 text-gray-300 hover:border-green-400 hover:text-green-400'
                    } disabled:opacity-30 disabled:cursor-not-allowed`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2 flex-1">
                  <span className={`text-xs font-bold w-5 shrink-0
                    ${isCorrect ? 'text-green-500' : 'text-gray-400'}`}
                  >
                    {OPTION_LABELS[oi]}
                  </span>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => onUpdateOption(oi, e.target.value)}
                    placeholder={`Option ${OPTION_LABELS[oi]}`}
                    className={`flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none transition
                      ${isCorrect
                        ? 'border-green-300 bg-green-50 focus:border-green-400 focus:ring-2 focus:ring-green-200'
                        : 'border-gray-200 focus:border-blockly-purple focus:ring-2 focus:ring-blockly-purple/10'
                      }`}
                  />
                </div>
              </div>
            )
          })}

          {/* Correct answer indicator */}
          {question.correct_answer ? (
            <p className="text-xs text-green-600 font-medium flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Correct answer set: "{question.correct_answer}"
            </p>
          ) : (
            <p className="text-xs text-orange-400 font-medium mt-1">
              ⚠ No correct answer selected yet
            </p>
          )}
        </div>
      </div>
    </div>
  )
}