import { ArrowLeft, CalendarDays, Clock, NotepadText, List } from 'lucide-react'
import { useEffect, useState } from 'react'
import ResultSidebar from '../../components/app/ResultSidebar'

const normaliseAnswer = (a) => ({
  questionId:       a.questionId       ?? a.question_id,
  selectedOptionId: a.selectedOptionId ?? a.options_id,
  isCorrect:        a.isCorrect        ?? a.is_correct ?? false,
})


const QuizResult = ({
  lesson,
  result,
  onRetake,
  onFinish,
  allAttempts = [],
  activeAttemptIdx = 0,
  onSelectAttempt,
}) => {
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)

  const { score, total, timeTaken, answers: rawAnswers = [] } = result
  const answers = rawAnswers.map(normaliseAnswer)
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0
  const questions = lesson.quiz?.questions || []

  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setTimeout(() => setProgress(percentage), 200);
  }, [percentage]);

  const radius = 70; // px
  const circumference = 2 * Math.PI * radius;

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0')
    const s = String(seconds % 60).padStart(2, '0')
    return `${m}:${s}`
  }

  

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    })

  const reviewQuestion =
    selectedQuestion !== null ? questions[selectedQuestion - 1] : null
  const reviewAnswer = reviewQuestion
    ? answers.find((a) => a.questionId === reviewQuestion.id)
    : null

  const totalAttempts = allAttempts.length
  const attemptNumber = totalAttempts > 0 ? activeAttemptIdx + 1 : 1

  return (
    <div className="h-[93vh] w-full bg-slate-50 relative overflow-hidden flex">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(229,231,235,0.8) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(229,231,235,0.8) 1px, transparent 1px),
            radial-gradient(circle 500px at 20% 80%, rgba(139,92,246,0.3), transparent),
            radial-gradient(circle 500px at 80% 20%, rgba(59,130,246,0.3), transparent)
          `,
          backgroundSize: '48px 48px, 48px 48px, 100% 100%, 100% 100%',
        }}
      />

      <div className="z-10 flex flex-col justify-center items-center h-full w-full overflow-y-auto">
        {selectedQuestion === null ? (
          // ── Overview ──────────────────────────────────────────────────────
          <div className="space-y-4 p-4 max-w-2xl flex flex-col justify-center w-full h-full">
            <div className="relative bg-white shadow mx-auto rounded-4xl space-y-4 border border-slate-200 w-full flex flex-col items-center">
              {/* Back / finish button */}
              <div className="absolute left-6 top-6">
                <button
                  onClick={onFinish}
                  className="bg-slate-200/70 hover:bg-slate-300 p-2 rounded-lg transition-colors"
                >
                  <ArrowLeft size={25} />
                </button>
              </div>

              <div className="p-6 space-y-4 flex flex-col items-center w-full">
                {/* Attempt label */}
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Attempt {attemptNumber}
                  {totalAttempts > 1 && (
                    <span className="text-slate-300"> of {totalAttempts}</span>
                  )}
                </p>

                {/* Score ring */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative w-40 h-40">
                    <svg className="w-full h-full -rotate-90">
                      {/* Background ring */}
                      <circle
                        cx="50%"
                        cy="50%"
                        r={radius}
                        stroke="#e5e7eb"
                        strokeWidth="8"
                        fill="none"
                      />
                      {/* Animated progress ring */}
                      <circle
                        cx="50%"
                        cy="50%"
                        r={radius}
                        stroke="#8b5cf6" // violet-500
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference - (progress / 100) * circumference}
                        strokeLinecap="round"
                        className="transition-all! duration-1000! ease-out!"
                      />
                    </svg>

                    {/* Centered score text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="font-bold text-slate-400 text-2xl">
                        <span className="text-6xl text-violet-500">{score}</span>/{total}
                      </p>
                      <p className="text-center font-bold text-orange-500">Your score</p>
                    </div>
                  </div>
                </div>

                <h1 className="text-xl font-bold text-slate-500 text-center">
                  Well done, you have completed the quiz! Here's how you did.
                </h1>
                <p className="bg-yellow-100 leading-tight rounded-full px-5 py-2 text-sm text-yellow-600 font-semibold">
                  You answered {score} out of {total} questions correctly!
                </p>

                {/* Stats grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full pt-2">
                  <div className="flex flex-col items-center rounded-2xl p-5 shadow border border-violet-200">
                    <span className="rounded-full bg-white border border-violet-300 shadow p-3 mb-2">
                      <NotepadText size={26} className="text-violet-500" />
                    </span>
                    <p className="text-sm font-semibold text-slate-400">Score</p>
                    <p className="text-3xl font-bold text-violet-600">{percentage}%</p>
                  </div>
                  <div className="flex flex-col items-center rounded-2xl p-5 shadow border border-emerald-200">
                    <span className="rounded-full bg-white border border-emerald-300 shadow p-3 mb-2">
                      <Clock size={26} className="text-emerald-500" />
                    </span>
                    <p className="text-sm font-semibold text-slate-400">Time Taken</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {timeTaken != null ? formatTime(timeTaken) : '—'}
                    </p>
                  </div>
                  <div className="flex flex-col items-center rounded-2xl p-5 shadow border border-orange-200">
                    <span className="rounded-full bg-white border border-orange-300 shadow p-3 mb-2">
                      <CalendarDays size={26} className="text-orange-500" />
                    </span>
                    <p className="text-sm font-semibold text-slate-400">Date Taken</p>
                    <p className="text-xl font-bold text-orange-600">{result.startedAt ? formatDate(result.startedAt) : "—"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-between gap-6 mx-2">
              <button
                onClick={onRetake}
                className="btn bg-slate-300 text-white py-4 px-6 font-bold flex-1 rounded-2xl hover:bg-slate-400 transition-colors"
              >
                Retake
              </button>
              <button
                onClick={onFinish}
                className="btn bg-emerald-400 text-white py-4 px-6 font-bold flex-1 rounded-2xl hover:bg-emerald-500 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        ) : (
          // ── Question review ───────────────────────────────────────────────
          <div className="space-y-6 p-8 flex flex-col h-full max-w-4xl w-full">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setSelectedQuestion(null)}
                className="bg-slate-200/70 hover:bg-slate-300 p-2 rounded-lg transition-colors"
              >
                <ArrowLeft size={25} />
              </button>
              <p className="font-extrabold text-2xl text-slate-700">
                {String(selectedQuestion).padStart(2, '0')} of {String(total).padStart(2, '0')}
              </p>
            </div>

            <div className="bg-white shadow p-8 mx-auto rounded-4xl space-y-6 border border-slate-200 w-full">
              <p className="text-slate-400 font-bold text-lg text-center">Review Mode</p>
              <h1 className="text-3xl font-bold text-slate-700 text-center">
                {reviewQuestion?.text}
              </h1>
              <div className="space-y-4 pt-4">
                {reviewQuestion?.options?.map((option) => {
                  const isCorrect  = option.is_correct
                  const wasSelected = reviewAnswer?.selectedOptionId === option.id

                  let style = 'border-slate-200'
                  let label = null

                  if (isCorrect) {
                    style = 'border-2 border-emerald-400 bg-emerald-50'
                    label = (
                      <span className="text-emerald-500 font-bold text-sm bg-emerald-200 px-3 py-1 rounded-full">
                        Correct Answer
                      </span>
                    )
                  }
                  if (wasSelected && !isCorrect) {
                    style = 'border-2 border-red-400 bg-red-50'
                    label = (
                      <span className="text-red-500 font-bold text-sm bg-red-200 px-3 py-1 rounded-full">
                        Your Answer
                      </span>
                    )
                  }

                  return (
                    <div
                      key={option.id}
                      className={`w-full py-5 px-6 rounded-3xl border-2 cursor-default flex justify-between items-center ${style}`}
                    >
                      <p
                        className={`text-lg font-bold ${
                          isCorrect
                            ? 'text-emerald-800'
                            : wasSelected
                            ? 'text-red-800'
                            : 'text-slate-500'
                        }`}
                      >
                        {option.text}
                      </p>
                      {label}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Desktop sidebar ───────────────────────────────────────────────── */}
      <div className="w-1/3 xl:w-1/4 z-10 bg-sky-50/90 border-l border-slate-200 p-6 h-full hidden md:block">
        <ResultSidebar
          totalQuestions={total}
          questions={questions}
          answers={answers}
          currentQuestion={selectedQuestion}
          onSelectQuestion={setSelectedQuestion}
          onShowOverview={() => setSelectedQuestion(null)}
          variant="desktop"
          allAttempts={allAttempts}
          activeAttemptIdx={activeAttemptIdx}
          onSelectAttempt={onSelectAttempt}
        />
      </div>

      {/* ── Mobile sidebar ───────────────────────────────────────────────── */}
      <button
        onClick={() => setShowMobileSidebar(true)}
        className="md:hidden fixed bottom-8 right-0 z-40 bg-violet-500 text-white p-4 rounded-l-full shadow-lg active:scale-95 transition"
      >
        <List size={24} />
      </button>
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
          showMobileSidebar ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setShowMobileSidebar(false)}
        />
        <div
          className={`absolute right-0 top-0 h-full w-[85%] max-w-sm bg-slate-50 shadow-2xl p-6 overflow-y-auto transition-transform duration-300 ${
            showMobileSidebar ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <ResultSidebar
            totalQuestions={total}
            answers={answers}
            currentQuestion={selectedQuestion}
            onSelectQuestion={(q) => { setSelectedQuestion(q); setShowMobileSidebar(false) }}
            onShowOverview={() => { setSelectedQuestion(null); setShowMobileSidebar(false) }}
            variant="mobile"
            allAttempts={allAttempts}
            activeAttemptIdx={activeAttemptIdx}
            onSelectAttempt={(idx) => { onSelectAttempt?.(idx); setShowMobileSidebar(false) }}
          />
        </div>
      </div>
    </div>
  )
}

export default QuizResult