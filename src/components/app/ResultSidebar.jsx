import { CheckCircle, XCircle, ChevronDown } from "lucide-react"

const ResultSidebar = ({ totalQuestions, answers = [], currentQuestion, onSelectQuestion, onShowOverview, variant = "desktop" }) => {
  const questions = Array.from({ length: totalQuestions }, (_, i) => ({
    number: i + 1,
    isCorrect: answers[i]?.isCorrect || false,
  }))

  const correctCount = answers.filter(a => a.isCorrect).length
  const percentage = Math.round((correctCount / totalQuestions) * 100)

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <p className="text-slate-700 text-2xl font-bold">Results</p>
      </div>
      <div onClick={onShowOverview}
        className={`bg-white rounded-2xl shadow mb-6 border-2 cursor-pointer flex flex-col items-center text-center transition-all
          ${currentQuestion === null ? 'border-violet-500' : 'border-transparent hover:border-violet-300'}
          ${variant === 'desktop' ? 'p-6' : 'p-4'}`}>
        <p className="text-5xl font-extrabold text-violet-500">{percentage}%</p>
        <p className="text-slate-500 font-bold text-sm">You got {correctCount} answers correct</p>
      </div>
      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {questions.map(q => (
          <div key={q.number} onClick={() => onSelectQuestion(q.number)}
            className={`flex items-center gap-4 rounded-2xl shadow cursor-pointer transition-all
              ${variant === 'desktop' ? 'p-5' : 'p-4'}
              ${q.number === currentQuestion ? 'bg-white border-2 border-sky-500' : 'bg-white border-2 border-transparent hover:bg-slate-100'}
            `}>
            <span>
              {q.isCorrect
                ? <CheckCircle fill="#22c55e" color="white" size={variant === 'desktop' ? 30 : 26} />
                : <XCircle fill="#ef4444" color="white" size={variant === 'desktop' ? 30 : 26} />
              }
            </span>
            <p className="text-slate-700 text-lg font-bold">Question {q.number}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ResultSidebar