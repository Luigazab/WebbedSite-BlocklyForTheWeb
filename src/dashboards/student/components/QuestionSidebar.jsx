import { Circle, Pencil } from "lucide-react"

const QuestionSidebar = ({
  totalQuestions = 10,
  currentQuestion = 1,
  onSelectQuestion,
  variant = "desktop", // "desktop" | "mobile"
}) => {

  const questions = Array.from(
    { length: totalQuestions },
    (_, i) => i + 1
  )

  const getQuestionState = (q) => {
    if (q < currentQuestion) return "done"
    if (q === currentQuestion) return "current"
    return "locked"
  }

  return (
    <div className="flex flex-col h-full justify-between">
      <p className="text-foreground text-2xl font-bold mb-4">Questions</p>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
      {questions.map((q) => {
        const state = getQuestionState(q)
        const isClickable = state !== "locked"

        return (
          <div
            key={q}
            onClick={() =>
              isClickable && onSelectQuestion?.(q)
            }
            className={`flex items-center gap-4 rounded-2xl shadow transition-all cursor-pointer ${
                variant === "desktop" ? "p-5" : "p-4"}

              ${
                state === "done" &&
                "bg-card hover:bg-muted cursor-pointer"
              }

              ${
                state === "current" &&
                "bg-card border-2 border-sky-600 cursor-pointer"
              }

              ${
                state === "locked" &&
                "bg-muted cursor-not-allowed"
              }
            `}
          >
            {/* ICON */}
            <span>
              {state === "done" ? (
                <div className="rounded-full bg-sky-200 dark:bg-sky-950/50 text-violet-800 dark:text-violet-300">
                  <Pencil size={variant === "desktop" ? 30 : 26} />
                </div>
              ) : (
                <Circle size={variant === "desktop" ? 30 : 26} stroke="grey" />
              )}
            </span>

            {/* LABEL */}
            <p className="text-foreground text-lg font-bold">
              Question {q}
            </p>
          </div>
        )
      })}
      </div>
    </div>
  )
}

export default QuestionSidebar