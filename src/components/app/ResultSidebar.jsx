import { CheckCircle, XCircle, ChevronDown } from "lucide-react"
import { useRef, useState } from "react"

const ResultSidebar = ({ totalQuestions, questions = [], answers = [], currentQuestion, onSelectQuestion, onShowOverview, variant = "desktop", allAttempts = [], activeAttemptIdx = 0, onSelectAttempt,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const questionStates = questions.map((question, index) => {
    const answer = answers.find(
      (a) => a.questionId === question.id
    )

    return {
      number: index + 1,
      isCorrect: answer?.isCorrect || false,
    }
  })

  const correctCount = answers.filter((a) => a.isCorrect).length
  const percentage =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0

  const totalAttempts = allAttempts.length

  const formatAttemptDate = (dateStr) => {
    if (!dateStr) return ""
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Header: "Attempt X of Y" + dropdown ─────────────────────── */}
      <div className="flex items-center justify-between mb-4 gap-2">
        <p className="text-slate-700 text-xl font-bold shrink-0">
          Attempt{" "}
          <span className="text-violet-600">
            {totalAttempts > 0 ? activeAttemptIdx + 1 : "—"}
          </span>
          {totalAttempts > 0 && (
            <span className="text-slate-400 text-base font-semibold">
              {" "}/ {totalAttempts}
            </span>
          )}
        </p>

        {/* Dropdown — only show if there are multiple attempts */}
        {totalAttempts > 1 && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-1.5 bg-white border border-slate-300 text-slate-700 rounded-xl py-1.5 pl-3 pr-2.5 font-semibold text-sm shadow-sm hover:border-violet-400 transition-colors"
            >
              View
              <ChevronDown
                size={16}
                className={`text-slate-400 transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Your Attempts
                  </p>
                </div>
                <div className="max-h-56 overflow-y-auto py-1">
                  {allAttempts.map((attempt, idx) => {
                    const pct =
                      totalQuestions > 0
                        ? Math.round((attempt.score / totalQuestions) * 100)
                        : 0
                    const isPerfect = attempt.score === totalQuestions
                    const isCurrent = idx === activeAttemptIdx

                    return (
                      <button
                        key={attempt.id}
                        onClick={() => {
                          onSelectAttempt?.(idx)
                          setDropdownOpen(false)
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors
                          ${
                            isCurrent
                              ? "bg-violet-50 text-violet-700 font-bold"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                      >
                        <span className="font-semibold">
                          Attempt {idx + 1}
                          {isPerfect && (
                            <span className="ml-1.5 text-[10px] font-bold bg-yellow-100 text-yellow-600 px-1.5 py-0.5 rounded-full">
                              Perfect
                            </span>
                          )}
                        </span>
                        <span className="flex flex-col items-end">
                          <span
                            className={`font-bold ${
                              pct === 100
                                ? "text-emerald-600"
                                : pct >= 70
                                ? "text-violet-600"
                                : "text-red-500"
                            }`}
                          >
                            {pct}%
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatAttemptDate(attempt.started_at)}
                          </span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Score summary card ───────────────────────────────────────── */}
      <div
        onClick={onShowOverview}
        className={`bg-white rounded-2xl shadow mb-4 border-2 cursor-pointer flex flex-col items-center text-center transition-all
          ${
            currentQuestion === null
              ? "border-violet-500"
              : "border-transparent hover:border-violet-300"
          }
          ${variant === "desktop" ? "p-5" : "p-4"}`}
      >
        <p className="text-5xl font-extrabold text-violet-500">{percentage}%</p>
        <p className="text-slate-500 font-bold text-sm mt-1">
          {correctCount} / {totalQuestions} correct
        </p>
      </div>

      {/* ── Per-question rows ────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2">
        {questionStates.map((q) => (
          <div
            key={q.number}
            onClick={() => onSelectQuestion(q.number)}
            className={`flex items-center gap-3 rounded-2xl shadow cursor-pointer transition-all
              ${variant === "desktop" ? "p-4" : "p-3"}
              ${
                q.number === currentQuestion
                  ? "bg-white border-2 border-sky-500"
                  : "bg-white border-2 border-transparent hover:bg-slate-100"
              }`}
          >
            {q.isCorrect ? (
              <CheckCircle
                fill="#22c55e"
                color="white"
                size={variant === "desktop" ? 28 : 24}
              />
            ) : (
              <XCircle
                fill="#ef4444"
                color="white"
                size={variant === "desktop" ? 28 : 24}
              />
            )}
            <p className="text-slate-700 font-bold">Question {q.number}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ResultSidebar