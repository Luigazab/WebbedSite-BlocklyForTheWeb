import { useState, useEffect } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { useQuiz } from '../../../hooks/useQuiz'
import { ChevronDown, Trophy, CheckCircle, XCircle, Loader2, Clock } from 'lucide-react'

export default function QuizSection({ quiz, onComplete }) {
  const profile = useAuthStore((s) => s.profile)
  const { handleSubmitQuiz, getBestAttempt } = useQuiz()

  const [isOpen, setIsOpen] = useState(false)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [bestAttempt, setBestAttempt] = useState(null)

  useEffect(() => {
    loadBestAttempt()
  }, [quiz.id, profile?.id])

  const loadBestAttempt = async () => {
    if (!profile?.id) return
    const attempt = await getBestAttempt(profile.id, quiz.id)
    if (attempt) {
      setBestAttempt(attempt)
      setResult(attempt)
      setSubmitted(true)
    }
  }

  const questions = quiz.questions || []
  const allAnswered = questions.every((q) => answers[q.id] !== undefined)
  const passingScore = quiz.passing_score || 70

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

      // Notify parent if quiz is passed
      if (attempt.score >= passingScore) {
        onComplete?.(true)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRetake = () => {
    setAnswers({})
    setSubmitted(false)
    setResult(null)
  }

  const passed = result && result.score >= passingScore

  return (
    <div className="p-6">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-4 group"
      >
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            passed ? 'bg-green-100' : 'bg-yellow-100'
          }`}>
            <Trophy className={`w-6 h-6 ${passed ? 'text-green-600' : 'text-yellow-600'}`} />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-gray-900">{quiz.title}</h3>
            <p className="text-xs text-gray-400">
              {questions.length} question{questions.length !== 1 ? 's' : ''} · 
              Passing: {passingScore}%
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {result && (
            <div className={`px-4 py-2 rounded-full font-bold text-sm ${
              passed
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {result.score}%
            </div>
          )}
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`} />
        </div>
      </button>

      {/* Quiz Content */}
      {isOpen && (
        <div className="mt-6 flex flex-col gap-6">
          {/* Result Banner */}
          {result && (
            <div className={`p-6 rounded-xl border-2 ${
              passed
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  passed ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {passed ? (
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-bold text-lg ${
                    passed ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {passed ? 'Congratulations! You passed!' : 'Keep trying!'}
                  </p>
                  <p className={`text-sm ${
                    passed ? 'text-green-700' : 'text-red-700'
                  }`}>
                    You scored {result.score}% ({result.score >= passingScore ? 'Pass' : 'Fail'})
                  </p>
                </div>
                {!passed && (
                  <button
                    onClick={handleRetake}
                    className="btn px-4 py-2 bg-white border-2 border-red-200 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors"
                  >
                    Retake Quiz
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Questions */}
          <div className="flex flex-col gap-4">
            {questions.map((question, qIndex) => {
              const selectedAnswer = answers[question.id]
              const isCorrect = selectedAnswer === question.correct_answer
              const showResult = submitted

              return (
                <div
                  key={question.id}
                  className="p-5 border border-gray-200 rounded-xl"
                >
                  {/* Question */}
                  <div className="flex gap-3 mb-4">
                    <span className="text-sm font-bold text-gray-400 shrink-0">
                      {qIndex + 1}.
                    </span>
                    <p className="text-sm font-semibold text-gray-800">
                      {question.question_text}
                    </p>
                  </div>

                  {/* Options */}
                  <div className="flex flex-col gap-2 ml-6">
                    {question.options.map((option, optIndex) => {
                      const isSelected = selectedAnswer === optIndex
                      const isCorrectAnswer = optIndex === question.correct_answer
                      const showCorrect = showResult && isCorrectAnswer
                      const showWrong = showResult && isSelected && !isCorrect

                      return (
                        <button
                          key={optIndex}
                          onClick={() => handleAnswerSelect(question.id, optIndex)}
                          disabled={submitted}
                          className={`flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                            showCorrect
                              ? 'border-green-500 bg-green-50'
                              : showWrong
                              ? 'border-red-500 bg-red-50'
                              : isSelected
                              ? 'border-blockly-purple bg-blockly-purple/10'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          } ${submitted ? 'cursor-default' : 'cursor-pointer'}`}
                        >
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            showCorrect
                              ? 'border-green-500 bg-green-500'
                              : showWrong
                              ? 'border-red-500 bg-red-500'
                              : isSelected
                              ? 'border-blockly-purple bg-blockly-purple'
                              : 'border-gray-300'
                          }`}>
                            {showCorrect && <CheckCircle className="w-4 h-4 text-white" />}
                            {showWrong && <XCircle className="w-4 h-4 text-white" />}
                          </div>
                          <span className={`text-sm ${
                            showCorrect
                              ? 'text-green-900 font-semibold'
                              : showWrong
                              ? 'text-red-900 font-semibold'
                              : 'text-gray-700'
                          }`}>
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

          {/* Submit Button */}
          {!submitted && (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || loading}
              className="btn w-full py-3 bg-blockly-purple text-white rounded-lg text-sm font-semibold hover:bg-blockly-purple/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </span>
              ) : (
                'Submit Quiz'
              )}
            </button>
          )}
        </div>
      )}
    </div>
  )
}