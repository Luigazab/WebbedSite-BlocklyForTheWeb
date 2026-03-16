import { useState, useEffect } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { useQuiz } from '../../../hooks/useQuiz'
import { Trophy, CheckCircle, XCircle, Loader2, ChevronDown } from 'lucide-react'

export default function QuizSection({ quiz, onComplete }) {
  const profile = useAuthStore((s) => s.profile)
  const { handleSubmitQuiz, getBestAttempt } = useQuiz()

  const [isOpen,    setIsOpen]    = useState(false)
  const [answers,   setAnswers]   = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [result,    setResult]    = useState(null)
  const [loading,   setLoading]   = useState(false)

  const questions    = quiz.questions || []
  const passingCount = quiz.passing_score ?? null
  const totalCount   = questions.length

  useEffect(() => {
    if (!profile?.id) return
    getBestAttempt(profile.id, quiz.id).then((attempt) => {
      if (attempt) { setResult(attempt); setSubmitted(true) }
    })
  }, [quiz.id, profile?.id])

  const allAnswered = totalCount > 0 && questions.every((q) => answers[q.id] !== undefined)

  const handleAnswerSelect = (questionId, optionIndex) => {
    if (submitted) return
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }))
  }

  const handleSubmit = async () => {
    if (!allAnswered || submitted) return
    setLoading(true)
    try {
      const attempt = await handleSubmitQuiz(quiz.id, answers, questions)
      setResult(attempt)
      setSubmitted(true)
      // Pass badge UP to parent so it can show the popup without being unmounted
      onComplete?.(attempt.passed, attempt.earnedBadge ?? null)
    } finally {
      setLoading(false)
    }
  }

  const handleRetake = () => {
    setAnswers({})
    setSubmitted(false)
    setResult(null)
  }

  const passed = result
    ? result.passed !== undefined
      ? result.passed
      : passingCount === null
        ? true
        : (result.correct ?? Math.round((result.score / 100) * totalCount)) >= passingCount
    : false

  const passLabel = passingCount !== null
    ? `${passingCount}/${totalCount} correct to pass`
    : 'No passing requirement'

  return (
    <div className="p-6">
      {/* Collapse toggle */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 group"
      >
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${passed ? 'bg-green-100' : 'bg-yellow-100'}`}>
            <Trophy className={`w-6 h-6 ${passed ? 'text-green-600' : 'text-yellow-600'}`} />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-gray-900">{quiz.title}</h3>
            <p className="text-xs text-gray-400">
              {totalCount} question{totalCount !== 1 ? 's' : ''} · {passLabel}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {result && (
            <span className={`px-3 py-1.5 rounded-full font-bold text-sm ${passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {result.score}%
            </span>
          )}
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="mt-6 flex flex-col gap-6">
          {/* Score banner */}
          {submitted && result && (
            <div className={`flex items-start gap-4 p-5 rounded-xl ${passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${passed ? 'bg-green-200' : 'bg-red-200'}`}>
                {passed ? <CheckCircle className="w-5 h-5 text-green-700" /> : <XCircle className="w-5 h-5 text-red-700" />}
              </div>
              <div className="flex-1">
                <p className={`font-bold ${passed ? 'text-green-900' : 'text-red-900'}`}>
                  {passed ? 'You passed!' : 'Not quite — keep trying!'}
                </p>
                <p className={`text-sm mt-0.5 ${passed ? 'text-green-700' : 'text-red-700'}`}>
                  Score: {result.score}%
                  {passingCount !== null && <span className="ml-2 opacity-75">(need {passingCount}/{totalCount} correct)</span>}
                </p>
              </div>
              {!passed && (
                <button
                  onClick={handleRetake}
                  className="shrink-0 px-3 py-1.5 border-2 border-red-300 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors"
                >
                  Retake
                </button>
              )}
            </div>
          )}

          {/* Questions */}
          <div className="flex flex-col gap-4">
            {questions.map((question, qIdx) => {
              const selectedIndex = answers[question.id]
              const selectedText  = selectedIndex !== undefined ? question.options[selectedIndex] : undefined
              const isCorrect     = selectedText === question.correct_answer

              return (
                <div key={question.id} className="p-5 border border-gray-200 rounded-xl">
                  <div className="flex gap-3 mb-4">
                    <span className="text-sm font-bold text-gray-400 shrink-0">{qIdx + 1}.</span>
                    <p className="text-sm font-semibold text-gray-800">{question.question_text}</p>
                  </div>
                  <div className="flex flex-col gap-2 ml-6">
                    {question.options.map((option, optIdx) => {
                      const isSelected   = selectedIndex === optIdx
                      const isCorrectOpt = option === question.correct_answer
                      const showCorrect  = submitted && isCorrectOpt
                      const showWrong    = submitted && isSelected && !isCorrect

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleAnswerSelect(question.id, optIdx)}
                          disabled={submitted}
                          className={`flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all
                            ${showCorrect ? 'border-green-500 bg-green-50'
                              : showWrong ? 'border-red-500 bg-red-50'
                              : isSelected ? 'border-blockly-purple bg-blockly-purple/10'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
                            ${submitted ? 'cursor-default' : 'cursor-pointer'}`}
                        >
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            showCorrect ? 'border-green-500 bg-green-500'
                            : showWrong ? 'border-red-500 bg-red-500'
                            : isSelected ? 'border-blockly-purple bg-blockly-purple'
                            : 'border-gray-300'}`}>
                            {showCorrect && <CheckCircle className="w-4 h-4 text-white" />}
                            {showWrong   && <XCircle     className="w-4 h-4 text-white" />}
                          </div>
                          <span className={`text-sm ${showCorrect ? 'text-green-900 font-semibold' : showWrong ? 'text-red-900 font-semibold' : 'text-gray-700'}`}>
                            {option}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Submit */}
          {!submitted && (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || loading}
              className="w-full py-3 bg-blockly-purple text-white rounded-lg text-sm font-semibold hover:bg-blockly-purple/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />Submitting…
                </span>
              ) : 'Submit Quiz'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}