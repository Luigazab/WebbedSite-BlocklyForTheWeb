import { Circle, Pencil } from "lucide-react"

const QuestionSidebar = ({ totalQuestions, currentQuestion, answeredQuestions = [], onSelectQuestion, variant = "desktop" }) => {
  const questions = Array.from({ length: totalQuestions }, (_, i) => i + 1)

  const getState = (q) => {
    if (q === currentQuestion) return 'current'
    if (answeredQuestions.includes(q)) return 'done'
    return 'locked'
  }

  return (
    <div className="flex flex-col h-full justify-between">
      <p className="text-slate-700 text-2xl font-bold mb-4">Questions</p>
      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {questions.map(q => {
          const state = getState(q)
          return (
            <div key={q} onClick={() => state !== 'locked' && onSelectQuestion?.(q)}
              className={`flex items-center gap-4 rounded-2xl shadow transition-all
                ${variant === 'desktop' ? 'p-5' : 'p-4'}
                ${state === 'done'    && 'bg-white hover:bg-slate-100 cursor-pointer'}
                ${state === 'current' && 'bg-white border-2 border-sky-600 cursor-pointer'}
                ${state === 'locked'  && 'bg-slate-200 cursor-not-allowed'}
              `}>
              <span>
                {state === 'done'
                  ? <div className="rounded-full bg-sky-200 text-violet-800"><Pencil size={variant === 'desktop' ? 30 : 26} /></div>
                  : <Circle size={variant === 'desktop' ? 30 : 26} stroke="grey" />
                }
              </span>
              <p className="text-slate-700 text-lg font-bold">Question {q}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default QuestionSidebar