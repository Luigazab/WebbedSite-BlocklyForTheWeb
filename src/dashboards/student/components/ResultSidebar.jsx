import { CheckCircle, XCircle, ChevronDown } from "lucide-react";

const ResultSidebar = ({
  totalQuestions = 10,
  currentQuestion = null,
  onSelectQuestion,
  onShowOverview,
  variant = "desktop",
}) => {
  const questions = Array.from({ length: totalQuestions }, (_, i) => ({
    number: i + 1,
    isCorrect: i !== 2, // Making question 3 "wrong" for demonstration
  }));

  return (
    <div className="flex flex-col h-full">
      {/* Attempt Dropdown Header */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-slate-700 text-2xl font-bold">Attempt</p>
        <div className="relative">
          <select className="appearance-none bg-white border border-slate-300 text-slate-700 rounded-xl py-2 pl-4 pr-10 font-bold shadow-sm outline-none cursor-pointer focus:ring-2 focus:ring-violet-400">
            <option>1</option>
            <option>2</option>
            <option>3</option>
          </select>
          <ChevronDown className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" size={20} />
        </div>
      </div>

      {/* Percentage / Overview Card */}
      <div
        onClick={onShowOverview}
        className={`bg-white rounded-2xl shadow mb-6 border-2 cursor-pointer flex flex-col items-center text-center transition-all ${
          currentQuestion === null ? "border-violet-500" : "border-transparent hover:border-violet-300"
        } ${variant === "desktop" ? "p-6" : "p-4"}`}
      >
        <p className="text-5xl font-extrabold text-violet-500">90%</p>
        <p className="text-slate-500 font-bold text-sm">You got 9 answers correct</p>
      </div>

      {/* Question List */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {questions.map((q) => {
          const isSelected = q.number === currentQuestion;

          return (
            <div
              key={q.number}
              onClick={() => onSelectQuestion(q.number)}
              className={`flex items-center gap-4 rounded-2xl shadow transition-all cursor-pointer ${
                variant === "desktop" ? "p-5" : "p-4"
              } ${
                isSelected
                  ? "bg-white border-2 border-sky-500"
                  : "bg-white border-2 border-transparent hover:bg-slate-100"
              }`}
            >
              {/* ICONS: Check is Red, X is Green as requested */}
              <span>
                {q.isCorrect ? (
                  <CheckCircle fill="#22c55e" color="white" size={variant === "desktop" ? 30 : 26} />
                ) : (
                  <XCircle fill="#ef4444" color="white" size={variant === "desktop" ? 30 : 26} />
                )}
              </span>

              <p className="text-slate-700 text-lg font-bold">
                Question {q.number}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResultSidebar;