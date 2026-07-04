import { useState, useEffect, useRef, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Clock, Trophy, AlertTriangle, RotateCcw } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import {
  submitQuizAttempt,
  markLessonComplete,
  getAllQuizAttempts,
} from "../../services/lessonProgressService";
import QuizAssessment from "./QuizAssessment";
import QuizResult from "./QuizResult";
import CompleteSuccessModal from "../../components/app/CompleteSuccessModal";

const normaliseDbAnswers = (dbAnswers, questions) =>
  questions.map((q) => {
    const dbRow = dbAnswers.find((a) => a.question_id === q.id)
    return {
      questionId:       q.id,
      selectedOptionId: dbRow?.options_id   ?? null,
      isCorrect:        dbRow?.is_correct   ?? false,
    }
  })

const attemptToResult = (attempt, questions) => {
  const startedAt = attempt.started_at
    ? new Date(attempt.started_at)
    : null

  const finishedAt = attempt.finished_at
    ? new Date(attempt.finished_at)
    : null

  const timeTaken =
    startedAt && finishedAt
      ? Math.floor((finishedAt - startedAt) / 1000)
      : null

  return {
    score: attempt.score,
    total: questions.length,
    timeTaken,
    startedAt,
    quizId: attempt.quiz_id,
    answers: normaliseDbAnswers(attempt.answers ?? [], questions),
  }
}

const formatDuration = (seconds) => {
  if (!seconds) return "unlimited"
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m === 0) return `${s}s`
  return s === 0 ? `${m} min` : `${m}m ${s}s`
}

function StartQuizDialog({ isOpen, onConfirm, onCancel, quiz }) {
  const timeLimit = quiz?.time_limit
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-60" onClose={onCancel}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
            leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-5 text-center">
              <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center">
                <Clock className="w-8 h-8 text-violet-600" />
              </div>
              <Dialog.Title className="text-xl font-black text-slate-800">
                Ready to start?
              </Dialog.Title>
              <div className="space-y-1.5 text-sm text-slate-500">
                <p>You're about to take a <span className="font-bold text-slate-700">timed quiz</span>.</p>
                {timeLimit ? (
                  <p>
                    You'll have{" "}
                    <span className="font-bold text-violet-600">{formatDuration(timeLimit)}</span>{" "}
                    to complete it.
                  </p>
                ) : (
                  <p>This quiz has <span className="font-bold text-violet-600">no time limit</span>.</p>
                )}
                <p className="pt-1 text-slate-400">
                  The timer starts as soon as you click Begin.
                </p>
              </div>
              <div className="flex gap-3 w-full pt-1">
                <button
                  onClick={onCancel}
                  className="flex-1 btn py-2.5 bg-slate-100 text-slate-600 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 btn py-2.5 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-colors"
                >
                  Begin
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}

function PerfectRetakeDialog({ isOpen, onConfirm, onCancel }) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-60" onClose={onCancel}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
            leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-5 text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center">
                <Trophy className="w-8 h-8 text-yellow-500" />
              </div>
              <Dialog.Title className="text-2xl font-black text-slate-800">
                You already aced this!
              </Dialog.Title>
              <p className="text-slate-500 leading-relaxed">
                You've already gotten a <span className="font-bold text-emerald-600">perfect score</span> on
                this quiz. Retaking it won't save a new attempt, it's for review only.
              </p>
              <div className="flex flex-col gap-3 w-full pt-1">
                <button
                  onClick={onConfirm}
                  className="flex-1 btn py-2.5 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw size={15} /> Review anyway
                </button>
                <button
                  onClick={onCancel}
                  className="flex-1 btn py-2.5 bg-slate-100 text-slate-600 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Stay here
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}

const QuizContent = ({ lesson, onNext, navigation }) => {
  const user      = useAuthStore((s) => s.user)
  const quiz      = lesson?.quiz
  const questions = quiz?.questions ?? []
  const total     = questions.length

  const [phase, setPhase]                   = useState("loading")
  const [allAttempts, setAllAttempts]       = useState([])   // DB rows + answers
  const [activeAttemptIdx, setActiveAttemptIdx] = useState(0)
  const [currentResult, setCurrentResult]   = useState(null) // result shown in QuizResult
  const [saving, setSaving]                 = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [showPerfectDialog, setShowPerfectDialog] = useState(false)

  const reviewOnlyRef = useRef(false) // retake after perfect — no DB save

  useEffect(() => {
    if (!user?.id || !quiz?.id) {
      setPhase("start")
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const attempts = await getAllQuizAttempts(user.id, quiz.id)
        if (cancelled) return

        setAllAttempts(attempts)

        if (attempts.length === 0) {
          setPhase("start")
        } else {
          const bestIdx = attempts.reduce(
            (bi, a, i) => (a.score > attempts[bi].score ? i : bi),
            0
          )
          setActiveAttemptIdx(bestIdx)
          setCurrentResult(attemptToResult(attempts[bestIdx], questions))
          setPhase("result")
        }
      } catch (err) {
        console.error("Failed to load quiz attempts:", err)
        setPhase("start")
      }
    })()

    return () => { cancelled = true }
  }, [user?.id, quiz?.id])

  const hasPerfectAttempt = allAttempts.some((a) => a.score === total && total > 0)

  const handleStartConfirm = () => {
    reviewOnlyRef.current = false
    setPhase("taking")
  }

  const handleRetakeClick = () => {
    if (hasPerfectAttempt) {
      setShowPerfectDialog(true)
    } else {
      reviewOnlyRef.current = false
      setPhase("taking")
    }
  }

  const handlePerfectRetakeConfirm = () => {
    setShowPerfectDialog(false)
    reviewOnlyRef.current = true   // won't save to DB
    setPhase("taking")
  }

  const handleQuizComplete = async (result) => {
    const isReviewOnly = reviewOnlyRef.current

    const displayResult = { ...result, total }
    setCurrentResult(displayResult)

    if (!isReviewOnly && user?.id && quiz?.id) {
      setSaving(true)
      try {
        await submitQuizAttempt(
          user.id,
          quiz.id,
          result.score,
          result.startedAt,
          result.answers
        )
        if (lesson?.id) {
          await markLessonComplete(user.id, lesson.id)
        }
        const refreshed = await getAllQuizAttempts(user.id, quiz.id)
        setAllAttempts(refreshed)
        setActiveAttemptIdx(refreshed.length - 1)
      } catch (err) {
        console.error("Failed to save quiz attempt:", err)
      } finally {
        setSaving(false)
      }
    }

    setPhase("result")
  }

  const handleSelectAttempt = (idx) => {
    setActiveAttemptIdx(idx)
    setCurrentResult(attemptToResult(allAttempts[idx], questions))
  }

  const handleFinish = () => setShowCompleteModal(true)

  const handleRemain   = () => setShowCompleteModal(false)
  const handleToTopic  = () => { setShowCompleteModal(false); onNext?.("topic") }
  const handleToNext   = () => { setShowCompleteModal(false); onNext?.("next") }


  if (phase === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (phase === "taking") {
    return (
      <QuizAssessment
        lesson={lesson}
        onComplete={handleQuizComplete}
      />
    )
  }

  if (phase === "start") {
    return (
      <>
        <div className="flex items-center justify-center h-64 text-slate-300 text-sm font-semibold">
          Get ready…
        </div>
        <StartQuizDialog
          isOpen
          quiz={quiz}
          onConfirm={handleStartConfirm}
          onCancel={() => onNext?.("topic")}
        />
      </>
    )
  }

  return (
    <>
      {saving && (
        <div className="fixed inset-0 z-[55] bg-black/20 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-2xl shadow-xl px-8 py-5 flex items-center gap-3">
            <div className="w-5 h-5 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
            <p className="font-semibold text-slate-700">Saving your attempt…</p>
          </div>
        </div>
      )}

      <QuizResult
        lesson={lesson}
        result={currentResult ?? { score: 0, total, timeTaken: null, answers: [] }}
        onRetake={handleRetakeClick}
        onFinish={handleFinish}
        allAttempts={allAttempts}
        activeAttemptIdx={activeAttemptIdx}
        onSelectAttempt={handleSelectAttempt}
      />

      {/* Perfect-retake warning */}
      <PerfectRetakeDialog
        isOpen={showPerfectDialog}
        onConfirm={handlePerfectRetakeConfirm}
        onCancel={() => setShowPerfectDialog(false)}
      />

      {/* Post-quiz navigation modal */}
      <CompleteSuccessModal
        isOpen={showCompleteModal}
        onClose={handleRemain}
        onRemain={handleRemain}
        onSubmitToTopic={handleToTopic}
        onSubmitToNext={navigation?.next ? handleToNext : handleToTopic}
        title="Quiz Complete!"
        message={`You scored ${currentResult?.score ?? 0} / ${total}. ${
          reviewOnlyRef.current ? "Review mode — no new attempt saved." : "Progress saved!"
        }`}
      />
    </>
  )
}

export default QuizContent