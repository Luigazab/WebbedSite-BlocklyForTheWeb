import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useAuthStore } from '../../../store/authStore'
import { useLessonStore } from '../../../store/lessonStore'
import { useLesson } from '../../../hooks/useLesson'
import ReactMarkdown from 'react-markdown'
import {
  ArrowLeft, Clock, CheckCircle, Loader2, FileText,
  Paperclip, Download, ExternalLink, Award,
  User, Calendar
} from 'lucide-react'
import { format } from 'date-fns'
import QuizSection from '../components/QuizSection'

export default function LessonViewer() {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const { currentLesson, lessonProgress, loading, fetchLesson, fetchProgress } = useLessonStore()
  const { handleUpdateProgress } = useLesson()

  const contentRef = useRef(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [hasQuiz, setHasQuiz] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [timeSpent, setTimeSpent] = useState(0)
  const progressUpdateTimer = useRef(null)
  const timeTracker = useRef(null)

  useEffect(() => {
    if (lessonId && profile?.id) {
      fetchLesson(lessonId)
      fetchProgress(profile.id, lessonId)
    }
  }, [lessonId, profile?.id])

  useEffect(() => {
    if (currentLesson) {
      setHasQuiz(currentLesson.quizzes && currentLesson.quizzes.length > 0)
      
      // Restore scroll position
      const savedProgress = lessonProgress[lessonId]
      if (savedProgress?.scroll_position && contentRef.current) {
        setTimeout(() => {
          contentRef.current.scrollTo(0, savedProgress.scroll_position)
        }, 100)
      }
    }
  }, [currentLesson, lessonId])

  // Track time spent
  useEffect(() => {
    timeTracker.current = setInterval(() => {
      setTimeSpent((prev) => prev + 1)
    }, 1000)

    return () => {
      if (timeTracker.current) clearInterval(timeTracker.current)
    }
  }, [])

  // Handle scroll progress
  const handleScroll = () => {
    if (!contentRef.current) return

    const element = contentRef.current
    const scrollTop = element.scrollTop
    const scrollHeight = element.scrollHeight - element.clientHeight

    if (scrollHeight === 0) {
      setScrollProgress(100)
      return
    }

    const progress = Math.round((scrollTop / scrollHeight) * 100)
    setScrollProgress(Math.min(100, Math.max(0, progress)))

    // Debounce progress updates
    if (progressUpdateTimer.current) {
      clearTimeout(progressUpdateTimer.current)
    }

    progressUpdateTimer.current = setTimeout(() => {
      saveProgress(progress, scrollTop)
    }, 2000) // Save every 2 seconds after user stops scrolling
  }

  const saveProgress = async (progressPercentage, scrollPosition) => {
    if (!profile?.id || !lessonId) return

    // If quiz exists and is completed, progress is 100%
    const finalProgress = hasQuiz && quizCompleted ? 100 : progressPercentage

    await handleUpdateProgress(lessonId, {
      progress_percentage: finalProgress,
      scroll_position: scrollPosition,
      time_spent: timeSpent,
    })
  }

  // Save progress before leaving
  useEffect(() => {
    return () => {
      if (progressUpdateTimer.current) {
        clearTimeout(progressUpdateTimer.current)
      }
      if (contentRef.current && profile?.id && lessonId) {
        const scrollTop = contentRef.current.scrollTop
        handleUpdateProgress(lessonId, {
          progress_percentage: hasQuiz && quizCompleted ? 100 : scrollProgress,
          scroll_position: scrollTop,
          time_spent: timeSpent,
        })
      }
    }
  }, [scrollProgress, timeSpent, hasQuiz, quizCompleted])

  const handleQuizComplete = (passed) => {
    if (passed) {
      setQuizCompleted(true)
      // Auto-set progress to 100% when quiz is passed
      handleUpdateProgress(lessonId, {
        progress_percentage: 100,
        scroll_position: contentRef.current?.scrollTop || 0,
        time_spent: timeSpent,
      })
    }
  }

  const currentProgress = lessonProgress[lessonId]?.progress_percentage || scrollProgress
  const isCompleted = currentProgress >= 100

  if (loading && !currentLesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blockly-purple" />
      </div>
    )
  }

  if (!currentLesson) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Lesson not found</p>
        <button
          onClick={() => navigate(-1)}
          className="btn px-4 py-2 bg-blockly-purple text-white rounded-lg text-sm font-semibold"
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Back button + Title */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <button
                onClick={() => navigate(-1)}
                className="btn p-2 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-bold text-gray-900 truncate">
                  {currentLesson.title}
                </h1>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                  {currentLesson.teacher && (
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {currentLesson.teacher.username}
                    </div>
                  )}
                  {currentLesson.estimated_duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {currentLesson.estimated_duration} min
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <p className="text-xs text-gray-500">Progress</p>
                <p className="text-sm font-bold text-blockly-purple">
                  {currentProgress}%
                </p>
              </div>
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blockly-purple transition-all duration-300"
                  style={{ width: `${currentProgress}%` }}
                />
              </div>
              {isCompleted && (
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lesson Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Content area with scroll tracking */}
              <div
                ref={contentRef}
                onScroll={handleScroll}
                className="prose prose-sm max-w-none p-8 max-h-[70vh] overflow-y-auto"
              >
                <ReactMarkdown>{currentLesson.content_markdown}</ReactMarkdown>

                {/* Scroll indicator at bottom */}
                {scrollProgress < 95 && (
                  <div className="mt-12 p-4 bg-blue-50 border border-blue-100 rounded-lg text-center">
                    <p className="text-sm text-blue-800">
                      Keep scrolling to track your progress! 📚
                    </p>
                  </div>
                )}
              </div>

              {/* Quiz Section */}
              {hasQuiz && currentLesson.quizzes && (
                <div className="border-t border-gray-100">
                  {currentLesson.quizzes.map((lessonQuiz) => (
                    <QuizSection
                      key={lessonQuiz.quiz.id}
                      quiz={lessonQuiz.quiz}
                      onComplete={handleQuizComplete}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            {/* Lesson Info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
              <h3 className="font-bold text-gray-900">Lesson Info</h3>

              {currentLesson.teacher && (
                <div className="flex items-center gap-3">
                  <img
                    src={currentLesson.teacher.avatar_url || '/default-avatar.png'}
                    alt={currentLesson.teacher.username}
                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {currentLesson.teacher.username}
                    </p>
                    <p className="text-xs text-gray-400">Teacher</p>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                {currentLesson.estimated_duration && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Duration</span>
                    <span className="font-semibold text-gray-700">
                      {currentLesson.estimated_duration} minutes
                    </span>
                  </div>
                )}

                {currentProgress > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Your Progress</span>
                    <span className="font-semibold text-blockly-purple">
                      {currentProgress}%
                    </span>
                  </div>
                )}

                {timeSpent > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Time Spent</span>
                    <span className="font-semibold text-gray-700">
                      {Math.floor(timeSpent / 60)}m {timeSpent % 60}s
                    </span>
                  </div>
                )}
              </div>

              {hasQuiz && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-lg">
                  <Award className="w-4 h-4 text-green-600 shrink-0" />
                  <p className="text-xs text-green-700">
                    Complete the quiz to finish this lesson
                  </p>
                </div>
              )}
            </div>

            {/* Attachments */}
            {currentLesson.attachments && currentLesson.attachments.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Paperclip className="w-4 h-4" />
                  Attachments
                </h3>

                <div className="flex flex-col gap-2">
                  {currentLesson.attachments.map((attachment) => (
                    <AttachmentItem key={attachment.id} attachment={attachment} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────
// Attachment Item Component
// ──────────────────────────────────────────────────────────
function AttachmentItem({ attachment }) {
  const getIcon = () => {
    switch (attachment.file_type) {
      case 'pdf':
        return FileText
      case 'link':
        return ExternalLink
      default:
        return Download
    }
  }

  const Icon = getIcon()

  return (
    <a
      href={attachment.file_url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blockly-purple hover:bg-blockly-purple/5 transition-all group"
    >
      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-blockly-purple/10 transition-colors">
        <Icon className="w-4 h-4 text-gray-600 group-hover:text-blockly-purple transition-colors" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-blockly-purple transition-colors">
          {attachment.file_name}
        </p>
        {attachment.file_size && (
          <p className="text-xs text-gray-400">
            {formatFileSize(attachment.file_size)}
          </p>
        )}
      </div>
    </a>
  )
}

function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}