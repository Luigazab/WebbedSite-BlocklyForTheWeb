import { ArrowLeft, CalendarDays, Clock, NotepadText, List } from 'lucide-react'
import { useState } from 'react'
import ResultSidebar from '../../components/app/ResultSidebar'

const QuizResult = ({ lesson, result, onRetake, onFinish }) => {
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)

  const { score, total, timeTaken, answers } = result
  const percentage = Math.round((score / total) * 100)
  const questions = lesson.quiz?.questions || []

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0')
    const s = String(seconds % 60).padStart(2, '0')
    return `${m}:${s}`
  }

  const formatDate = (date) => new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })

  // Find the question and answer data for review view
  const reviewQuestion = selectedQuestion !== null
    ? questions[selectedQuestion - 1]
    : null
  const reviewAnswer = reviewQuestion
    ? answers.find(a => a.questionId === reviewQuestion.id)
    : null

  return (
    <div className="h-[93vh] w-full bg-slate-50 relative overflow-hidden flex">
      <div className="absolute inset-0 z-0" style={{
        backgroundImage: `
          linear-gradient(to right, rgba(229,231,235,0.8) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(229,231,235,0.8) 1px, transparent 1px),
          radial-gradient(circle 500px at 20% 80%, rgba(139,92,246,0.3), transparent),
          radial-gradient(circle 500px at 80% 20%, rgba(59,130,246,0.3), transparent)
        `,
        backgroundSize: "48px 48px, 48px 48px, 100% 100%, 100% 100%",
      }} />

      <div className="z-10 flex flex-col justify-center items-center h-full w-full overflow-y-auto">
        {selectedQuestion === null ? (
          // Overview
          <div className="space-y-4 p-4 max-w-2xl flex flex-col justify-center w-full h-full">
            <div className="relative bg-white shadow mx-auto rounded-4xl space-y-4 border border-slate-200 w-full flex flex-col items-center">
              <div className="absolute left-6 top-6">
                <button onClick={onFinish} className="bg-slate-200/70 hover:bg-slate-300 p-2 rounded-lg transition-colors">
                  <ArrowLeft size={25} />
                </button>
              </div>
              <div className='p-6 space-y-4 flex flex-col items-center'>
                <div className="border-8 border-violet-500 rounded-full w-40 h-40 flex flex-col justify-center py-4 shadow bg-white">
                  <p className='font-bold text-slate-400 text-2xl text-center'>
                    <span className="text-6xl text-violet-500">{score}</span>/{total}
                  </p>
                  <p className='text-center font-bold text-orange-500'>Your score</p>
                </div>
                <h1 className="text-xl font-bold text-slate-500 text-center">
                  Well done, you have completed the quiz! Here's how you did.
                </h1>
                <p className='bg-yellow-100 leading-tight rounded-full px-5 py-2 text-sm text-yellow-600 font-semibold'>
                  You answered {score} out of {total} questions correctly!
                </p>
                <div className='flex w-full divide-x-2 divide-dashed divide-orange-200 pt-4'>
                  <div className='flex-1 flex flex-col items-center'>
                    <span className='rounded-full border border-slate-300 shadow p-4 bg-slate-50'>
                      <NotepadText size={30} className='text-violet-500' />
                    </span>
                    <p className='text-xs font-bold text-slate-400 mt-2'>Score</p>
                    <p className='text-2xl font-bold text-slate-600'>{percentage}%</p>
                  </div>
                  <div className='flex-1 flex flex-col items-center'>
                    <span className='rounded-full border border-slate-300 shadow p-4 bg-slate-50'>
                      <Clock size={30} className='text-violet-500' />
                    </span>
                    <p className='text-xs font-bold text-slate-400 mt-2'>Time Taken</p>
                    <p className='text-2xl font-bold text-slate-600'>{formatTime(timeTaken)}</p>
                  </div>
                  <div className='flex-1 flex flex-col items-center'>
                    <span className='rounded-full border border-slate-300 shadow p-4 bg-slate-50'>
                      <CalendarDays size={30} className='text-violet-500' />
                    </span>
                    <p className='text-xs font-bold text-slate-400 mt-2'>Date Taken</p>
                    <p className='text-xl font-bold text-slate-600'>{formatDate(new Date())}</p>
                  </div>
                </div>
              </div>
              <div className="w-full">
                <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-10">
                  <path d="M0,0 A10,11 0 0,1 0,20 Z" fill="#cbd5f5" stroke="#cbd5f5" strokeWidth="1.5" />
                  <line x1="0" y1="10" x2="100" y2="10" stroke="#cbd5f5" strokeWidth="2" strokeDasharray="4 2" />
                  <path d="M100,0 A10,11 0 0,0 100,20 Z" fill="#cbd5f5" stroke="#cbd5f5" strokeWidth="1.5" />
                </svg>
              </div>
              <div className='flex flex-col items-center space-y-4 pb-6'>
                <p className='font-bold text-slate-600'>You earned the badge</p>
                <div className="relative flex justify-center items-center">
                  <span className="absolute w-3 h-3 bg-green-500 rounded-full top-1 left-1" />
                  <span className="absolute w-2 h-2 bg-yellow-400 rounded-full bottom-2 right-8" />
                  <span className="absolute w-1.5 h-1.5 bg-blue-400 rounded-full top-8 right-2" />
                  <div className="h-32 w-32 bg-violet-200 rounded-full flex items-center justify-center z-1 border-4 border-white shadow-lg">🏆</div>
                </div>
              </div>
            </div>
            <div className="flex justify-between gap-8 mx-2">
              <button onClick={onRetake}
                className="btn bg-slate-300 text-white py-4 px-6 font-bold flex-1 rounded-2xl hover:bg-slate-400 transition-colors">
                Retake
              </button>
              <button onClick={onFinish}
                className="btn bg-emerald-400 text-white py-4 px-6 font-bold flex-1 rounded-2xl hover:bg-emerald-500 transition-colors">
                Continue
              </button>
            </div>
          </div>
        ) : (
          // Question review
          <div className="space-y-6 p-8 flex flex-col h-full max-w-4xl w-full">
            <div className="flex justify-between items-center">
              <button onClick={() => setSelectedQuestion(null)}
                className="bg-slate-200/70 hover:bg-slate-300 p-2 rounded-lg transition-colors">
                <ArrowLeft size={25} />
              </button>
              <p className="font-extrabold text-2xl text-slate-700">
                {String(selectedQuestion).padStart(2, '0')} of {String(total).padStart(2, '0')}
              </p>
            </div>
            <div className="bg-white shadow p-8 mx-auto rounded-4xl space-y-6 border border-slate-200 w-full">
              <p className="text-slate-400 font-bold text-lg text-center">Review Mode</p>
              <h1 className="text-3xl font-bold text-slate-700 text-center">{reviewQuestion?.text}</h1>
              <div className="space-y-4 pt-4">
                {reviewQuestion?.options?.map(option => {
                  const isCorrect = option.is_correct
                  const wasSelected = reviewAnswer?.selectedOptionId === option.id

                  let style = 'border-slate-200'
                  let label = null

                  if (isCorrect) {
                    style = 'border-2 border-emerald-400 bg-emerald-50'
                    label = <span className="text-emerald-500 font-bold text-sm bg-emerald-200 px-3 py-1 rounded-full">Correct Answer</span>
                  }
                  if (wasSelected && !isCorrect) {
                    style = 'border-2 border-red-400 bg-red-50'
                    label = <span className="text-red-500 font-bold text-sm bg-red-200 px-3 py-1 rounded-full">Your Answer</span>
                  }

                  return (
                    <div key={option.id}
                      className={`w-full py-5 px-6 rounded-3xl border-2 cursor-default flex justify-between items-center ${style}`}>
                      <p className={`text-lg font-bold ${isCorrect ? 'text-emerald-800' : wasSelected ? 'text-red-800' : 'text-slate-500'}`}>
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

      {/* Desktop sidebar */}
      <div className="w-1/3 xl:w-1/4 z-10 bg-sky-50/90 border-l border-slate-200 p-6 h-full hidden md:block">
        <ResultSidebar
          totalQuestions={total}
          answers={answers}
          currentQuestion={selectedQuestion}
          onSelectQuestion={setSelectedQuestion}
          onShowOverview={() => setSelectedQuestion(null)}
          variant="desktop"
        />
      </div>

      {/* Mobile sidebar */}
      <button onClick={() => setShowMobileSidebar(true)}
        className="md:hidden fixed bottom-8 right-0 z-40 bg-violet-500 text-white p-4 rounded-l-full shadow-lg active:scale-95 transition">
        <List size={24} />
      </button>
      <div className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
        showMobileSidebar ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowMobileSidebar(false)} />
        <div className={`absolute right-0 top-0 h-full w-[85%] max-w-sm bg-slate-50 shadow-2xl p-6 overflow-y-auto transition-transform duration-300 ${
          showMobileSidebar ? "translate-x-0" : "translate-x-full"}`}>
          <ResultSidebar
            totalQuestions={total}
            answers={answers}
            currentQuestion={selectedQuestion}
            onSelectQuestion={(q) => { setSelectedQuestion(q); setShowMobileSidebar(false) }}
            onShowOverview={() => { setSelectedQuestion(null); setShowMobileSidebar(false) }}
            variant="mobile"
          />
        </div>
      </div>
    </div>
  )
}

export default QuizResult