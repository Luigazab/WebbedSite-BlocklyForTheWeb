import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router'
import { useAuthStore } from '../../../store/authStore'
import { useLessonStore } from '../../../store/lessonStore'
import { useLesson } from '../../../hooks/useLesson'
import LessonContent from '../../../components/shared/LessonContent'
import QuizSection from '../components/QuizSection'
import {
  ArrowLeft, Clock, CheckCircle2, Loader2,
  Paperclip, Download, ExternalLink, Award,
  Calendar, AlertTriangle, FileText, HelpCircle,
  BookmarkCheck, AlertCircle,
} from 'lucide-react'
import { format, differenceInDays, isPast } from 'date-fns'

// ─── Confetti ─────────────────────────────────────────────────────────────────
const CONFETTI_COLORS = ['#7c3aed','#a78bfa','#fbbf24','#34d399','#60a5fa','#f472b6','#fb923c','#4ade80']

function Confetti() {
  const pieces = Array.from({ length: 70 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 1.4}s`,
    duration: `${2 + Math.random() * 1.5}s`,
    size: `${6 + Math.random() * 8}px`,
  }))
  return (
    <div className="fixed inset-0 pointer-events-none z-[10001] overflow-hidden">
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateY(105vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {pieces.map((p) => (
        <div key={p.id} style={{
          position: 'absolute', top: '-10px', left: p.left,
          width: p.size, height: p.size, backgroundColor: p.color,
          borderRadius: p.id % 3 === 0 ? '50%' : '2px',
          animation: `confettiFall ${p.duration} ${p.delay} ease-in forwards`,
        }} />
      ))}
    </div>
  )
}

// ─── Badge popup — lives in LessonViewer so it survives QuizSection re-renders ─

function BadgePopup({ badge, onClose }) {
  return (
    <>
      <Confetti />
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000]" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-[10000] p-6 pointer-events-none">
        <div className="pointer-events-auto bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center gap-5 max-w-xs w-full text-center"
          style={{ animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards' }}>
          <style>{`
            @keyframes popIn {
              from { transform: scale(0.4); opacity: 0; }
              to   { transform: scale(1);   opacity: 1; }
            }
            @keyframes badgeFloat {
              0%,100% { transform: translateY(0) rotate(-3deg); }
              50%     { transform: translateY(-10px) rotate(3deg); }
            }
          `}</style>

          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-300/50"
            style={{ animation: 'badgeFloat 2.5s ease-in-out infinite' }}>
            {badge.icon_url
              ? <img src={badge.icon_url} alt={badge.title} className="w-20 h-20 object-contain drop-shadow-md" />
              : <Award className="w-14 h-14 text-yellow-700" />}
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <p className="text-xs font-bold text-yellow-600 uppercase tracking-widest">Badge Earned!</p>
            <h2 className="text-xl font-black text-gray-900">{badge.title}</h2>
            {badge.description && <p className="text-sm text-gray-500 leading-relaxed">{badge.description}</p>}
          </div>

          <button onClick={onClose}
            className="mt-1 px-8 py-2.5 bg-blockly-purple text-white text-sm font-bold rounded-xl hover:bg-blockly-purple/90 transition-colors shadow-md shadow-blockly-purple/30">
            Awesome!
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Attachment ───────────────────────────────────────────────────────────────
function AttachmentItem({ attachment }) {
  const isLink   = attachment.file_type === 'link'
  const sizeLabel = attachment.file_size
    ? attachment.file_size > 1_000_000
      ? `${(attachment.file_size / 1_000_000).toFixed(1)} MB`
      : `${Math.round(attachment.file_size / 1000)} KB`
    : null

  return (
    <a href={attachment.file_url} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 hover:border-gray-200 transition-all group">
      <div className="w-8 h-8 bg-white rounded-lg border border-gray-200 flex items-center justify-center shrink-0">
        {isLink ? <ExternalLink className="w-4 h-4 text-gray-400" /> : <FileText className="w-4 h-4 text-gray-400" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-700 truncate">{attachment.file_name}</p>
        {sizeLabel && <p className="text-xs text-gray-400">{sizeLabel}</p>}
      </div>
      {isLink
        ? <ExternalLink className="w-3.5 h-3.5 text-gray-300 shrink-0" />
        : <Download className="w-3.5 h-3.5 text-gray-300 group-hover:text-blockly-purple shrink-0 transition-colors" />}
    </a>
  )
}

// ─── Due date banner ──────────────────────────────────────────────────────────
function DueDateBanner({ dueDate }) {
  if (!dueDate) return null
  const due  = new Date(dueDate)
  const days = differenceInDays(due, new Date())
  const past = isPast(due)
  const cfg  = past
    ? { bg: 'bg-red-50 border-red-200',       text: 'text-red-700',    label: `Overdue by ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''}` }
    : days === 0 ? { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700', label: 'Due today' }
    : days === 1 ? { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700', label: 'Due tomorrow' }
    : days <= 3  ? { bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700', label: `Due in ${days} days` }
    :              { bg: 'bg-blue-50 border-blue-200',     text: 'text-blue-700',   label: `Due in ${days} days` }

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${cfg.bg}`}>
      <AlertTriangle className={`w-4 h-4 shrink-0 ${cfg.text}`} />
      <div>
        <p className={`text-sm font-bold ${cfg.text}`}>{cfg.label}</p>
        <p className={`text-xs ${cfg.text} opacity-75`}>{format(due, 'EEEE, MMMM d, yyyy · h:mm a')}</p>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function LessonViewer() {
  const { lessonId, classroomId: paramClassroomId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const profile  = useAuthStore((s) => s.profile)

  const dueDate     = location.state?.dueDate     ?? null
  const classroomId = paramClassroomId ?? location.state?.classroomId ?? null

  const { currentLesson, lessonProgress, loading, fetchLesson, fetchProgress } = useLessonStore()
  const { handleUpdateProgress } = useLesson()

  const [scrollProgress, setScrollProgress] = useState(0)
  const [quizCompleted,  setQuizCompleted]   = useState(false)
  const [saving,         setSaving]          = useState(false)
  const [finishing,      setFinishing]       = useState(false)
  // locked: once true, never goes back — prevents progress bar bounce
  const [locked,         setLocked]          = useState(false)
  const [timeSpent,      setTimeSpent]       = useState(0)
  // Badge popup lives HERE so it isn't destroyed by QuizSection unmounting
  const [pendingBadge,   setPendingBadge]    = useState(null)

  const progressTimer = useRef(null)
  const timeTimer     = useRef(null)
  const lastSaved     = useRef(0)
  const mainElRef     = useRef(null)

  // ── Fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (lessonId && profile?.id) {
      fetchLesson(lessonId)
      fetchProgress(profile.id, lessonId)
    }
    mainElRef.current =
      document.querySelector('main.wrapper') ??
      document.querySelector('main') ??
      window
    return () => { clearInterval(timeTimer.current); clearTimeout(progressTimer.current) }
  }, [lessonId, profile?.id])

  useEffect(() => {
    const saved = lessonProgress[lessonId]
    if (!saved) return
    if ((saved.progress_percentage ?? 0) >= 100) {
      setLocked(true)
    } else if (saved.scroll_position && mainElRef.current) {
      setTimeout(() => mainElRef.current?.scrollTo({ top: saved.scroll_position, behavior: 'instant' }), 150)
    }
  }, [currentLesson])

  useEffect(() => {
    timeTimer.current = setInterval(() => setTimeSpent((t) => t + 1), 1000)
    return () => clearInterval(timeTimer.current)
  }, [])

  // ── Scroll tracker ────────────────────────────────────────────────────────
  const handleScroll = useCallback(() => {
    if (locked) return
    const el = mainElRef.current
    if (!el) return
    const scrollTop    = el.scrollTop    ?? el.pageYOffset ?? 0
    const scrollHeight = el.scrollHeight ?? document.body.scrollHeight
    const clientHeight = el.clientHeight ?? window.innerHeight
    const maxScroll    = scrollHeight - clientHeight
    if (maxScroll <= 0) { setScrollProgress(100); return }
    const pct = Math.min(100, Math.round((scrollTop / maxScroll) * 100))
    setScrollProgress(pct)
    clearTimeout(progressTimer.current)
    progressTimer.current = setTimeout(() => {
      if (Math.abs(pct - lastSaved.current) >= 5 || pct >= 95) {
        lastSaved.current = pct
        handleUpdateProgress(lessonId, { progress_percentage: pct, scroll_position: scrollTop, time_spent: timeSpent })
      }
    }, 1500)
  }, [locked, lessonId, timeSpent, handleUpdateProgress])

  useEffect(() => {
    const el = mainElRef.current
    if (!el) return
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  useEffect(() => {
    return () => {
      if (locked) return
      const el = mainElRef.current
      if (el && profile?.id && lessonId) {
        handleUpdateProgress(lessonId, {
          progress_percentage: scrollProgress,
          scroll_position: el.scrollTop ?? 0,
          time_spent: timeSpent,
        })
      }
    }
  }, [locked, scrollProgress, timeSpent])

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleSaveProgress = async () => {
    setSaving(true)
    try {
      await handleUpdateProgress(lessonId, {
        progress_percentage: scrollProgress,
        scroll_position: mainElRef.current?.scrollTop ?? 0,
        time_spent: timeSpent,
      })
    } finally { setSaving(false) }
  }

  const doLockLesson = async () => {
    await handleUpdateProgress(lessonId, {
      progress_percentage: 100,
      scroll_position: mainElRef.current?.scrollTop ?? 0,
      time_spent: timeSpent,
      completed_at: new Date().toISOString(),
    })
    setLocked(true)
  }

  const handleFinish = async () => {
    setFinishing(true)
    try { await doLockLesson() } finally { setFinishing(false) }
  }

  // QuizSection calls this with (passed, earnedBadge | null)
  // We show the badge FIRST, then lock the lesson when the user dismisses it
  const handleQuizComplete = (passed, earnedBadge) => {
    if (!passed) return
    setQuizCompleted(true)
    if (earnedBadge) {
      setPendingBadge(earnedBadge)
      // Don't lock yet — lock when badge is dismissed
    } else {
      doLockLesson()
    }
  }

  const handleBadgeDismiss = () => {
    setPendingBadge(null)
    doLockLesson()
  }

  const goBack = () =>
    classroomId ? navigate(`/student/classrooms/${classroomId}`) : navigate(-1)

  // ── Derived ───────────────────────────────────────────────────────────────
  const savedProgress   = lessonProgress[lessonId]
  const currentProgress = locked ? 100 : savedProgress?.progress_percentage ?? scrollProgress
  const isCompleted     = locked
  const attachments     = currentLesson?.attachments ?? []
  const quizzes         = currentLesson?.quizzes     ?? []
  const hasQuiz         = quizzes.length > 0
  const quiz            = quizzes[0]?.quiz ?? null
  const badge           = quiz?.badges?.[0] ?? null
  const teacher         = currentLesson?.teacher

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading && !currentLesson) {
    return <div className="flex items-center justify-center py-40"><Loader2 className="w-8 h-8 animate-spin text-blockly-purple" /></div>
  }
  if (!currentLesson && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <p className="text-gray-500">Lesson not found</p>
        <button onClick={goBack} className="text-sm text-blockly-purple hover:underline">Go back</button>
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="relative">
      {/* Badge popup — mounted in LessonViewer so it survives QuizSection unmount */}
      {pendingBadge && <BadgePopup badge={pendingBadge} onClose={handleBadgeDismiss} />}

      {/* Full-width scroll progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-[9999] bg-gray-200 pointer-events-none">
        <div className="h-full bg-blockly-purple transition-all duration-300 ease-out" style={{ width: `${currentProgress}%` }} />
      </div>

      {/* Sticky mini-bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm -mx-6 px-6 mb-6">
        <div className="max-w-4xl mx-auto py-2.5 flex items-center justify-between gap-4">
          <button onClick={goBack} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {classroomId ? 'Back to classroom' : 'Back'}
          </button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{Math.floor(timeSpent / 60)}m {timeSpent % 60}s</span>
            </div>
            {isCompleted ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />Completed
              </span>
            ) : (
              <span className="text-xs text-gray-400 font-medium tabular-nums">{currentProgress}%</span>
            )}
          </div>
        </div>
      </div>

      {/* Page body */}
      <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-24">

        {/* Lesson header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-8 py-7 flex flex-col gap-5">
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">{currentLesson.title}</h1>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
            {teacher && (
              <div className="flex items-center gap-2">
                <img src={teacher.avatar_url || '/default-avatar.png'} alt={teacher.username} className="w-6 h-6 rounded-full object-cover border border-gray-200" />
                <span className="font-semibold text-gray-700">{teacher.username}</span>
              </div>
            )}
            {currentLesson.created_at && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>Posted {format(new Date(currentLesson.created_at), 'MMM d, yyyy')}</span>
              </div>
            )}
            {currentLesson.estimated_duration && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{currentLesson.estimated_duration} min read</span>
              </div>
            )}
          </div>
          {dueDate && <DueDateBanner dueDate={dueDate} />}
          {badge && (
            <div className="flex items-center gap-3 px-4 py-3 bg-yellow-50 rounded-xl border border-yellow-200">
              {badge.icon_url ? <img src={badge.icon_url} alt={badge.title} className="w-8 h-8 object-contain" /> : <Award className="w-7 h-7 text-yellow-500" />}
              <div>
                <p className="text-xs font-semibold text-yellow-700">Badge you can earn</p>
                <p className="text-sm font-bold text-yellow-800">{badge.title}</p>
                {badge.description && <p className="text-xs text-yellow-600 mt-0.5">{badge.description}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-8 py-8 min-h-[200px]">
          <LessonContent content={currentLesson.content ?? currentLesson.content_markdown} />
        </div>

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Paperclip className="w-4 h-4 text-gray-500" />
              <h3 className="font-bold text-gray-800">Attachments <span className="text-sm font-normal text-gray-400">({attachments.length})</span></h3>
            </div>
            <div className="flex flex-col gap-2">
              {attachments.map((att) => <AttachmentItem key={att.id} attachment={att} />)}
            </div>
          </div>
        )}

        {/* Quiz */}
        {hasQuiz && quiz && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-50">
              <HelpCircle className="w-4 h-4 text-blockly-purple" />
              <h3 className="font-bold text-gray-800">{quiz.title}</h3>
              {quiz.questions?.length > 0 && <span className="text-xs text-gray-400">· {quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''}</span>}
              {quiz.passing_score != null && <span className="text-xs text-gray-400">· {quiz.passing_score}/{quiz.questions?.length} to pass</span>}
            </div>
            {isCompleted && quizCompleted ? (
              <div className="flex items-center gap-3 px-6 py-5">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-green-700">Quiz completed!</p>
                  {badge && <p className="text-xs text-gray-400 mt-0.5">You earned the "{badge.title}" badge.</p>}
                </div>
              </div>
            ) : (
              <QuizSection quiz={quiz} onComplete={handleQuizComplete} />
            )}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="flex flex-col items-center gap-4 py-4">
          {isCompleted ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-green-500" />
              </div>
              <p className="text-sm font-semibold text-green-700">Lesson completed!</p>
              <button onClick={goBack} className="text-sm text-blockly-purple hover:underline font-medium">← Back to classroom</button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 w-full max-w-sm">
              {hasQuiz && !quizCompleted && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 w-full justify-center">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Complete the quiz above to finish this lesson</span>
                </div>
              )}
              <div className="flex gap-3 w-full">
                <button
                  onClick={handleSaveProgress}
                  disabled={saving || finishing}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 border-2 border-gray-200 text-gray-600 font-semibold text-sm rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookmarkCheck className="w-4 h-4" />}
                  Save Progress
                </button>
                <button
                  onClick={handleFinish}
                  disabled={finishing || saving || (hasQuiz && !quizCompleted)}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-blockly-purple text-white font-semibold text-sm rounded-xl hover:bg-blockly-purple/90 transition-colors disabled:opacity-40 shadow-md shadow-blockly-purple/20"
                >
                  {finishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Finish Lesson
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}