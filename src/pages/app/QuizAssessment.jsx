import { ArrowLeft, List } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import QuestionSidebar from "../../components/app/QuestionSidebar";

const shuffleArray = (array) => {
  const shuffled = [...array]

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))

    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled
}

const QuizAssessment = ({ lesson, onComplete }) => {
  const quiz = lesson.quiz;
  const [questions] = useState(() =>
    shuffleArray(
      (quiz?.questions || []).map(q => ({
        ...q,
        options: shuffleArray(q.options || [])
      }))
    )
  )
  const totalQuestions = questions.length;
  const timeLimit = quiz?.time_limit || 300;

  const startedAtRef = useRef(new Date()); 

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});  
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [showQuestions, setShowQuestions] = useState(false);

  const currentQuestion = questions[currentIndex];
  const currentQuestionNum = currentIndex + 1;

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleSelectOption = (optionId) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionId }));
  };

  const handleSubmit = useCallback(() => {
    const answerList = questions.map((q) => {
      const selectedOptionId = answers[q.id] || null;
      const selectedOption = q.options?.find((o) => o.id === selectedOptionId);
      return {
        questionId:       q.id,
        selectedOptionId,
        isCorrect:        selectedOption?.is_correct || false,
      };
    });

    const score = answerList.filter((a) => a.isCorrect).length;

    onComplete({
      score,
      total:      totalQuestions,
      timeTaken:  timeLimit - timeLeft,
      startedAt:  startedAtRef.current,  
      quizId:     quiz?.id,         
      answers:    answerList,
    });
  }, [answers, questions, timeLeft, timeLimit, quiz?.id, onComplete]);

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const progressPercent = (currentQuestionNum / totalQuestions) * 100;

  if (!currentQuestion)
    return <div className="p-8 text-center">No questions found.</div>;

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
        <div className="space-y-4 p-8 flex flex-col justify-between h-full w-full max-w-2xl">
          {/* Header */}
          <div className="flex justify-between items-center">
            <button
              onClick={handleBack}
              disabled={currentIndex === 0}
              className="bg-slate-200/70 hover:bg-slate-300 p-2 rounded-lg disabled:opacity-40"
            >
              <ArrowLeft size={25} />
            </button>
            <p className="font-extrabold text-2xl">
              {String(currentQuestionNum).padStart(2, "0")} of{" "}
              {String(totalQuestions).padStart(2, "0")}
            </p>
            <span className="font-extrabold flex gap-2 text-xl rounded-full bg-blockly-blue/50 text-white p-2 items-center">
              <img src="/clock.png" alt="" className="h-6 w-auto" />
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-600 rounded-full h-4">
            <div
              className="bg-emerald-400 h-4 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Question card */}
          <div className="bg-white shadow p-6 mx-auto rounded-4xl space-y-4 border border-slate-200 w-full">
            <p className="text-slate-300 font-bold text-lg">{lesson.title}</p>
            <h1 className="text-3xl font-bold text-slate-700 text-center">
              {currentQuestion.text}
            </h1>
            <div className="space-y-4">
              {currentQuestion.options?.map((option) => {
                const isSelected = answers[currentQuestion.id] === option.id;
                return (
                  <div
                    key={option.id}
                    onClick={() => handleSelectOption(option.id)}
                    className={`w-full py-6 px-4 rounded-3xl border cursor-pointer transition-all
                      ${
                        isSelected
                          ? "border-sky-400 bg-sky-100"
                          : "border-slate-300 hover:border-sky-400 hover:bg-sky-100"
                      }`}
                  >
                    <p className="text-slate-700 text-lg font-bold">
                      {option.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Nav buttons */}
          <div className="flex justify-between gap-8 mx-2">
            <button
              onClick={handleBack}
              disabled={currentIndex === 0}
              className="btn bg-slate-300 text-white py-3 flex-1 rounded-2xl disabled:opacity-40"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="btn bg-emerald-400 text-white py-3 flex-1 rounded-2xl"
            >
              {currentIndex === totalQuestions - 1 ? "Submit" : "Next"}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="w-1/3 xl:w-1/4 z-10 space-y-4 bg-sky-50/90 p-6 h-full hidden md:block">
        <QuestionSidebar
          totalQuestions={totalQuestions}
          currentQuestion={currentQuestionNum}
          answeredQuestions={Object.keys(answers).map(
            (id) => questions.findIndex((q) => q.id === id) + 1
          )}
          onSelectQuestion={(num) => setCurrentIndex(num - 1)}
          variant="desktop"
        />
      </div>

      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setShowQuestions(true)}
        className="md:hidden fixed bottom-8 right-0 z-40 bg-blockly-blue text-white p-4 rounded-l-full shadow-lg active:scale-95 transition"
      >
        <List size={24} />
      </button>
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
          showQuestions
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setShowQuestions(false)}
        />
        <div
          className={`absolute right-0 top-0 h-full w-[85%] max-w-sm bg-slate-50 shadow-2xl p-6 overflow-y-auto transition-transform duration-300 ${
            showQuestions ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <QuestionSidebar
            totalQuestions={totalQuestions}
            currentQuestion={currentQuestionNum}
            answeredQuestions={Object.keys(answers).map(
              (id) => questions.findIndex((q) => q.id === id) + 1
            )}
            onSelectQuestion={(num) => {
              setCurrentIndex(num - 1);
              setShowQuestions(false);
            }}
            variant="mobile"
          />
        </div>
      </div>
    </div>
  );
};

export default QuizAssessment;