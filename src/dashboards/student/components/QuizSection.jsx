import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { useQuiz } from '../../../hooks/useQuiz'
import { Trophy, CheckCircle, XCircle, Loader2, ChevronDown, Award, X } from 'lucide-react'

// ─── Confetti ──────────────────────────────────────────────────────────────────
// Pure CSS confetti — no external package needed.

const CONFETTI_COLORS = [
  '#7c3aed', '#a78bfa', '#fbbf24', '#34d399',
  '#60a5fa', '#f472b6', '#fb923c', '#4ade80',
]

function Confetti() {
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 1.2}s`,
    duration: `${1.8 + Math.random() * 1.4}s`,
    size: `${6 + Math.random() * 8}px`,
    rotation: `${Math.random() * 360}deg`,
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-[10001] overflow-hidden">
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) rotate(0deg) scale(1); opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg) scale(0.6); opacity: 0; }
        }
      `}</style>
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            top: '-10px',
            left: p.left,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animation: `confettiFall ${p.duration} ${p.delay} ease-in forwards`,
            transform: `rotate(${p.rotation})`,
          }}
        />
      ))}
    </div>
  )
}

// ─── Badge popup ──────────────────────────────────────────────────────────────

function BadgePopup({ badge, onClose }) {
  return (
    <>
      <Confetti />
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000]"
        onClick={onClose}
      />
      {/* Card */}
      <div className="fixed inset-0 flex items-center justify-center z-[10000] pointer-events-none p-6">
        <div
          className="pointer-events-auto bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center gap-5 max-w-xs w-full text-center
                     animate-[popIn_0.4s_cubic-bezier(0.34,1.56,0.64,1)_forwards]"
        >
          <style>{`
            @keyframes popIn {
              from { transform: scale(0.5); opacity: 0; }
              to   { transform: scale(1);   opacity: 1; }
            }
            @keyframes badgeFloat {
              0%, 100% { transform: translateY(0px) rotate(-3deg); }
              50%       { transform: translateY(-8px) rotate(3deg); }
            }
          `}</style>

          {/* Badge icon */}
          <div
            className="w-28 h-28 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-400
                       flex items-center justify-center shadow-lg shadow-yellow-300/50"
            style={{ animation: 'badgeFloat 2.5s ease-in-out infinite' }}
          >
            {badge.icon_url ? (
              <img
                src={badge.icon_url}
                alt={badge.title}
                className="w-20 h-20 object-contain drop-shadow-md"
              />
            ) : (
              <Award className="w-14 h-14 text-yellow-700" />
            )}
          </div>

          {/* Text */}
          <div className="flex flex-col items-center gap-1.5">
            <p className="text-xs font-bold text-yellow-600 uppercase tracking-widest">
              Badge Earned!
            </p>
            <h2 className="text-xl font-black text-gray-900">{badge.title}</h2>
            {badge.description && (
              <p className="text-sm text-gray-500 leading-relaxed">{badge.description}</p>
            )}
          </div>

          <button
            onClick={onClose}
            className="mt-1 px-8 py-2.5 bg-blockly-purple text-white text-sm font-bold rounded-xl
                       hover:bg-blockly-purple/90 transition-colors shadow-md shadow-blockly-purple/30"
          >
            Awesome!
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Main QuizSection ─────────────────────────────────────────────────────────

export default function QuizSection({ quiz, onComplete }) {
  const profile = useAuthStore((s) => s.profile)
  const { handleSubmitQuiz, getBestAttempt } = useQuiz()

  const [isOpen,      setIsOpen]      = useState(false)
  const [answers,     setAnswers]     = useState({})   // { [questionId]: optionIndex }
  const [submitted,   setSubmitted]   = useState(false)
  const [result,      setResult]      = useState(null)
  const [loading,     setLoading]     = useState(false)
  const [showBadge,   setShowBadge]   = useState(false)
  const [earnedBadge, setEarnedBadge] = useState(null)

  const questions    = quiz.questions || []
  const passingCount = quiz.passing_score ?? null   // raw count, e.g. 7
  const totalCount   = questions.length

  // Load best previous attempt
  useEffect(() => {
    if (!profile?.id) return
    getBestAttempt(profile.id, quiz.id).then((attempt) => {
      if (attempt) {
        setResult(attempt)
        setSubmitted(true)
      }
    })
  }, [quiz.id, profile?.id])

  const allAnswered = totalCount > 0 &&
    questions.every((q) => answers[q.id] !== undefined)

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

      if (attempt.passed) {
        if (attempt.earnedBadge) {
          setEarnedBadge(attempt.earnedBadge)
          setShowBadge(true)
        }
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

  const passed = result
    ? (result.passed !== undefined
        ? result.passed
        : passingCount === null
          ? true
          : (result.correct ?? Math.round((result.score / 100) * totalCount)) >= passingCount)
    : false

  const passLabel = passingCount !== null
    ? `Pass: ${passingCount}/${totalCount} correct`
    : 'No passing requirement'

  return (
    <>
      {/* Badge popup */}
      {showBadge && earnedBadge && (
        <BadgePopup
          badge={earnedBadge}
          onClose={() => setShowBadge(false)}
        />
      )}

      <div className="p-6">

        {/* ── Collapse toggle ──────────────────────────────── */}
        <button
          onClick={() => setIsOpen((v) => !v)}
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
                {totalCount} question{totalCount !== 1 ? 's' : ''} · {passLabel}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {result && (
              <span className={`px-3 py-1.5 rounded-full font-bold text-sm ${
                passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {result.score}%
              </span>
            )}
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {/* ── Expanded body ────────────────────────────────── */}
        {isOpen && (
          <div className="mt-6 flex flex-col gap-6">

            {/* Score banner */}
            {submitted && result && (
              <div className={`flex items-start gap-4 p-5 rounded-xl ${
                passed
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  passed ? 'bg-green-200' : 'bg-red-200'
                }`}>
                  {passed
                    ? <CheckCircle className="w-5 h-5 text-green-700" />
                    : <XCircle    className="w-5 h-5 text-red-700"   />}
                </div>
                <div className="flex-1">
                  <p className={`font-bold ${passed ? 'text-green-900' : 'text-red-900'}`}>
                    {passed ? 'You passed!' : 'Not quite — keep trying!'}
                  </p>
                  <p className={`text-sm mt-0.5 ${passed ? 'text-green-700' : 'text-red-700'}`}>
                    Score: {result.score}%
                    {passingCount !== null && (
                      <span className="ml-2 opacity-75">
                        (need {passingCount}/{totalCount} correct)
                      </span>
                    )}
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
                const selectedText  = selectedIndex !== undefined
                  ? question.options[selectedIndex]
                  : undefined
                const isCorrect = selectedText === question.correct_answer

                return (
                  <div key={question.id} className="p-5 border border-gray-200 rounded-xl">
                    <div className="flex gap-3 mb-4">
                      <span className="text-sm font-bold text-gray-400 shrink-0">{qIdx + 1}.</span>
                      <p className="text-sm font-semibold text-gray-800">{question.question_text}</p>
                    </div>

                    <div className="flex flex-col gap-2 ml-6">
                      {question.options.map((option, optIdx) => {
                        const isSelected   = selectedIndex === optIdx
                        const isCorrectOpt = option === question.correct_answer  // text comparison
                        const showCorrect  = submitted && isCorrectOpt
                        const showWrong    = submitted && isSelected && !isCorrect

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleAnswerSelect(question.id, optIdx)}
                            disabled={submitted}
                            className={`flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all
                              ${showCorrect
                                ? 'border-green-500 bg-green-50'
                                : showWrong
                                ? 'border-red-500 bg-red-50'
                                : isSelected
                                ? 'border-blockly-purple bg-blockly-purple/10'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }
                              ${submitted ? 'cursor-default' : 'cursor-pointer'}`}
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
                              {showWrong   && <XCircle     className="w-4 h-4 text-white" />}
                            </div>

                            <span className={`text-sm ${
                              showCorrect ? 'text-green-900 font-semibold'
                              : showWrong ? 'text-red-900 font-semibold'
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

            {/* Submit */}
            {!submitted && (
              <button
                onClick={handleSubmit}
                disabled={!allAnswered || loading}
                className="w-full py-3 bg-blockly-purple text-white rounded-lg text-sm font-semibold
                           hover:bg-blockly-purple/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting…
                  </span>
                ) : 'Submit Quiz'}
              </button>
            )}

          </div>
        )}
      </div>
    </>
  )
}