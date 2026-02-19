import { useState } from 'react'
import { CheckCircle2, XCircle, Trophy, RotateCcw, Loader2, ChevronDown, ChevronUp } from 'lucide-react'

export default function QuizSection({ quiz, onSubmit, attempt }) {
  const questions = quiz.quiz_questions ?? []
  const [answers, setAnswers] = useState({})  // { [questionId]: selectedAnswer }
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(!!attempt)
  const [expanded, setExpanded] = useState(true)
  const [reviewMode, setReviewMode] = useState(false)

  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.id] !== undefined)

  const handleSelect = (questionId, option) => {
    if (submitted) return
    setAnswers((prev) => ({ ...prev, [questionId]: option }))
  }

  const handleSubmit = async () => {
    if (!allAnswered) return
    setLoading(true)
    await onSubmit(answers)
    setSubmitted(true)
    setReviewMode(true)
    setLoading(false)
  }

  const handleRetake = () => {
    setAnswers({})
    setSubmitted(false)
    setReviewMode(false)
  }

  const currentAttempt = attempt
  const passed = currentAttempt
    ? currentAttempt.score / currentAttempt.total_items >= 0.7
    : false
  const percentage = currentAttempt
    ? Math.round((currentAttempt.score / currentAttempt.total_items) * 100)
    : 0

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header — collapsible */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between px-8 py-5 border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blockly-purple/10 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-blockly-purple" />
          </div>
          <div className="text-left">
            <p className="font-bold text-gray-800">{quiz.title}</p>
            <p className="text-xs text-gray-400 mt-0.5">{questions.length} questions</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {currentAttempt && (
            <span className={`text-sm font-bold px-3 py-1 rounded-full
              ${passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}
            >
              {currentAttempt.score}/{currentAttempt.total_items}
            </span>
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-8 py-6 flex flex-col gap-6">
          {/* Result banner */}
          {currentAttempt && (
            <div className={`rounded-xl p-5 flex items-center gap-4
              ${passed ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-black shrink-0
                ${passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}
              >
                {percentage}%
              </div>
              <div className="flex-1">
                <p className={`font-bold text-lg ${passed ? 'text-green-700' : 'text-red-600'}`}>
                  {passed ? '🎉 Great job!' : 'Not quite there yet'}
                </p>
                <p className={`text-sm mt-0.5 ${passed ? 'text-green-600' : 'text-red-500'}`}>
                  You got {currentAttempt.score} out of {currentAttempt.total_items} correct.
                  {passed ? ' You passed!' : ' You need 70% to pass. Try again!'}
                </p>
              </div>
              {!passed && (
                <button
                  onClick={handleRetake}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white border border-red-200 text-red-500 text-sm font-semibold rounded-lg hover:bg-red-50 transition-colors shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Retake
                </button>
              )}
            </div>
          )}

          {/* Questions */}
          <div className="flex flex-col gap-6">
            {questions
              .sort((a, b) => a.order_index - b.order_index)
              .map((question, qi) => {
                const selected = answers[question.id]
                const isCorrect = selected === question.correct_answer
                const showResult = reviewMode && selected !== undefined

                return (
                  <div key={question.id} className="flex flex-col gap-3">
                    {/* Question */}
                    <div className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-blockly-purple/10 text-blockly-purple text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {qi + 1}
                      </span>
                      <p className="text-sm font-semibold text-gray-800 leading-relaxed">
                        {question.question_text}
                      </p>
                    </div>

                    {/* Options */}
                    <div className="flex flex-col gap-2 pl-9">
                      {(question.options ?? []).map((option, oi) => {
                        const isSelected = selected === option
                        const isCorrectOption = option === question.correct_answer
                        const optionLabel = ['A', 'B', 'C', 'D'][oi]

                        let optionStyle = 'border-gray-200 bg-white text-gray-700 hover:border-blockly-purple/30 hover:bg-blockly-purple/5'

                        if (showResult) {
                          if (isCorrectOption) {
                            optionStyle = 'border-green-300 bg-green-50 text-green-700'
                          } else if (isSelected && !isCorrect) {
                            optionStyle = 'border-red-300 bg-red-50 text-red-600'
                          } else {
                            optionStyle = 'border-gray-100 bg-gray-50 text-gray-400'
                          }
                        } else if (isSelected) {
                          optionStyle = 'border-blockly-purple bg-blockly-purple/10 text-blockly-purple'
                        }

                        return (
                          <button
                            key={oi}
                            onClick={() => handleSelect(question.id, option)}
                            disabled={submitted}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all
                              ${optionStyle} ${submitted ? 'cursor-default' : 'cursor-pointer'}`}
                          >
                            <span className={`w-6 h-6 rounded-full border text-xs font-bold flex items-center justify-center shrink-0
                              ${isSelected && !showResult ? 'border-blockly-purple bg-blockly-purple text-white' : 'border-current'}`}
                            >
                              {optionLabel}
                            </span>
                            <span className="flex-1">{option}</span>
                            {showResult && isCorrectOption && (
                              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                            )}
                            {showResult && isSelected && !isCorrect && (
                              <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
          </div>

          {/* Submit button */}
          {!submitted && (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || loading}
              className="flex items-center justify-center gap-2 w-full py-3 bg-blockly-purple text-white font-semibold rounded-xl hover:bg-blockly-purple/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Trophy className="w-4 h-4" />
                  Submit Quiz ({Object.keys(answers).length}/{questions.length} answered)
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  )
}