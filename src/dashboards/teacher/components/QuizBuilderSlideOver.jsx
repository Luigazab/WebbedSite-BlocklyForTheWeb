import { X, Search, FileQuestion, Clock, Plus, ArrowLeft, AlertTriangle, Check } from "lucide-react";
import { useState } from "react";

const QuizBuilderSlideOver = ({ isOpen, onClose, lessonTitle, onAttach }) => {
  // Views: 'list' | 'preview' | 'build'
  const [view, setView] = useState('list');
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showEditWarning, setShowEditWarning] = useState(false);

  // Mock Data
  const existingQuizzes = [
    { id: 1, title: "Basic JS Variables", questions: 5, duration: 5 },
    { id: 2, title: "React State Basics", questions: 10, duration: 10 },
    { id: 3, title: "Midterm Review", questions: 20, duration: 30 },
  ];

  // Dummy questions for preview
  const previewQuestions = [
    "What is the keyword to declare a block-scoped variable?",
    "Which data type is NOT primitive in JavaScript?",
    "How do you update state in React?"
  ];

  const handleSelectQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setView('preview');
  };

  const handleCreateNew = () => {
    setSelectedQuiz(null);
    setView('build');
  };

  const handleConfirmEdit = () => {
    setShowEditWarning(false);
    setView('build');
  };

  return (
    <div className={`z-50 transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
      {/* Slide Panel */}
      <div className={`absolute right-0 top-0 h-full w-full md:w-[60%] lg:w-[45%] xl:w-[35%] bg-slate-50 shadow-2xl flex flex-col transition-transform! duration-300! ease-in-out! ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {view !== 'list' && (
              <button onClick={() => { setView('list'); setShowEditWarning(false); }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                <ArrowLeft size={20} />
              </button>
            )}
            <h2 className="text-xl font-extrabold text-slate-800">
              {view === 'list' && "Attach a Quiz"}
              {view === 'preview' && "Preview Quiz"}
              {view === 'build' && (selectedQuiz ? "Edit Quiz" : "Build New Quiz")}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* --- VIEW: LIST EXISTING QUIZZES --- */}
          {view === 'list' && (
            <div className="space-y-6">
              <button onClick={handleCreateNew} className="w-full py-4 border-2 border-dashed border-violet-400 bg-violet-50 text-violet-700 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-violet-100 transition">
                <Plus size={20} /> Create Brand New Quiz
              </button>

              <div>
                <h3 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Or Select Existing</h3>
                <div className="relative mb-4">
                  <Search className="absolute left-4 top-3 text-slate-400" size={20} />
                  <input 
                    type="text" 
                    placeholder="Search quizzes..." 
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none focus:border-violet-400"
                  />
                </div>

                <div className="space-y-3">
                  {existingQuizzes.map(quiz => (
                    <div 
                      key={quiz.id} 
                      onClick={() => handleSelectQuiz(quiz)}
                      className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-violet-400 hover:shadow-md transition group"
                    >
                      <h4 className="font-bold text-slate-800 text-lg group-hover:text-violet-700 transition">{quiz.title}</h4>
                      <div className="flex items-center gap-4 mt-2 text-sm font-semibold text-slate-500">
                        <span className="flex items-center gap-1"><FileQuestion size={16}/> {quiz.questions} Qs</span>
                        <span className="flex items-center gap-1"><Clock size={16}/> {quiz.duration} mins</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* --- VIEW: PREVIEW QUIZ --- */}
          {view === 'preview' && selectedQuiz && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 text-center">
                <h3 className="text-2xl font-extrabold text-slate-800 mb-2">{selectedQuiz.title}</h3>
                <div className="flex justify-center gap-4 text-sm font-bold text-violet-600 bg-violet-50 py-2 rounded-lg mx-auto w-max px-4">
                  <span>{selectedQuiz.questions} Questions</span>
                  <span>•</span>
                  <span>{selectedQuiz.duration} Minutes Limit</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-500 mb-3">Question Preview</h4>
                <div className="space-y-3">
                  {previewQuestions.map((q, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <p className="font-bold text-slate-700"><span className="text-violet-500 mr-2">{idx + 1}.</span> {q}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Warning Prompt overlay (simulated as inline card for UX) */}
              {showEditWarning && (
                <div className="bg-orange-50 border-2 border-orange-200 p-5 rounded-2xl relative">
                  <div className="flex gap-3 text-orange-800">
                    <AlertTriangle size={24} className="shrink-0" />
                    <div>
                      <p className="font-bold">Wait! This quiz is used elsewhere.</p>
                      <p className="text-sm mt-1 font-medium">Editing this will save it as a new copy named <strong>"{lessonTitle} Quiz"</strong> so you don't accidentally change it for other lessons.</p>
                      <div className="flex gap-3 mt-4">
                        <button onClick={() => setShowEditWarning(false)} className="px-4 py-2 text-sm font-bold bg-white text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-100">Cancel</button>
                        <button onClick={handleConfirmEdit} className="px-4 py-2 text-sm font-bold bg-orange-500 text-white rounded-lg hover:bg-orange-600">Proceed to Edit</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* --- VIEW: BUILDER WORKSPACE --- */}
          {view === 'build' && (
            <div className="space-y-6 pb-20">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-1">Quiz Title</label>
                  <input 
                    type="text" 
                    defaultValue={selectedQuiz ? `${lessonTitle} Quiz` : ""} 
                    placeholder="e.g. Variables Assessment"
                    className="w-full px-4 py-2 font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-violet-400 focus:bg-white"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-bold text-slate-700 mb-1">Time Limit (mins)</label>
                    <input type="number" defaultValue="5" className="w-full px-4 py-2 font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none" />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-bold text-slate-700 mb-1">Passing Score (%)</label>
                    <input type="number" defaultValue="80" className="w-full px-4 py-2 font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none" />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-3">
                  <h4 className="font-bold text-slate-700">Questions</h4>
                </div>
                
                {/* Dummy Builder Question Block */}
                <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 mb-4 group focus-within:border-violet-400">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-bold text-violet-500 uppercase tracking-wider bg-violet-50 px-2 py-1 rounded">Question 1</span>
                    <button className="text-slate-400 hover:text-red-500"><X size={16}/></button>
                  </div>
                  <textarea 
                    placeholder="Write your question here..." 
                    className="w-full font-bold text-slate-800 text-lg resize-none outline-none bg-transparent mb-4" 
                    rows={2}
                  />
                  <div className="space-y-2">
                    {/* Options */}
                    {['Option A', 'Option B', 'Option C'].map((opt, i) => (
                      <div key={i} className={`flex items-center gap-3 p-2 rounded-xl border ${i === 0 ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${i === 0 ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`}>
                          {i === 0 && <Check size={12} className="text-white"/>}
                        </div>
                        <input type="text" defaultValue={opt} className="flex-1 bg-transparent font-semibold outline-none" />
                      </div>
                    ))}
                    <button className="text-sm font-bold text-violet-600 mt-2 hover:underline">+ Add Option</button>
                  </div>
                </div>

                <button className="w-full py-4 border-2 border-dashed border-slate-300 text-slate-500 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-100 hover:border-slate-400 transition">
                  <Plus size={20} /> Add Next Question
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Footer Actions */}
        <div className="border-t border-slate-200 bg-white p-4 flex gap-4">
          {view === 'preview' && (
            <>
              <button 
                onClick={() => setShowEditWarning(true)} 
                className="flex-1 py-3 font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition"
              >
                Edit Questions
              </button>
              <button 
                onClick={() => onAttach(selectedQuiz)} 
                className="flex-1 py-3 font-bold text-white bg-emerald-500 rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-200 transition"
              >
                Attach Quiz
              </button>
            </>
          )}

          {view === 'build' && (
            <button 
              onClick={() => onAttach({ title: "New Quiz" })} 
              className="w-full py-3 font-bold text-white bg-violet-600 rounded-xl hover:bg-violet-700 shadow-lg shadow-violet-200 transition"
            >
              Save & Attach Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizBuilderSlideOver;