import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useAuthStore } from '../../../store/authStore'
import { useLearnStore } from '../../../store/learnStore'
import { useLearn } from '../../../hooks/useLearn'
import LessonContent from '../../../components/shared/LessonContent'
import QuizSection from '../../student/components/QuizSection'
import {
  ArrowLeft, Clock, CheckCircle2, Loader2, MapPin,
  Paperclip, Download, ExternalLink, Award, FileText,
  HelpCircle, BookmarkCheck, AlertCircle, BookOpen as TutorialIcon,
  LayoutList, Play, Medal, Calendar,
} from 'lucide-react'
import { format } from 'date-fns'

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

function BadgePopup({ badge, onClose }) {
  return (
    <>
      <Confetti />
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000]" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-[10000] p-6 pointer-events-none">
        <div className="pointer-events-auto bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center gap-5 max-w-xs w-full text-center"
          style={{ animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards' }}>
          <style>{`
            @keyframes popIn { from { transform: scale(0.4); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            @keyframes badgeFloat { 0%,100% { transform: translateY(0) rotate(-3deg); } 50% { transform: translateY(-10px) rotate(3deg); } }
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

function AttachmentItem({ attachment }) {
  const isLink = attachment.file_type === 'link'
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

function TutorialLaunchCard({ tutorial }) {
  const navigate = useNavigate()
  const DIFF = {
    beginner:     { label: 'Beginner',     color: 'bg-emerald-100 text-emerald-700' },
    intermediate: { label: 'Intermediate', color: 'bg-amber-100 text-amber-700'    },
    advanced:     { label: 'Advanced',     color: 'bg-red-100 text-red-700'         },
  }
  const diff = DIFF[tutorial.difficulty_level] ?? DIFF.beginner
  const stepCount = tutorial.steps?.length ?? 0
  return (
    <div className="bg-white overflow-hidden rounded-2xl border-l-8 border-l-blockly-blue shadow-lg">
      <div className="flex items-center gap-4 p-5">
        <div className="w-11 h-11 rounded-xl bg-blockly-blue/10 flex items-center justify-center shrink-0">
          <TutorialIcon className="w-5 h-5 text-blockly-blue" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${diff.color}`}>{diff.label}</span>
            <span className="text-xs text-gray-400 flex items-center gap-1"><LayoutList size={11} />{stepCount} step{stepCount !== 1 ? 's' : ''}</span>
            {tutorial.estimated_time_minutes && (
              <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={11} />{tutorial.estimated_time_minutes} min</span>
            )}
          </div>
          <h3 className="font-bold text-gray-900 text-sm">{tutorial.title}</h3>
          {tutorial.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{tutorial.description}</p>}
          {tutorial.badges?.[0] && (
            <div className="flex items-center gap-2 mt-2">
              {tutorial.badges[0].icon_url
                ? <img src={tutorial.badges[0].icon_url} alt={tutorial.badges[0].title} className="w-5 h-5 object-contain" />
                : <Medal className="w-4 h-4 text-amber-500" />}
              <span className="text-xs text-amber-600 font-semibold">Earn: {tutorial.badges[0].title}</span>
            </div>
          )}
        </div>
        <button
          onClick={() => navigate(`/student/tutorials/${tutorial.id}`)}
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 btn btn-primary text-sm font-bold rounded-xl self-center"
        >
          <Play className="w-4 h-4" /> Start
        </button>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function TopicViewer() {
  const { topicId } = useParams()
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)

  const { currentTopic, currentTopicProgress, topicLoading, fetchTopic, clearCurrentTopic } = useLearnStore()
  const { handleUpdateTopicProgress, handleCompleteTopicFromViewer } = useLearn()

  const [scrollProgress, setScrollProgress] = useState(0)
  const [quizCompleted,  setQuizCompleted]   = useState(false)
  const [saving,         setSaving]          = useState(false)
  const [finishing,      setFinishing]       = useState(false)
  const [locked,         setLocked]          = useState(false)
  const [timeSpent,      setTimeSpent]       = useState(0)
  const [pendingBadge,   setPendingBadge]    = useState(null)

  const progressTimer = useRef(null)
  const timeTimer     = useRef(null)
  const lastSaved     = useRef(0)
  const mainElRef     = useRef(null)

  useEffect(() => {
    if (topicId && profile?.id) {
      fetchTopic(topicId, profile.id)
    }
    mainElRef.current =
      document.querySelector('main.wrapper') ??
      document.querySelector('main') ??
      window
    return () => {
      clearInterval(timeTimer.current)
      clearTimeout(progressTimer.current)
      clearCurrentTopic()
    }
  }, [topicId, profile?.id])

  // Restore position / lock if already completed
  useEffect(() => {
    if (!currentTopicProgress) return
    if ((currentTopicProgress.progress_percentage ?? 0) >= 100) {
      setLocked(true)
      setQuizCompleted(true)
    }
  }, [currentTopic])

  useEffect(() => {
    timeTimer.current = setInterval(() => setTimeSpent((t) => t + 1), 1000)
    return () => clearInterval(timeTimer.current)
  }, [])

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
        handleUpdateTopicProgress(topicId, {
          progress_percentage: pct,
          // no scroll_position column on learn_topic_progress — just percentage
        })
      }
    }, 1500)
  }, [locked, topicId, timeSpent, handleUpdateTopicProgress])

  useEffect(() => {
    const el = mainElRef.current
    if (!el) return
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // Save on unmount
  useEffect(() => {
    return () => {
      if (locked || !profile?.id) return
      handleUpdateTopicProgress(topicId, { progress_percentage: scrollProgress })
    }
  }, [locked, scrollProgress])

  const doLockTopic = async () => {
    await handleCompleteTopicFromViewer(topicId)
    setLocked(true)
  }

  const handleSaveProgress = async () => {
    setSaving(true)
    try {
      await handleUpdateTopicProgress(topicId, { progress_percentage: scrollProgress })
    } finally { setSaving(false) }
  }

  const handleFinish = async () => {
    setFinishing(true)
    try { await doLockTopic() } finally { setFinishing(false) }
  }

  const handleQuizComplete = (passed, earnedBadge) => {
    if (!passed) return
    setQuizCompleted(true)
    if (earnedBadge) {
      setPendingBadge(earnedBadge)
    } else {
      doLockTopic()
    }
  }

  const handleBadgeDismiss = () => {
    setPendingBadge(null)
    doLockTopic()
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const currentProgress = locked ? 100 : (currentTopicProgress?.progress_percentage ?? scrollProgress)
  const isCompleted = locked
  const lesson = currentTopic?.lesson ?? null
  const attachments  = lesson?.attachments ?? []
  const quizzes      = lesson?.quizzes ?? []
  const hasQuiz      = quizzes.length > 0
  const quiz         = quizzes[0]?.quiz ?? null
  const badge        = quiz?.badges?.[0] ?? null
  const tutorials    = lesson?.tutorials ?? []
  const teacher      = lesson?.teacher

  if (topicLoading && !currentTopic) {
    return <div className="flex items-center justify-center py-40"><Loader2 className="w-8 h-8 animate-spin text-blockly-purple" /></div>
  }
  if (!currentTopic && !topicLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <p className="text-gray-500">Topic not found</p>
        <button onClick={() => navigate(-1)} className="text-sm text-blockly-purple hover:underline">Go back</button>
      </div>
    )
  }

  return (
    <div className="relative">
      {pendingBadge && <BadgePopup badge={pendingBadge} onClose={handleBadgeDismiss} />}

      {/* Scroll progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-[9999] bg-gray-200 pointer-events-none">
        <div className="h-full bg-blockly-purple transition-all duration-300 ease-out" style={{ width: `${currentProgress}%` }} />
      </div>

      {/* Sticky nav bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm px-6 mb-6">
        <div className="max-w-4xl mx-auto py-2.5 flex items-center justify-between gap-4">
          <button onClick={() => navigate('/student/learn')}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Journey
          </button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-semibold text-slate-600">{currentTopic.title}</span>
            </div>
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

      {/* Body */}
      <div className="max-w-5xl mx-auto flex flex-col gap-8 pb-24">
        {/* Header */}
        {lesson ? (
          <div className="px-8 py-7 flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-slate-900 leading-relaxed">{lesson.title}</h1>
            <hr />
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 py-2 text-sm text-slate-500">
              {teacher && (
                <div className="flex items-center gap-2">
                  <img src={teacher.avatar_url || '/default-avatar.png'} alt={teacher.username}
                    className="w-6 h-6 rounded-full object-cover border border-gray-200" />
                  <span className="font-semibold text-gray-700">{teacher.username}</span>
                </div>
              )}
              {lesson.created_at && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>Posted {format(new Date(lesson.created_at), 'MMM d, yyyy')}</span>
                </div>
              )}
              {lesson.estimated_duration && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{lesson.estimated_duration} min read</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Topic with no linked lesson — show description only
          <div className="px-8 py-7">
            <h1 className="text-2xl font-bold text-slate-900">{currentTopic.title}</h1>
            {currentTopic.description && (
              <p className="text-slate-500 mt-2">{currentTopic.description}</p>
            )}
          </div>
        )}

        {/* Lesson content */}
        {lesson?.content && (
          <div className="rounded-2xl px-8">
            <LessonContent content={lesson.content} />
          </div>
        )}

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

        {/* Tutorials */}
        {tutorials.length > 0 && (
          <div className="flex flex-col gap-3 items-center">
            {tutorials.map((lt) => lt.tutorial && (
              <TutorialLaunchCard key={lt.id} tutorial={lt.tutorial} />
            ))}
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

        {badge && (
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-3 px-4 py-3 bg-purple-50 rounded-xl border border-purple-200">
              {badge.icon_url ? <img src={badge.icon_url} alt={badge.title} className="w-8 h-8 object-contain" /> : <Award className="w-7 h-7 text-purple-500" />}
              <div>
                <p className="text-xs font-semibold text-purple-700">Badge you can earn</p>
                <p className="text-sm font-bold text-purple-800">{badge.title}</p>
                {badge.description && <p className="text-xs text-purple-600 mt-0.5">{badge.description}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="flex flex-col items-center gap-4 py-4">
          {isCompleted ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-green-500" />
              </div>
              <p className="text-sm font-semibold text-green-700">Topic completed!</p>
              <button onClick={() => navigate('/student/learn')} className="text-sm text-blockly-purple hover:underline font-medium">← Back to Learning Journey</button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 w-full max-w-sm">
              {hasQuiz && !quizCompleted && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 w-full justify-center">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Complete the quiz above to finish this topic</span>
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
                  Finish Topic
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}