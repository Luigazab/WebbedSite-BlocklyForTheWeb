import { ArrowLeft, Circle, CircleX, List, Pencil } from "lucide-react"
import { useState } from "react"
import QuestionSidebar from "../components/QuestionSidebar"

const QuizAssessment = () => {
  const [showQuestions, setShowQuestions] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(5)
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
        backgroundSize: "48px 48px, 48px 48px, 100% 100%, 100% 100%",
      }}
    />
    <div className="z-10 flex justify-center items-center h-full w-full">
      <div className="space-y-4 p-8 flex flex-col justify-between h-full">
        <div className="flex justify-between items-center">
          <button className="bg-slate-200/70 hover:bg-slate-300 p-2 rounded-lg"><ArrowLeft size={25}/> </button>
          <p className="font-extrabold text-2xl">05 of 10</p>
          <span className="font-extrabold flex gap-2 text-xl rounded-full bg-blockly-blue/50 text-white p-2 items-center">
            <img src="/clock.png" alt="" className="h-6 w-auto" />
            05:00
          </span>
        </div>
        <div class="w-full bg-slate-600 rounded-full h-4">
          <div class="bg-emerald-400 h-4 rounded-full w-[50%]"/>
        </div>
        <div className="bg-white shadow p-6 mx-auto rounded-4xl space-y-4 border border-slate-200">
          <p className="text-slate-300 font-bold text-lg">Lesson Title</p>
          <h1 className="text-3xl font-bold text-slate-700 text-center">Quiz Title lorem impum dolor sit amet consectetur?</h1>
          <div className="space-y-4">
            <div className="w-full py-6 px-4 rounded-3xl border border-slate-300 hover:border-sky-400 hover:bg-sky-100 cursor-pointer">
              <p className="text-slate-700 text-lg font-bold">Question 1</p>
            </div>
            <div className="w-full py-6 px-4 rounded-3xl border border-slate-300 hover:border-sky-400 hover:bg-sky-100 cursor-pointer">
              <p className="text-slate-700 text-lg font-bold">Question 1</p>
            </div>
            <div className="w-full py-6 px-4 rounded-3xl border border-slate-300 hover:border-sky-400 hover:bg-sky-100 cursor-pointer">
              <p className="text-slate-700 text-lg font-bold">Question 1</p>
            </div>
            <div className="w-full py-6 px-4 rounded-3xl border border-slate-300 hover:border-sky-400 hover:bg-sky-100 cursor-pointer">
              <p className="text-slate-700 text-lg font-bold">Question 1</p>
            </div>
          </div>
        </div>
        <div className="flex justify-between gap-8 mx-2">
          <button className="btn bg-slate-300 text-white py-3 flex-1 rounded-2xl">Back</button>
          <button className="btn bg-emerald-400 text-white py-3 flex-1 rounded-2xl">Next</button>
        </div>
      </div>
    </div>
    <div className="w-1/3 xl:w-1/4 z-10 space-y-4 bg-sky-50/90 p-6 h-full hidden md:block">
      <QuestionSidebar totalQuestions={10} currentQuestion={currentQuestion} onSelectQuestion={setCurrentQuestion} variant="desktop"/>
    </div>
    <button onClick={() => setShowQuestions(true)} className="md:hidden fixed bottom-8 right-0 z-40 bg-blockly-blue text-white p-4 rounded-l-full shadow-lg active:scale-95 transition">
      <List size={24} />
    </button>
    <div className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
        showQuestions
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setShowQuestions(false)}
      />

      {/* Slide Panel */}
      <div
        className={`absolute right-0 top-0 h-full w-[85%] max-w-sm bg-slate-50 shadow-2xl p-6 overflow-y-auto transition-transform duration-300 ${
          showQuestions ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <QuestionSidebar totalQuestions={10} currentQuestion={currentQuestion} onSelectQuestion={(q) => {setCurrentQuestion(q); setShowQuestions(false)}} variant="mobile"/>
      </div>
    </div>

  </div>
  )
}

export default QuizAssessment