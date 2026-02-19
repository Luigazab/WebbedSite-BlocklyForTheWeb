import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useAuthStore } from '../../../store/authStore'
import { useClassroomStore } from '../../../store/classroomStore'
import { useLessonStore } from '../../../store/lessonStore'
import { useLesson } from '../../../hooks/useLesson'
import PageWrapper from '../../../components/layout/PageWrapper'
import QuizBuilder from '../components/QuizBuilder'
import {
  ChevronLeft, Save, Eye, EyeOff,
  Loader2, BookOpen, HelpCircle
} from 'lucide-react'

const EMPTY_LESSON = {
  title: '',
  content: '',
  classroom_id: '',
  has_quiz: false,
  is_published: false,
  order_index: 0,
}

const EMPTY_QUIZ = {
  title: '',
  questions: [],
}

export default function CreateLesson() {
  const { lessonId } = useParams()       // present when editing
  const isEditing = !!lessonId
  const navigate = useNavigate()
  const profile = useAuthStore((state) => state.profile)
  const { classrooms, fetchTeacherClassrooms } = useClassroomStore()
  const { currentLesson, fetchLesson } = useLessonStore()
  const { handleCreateLesson, handleUpdateLesson } = useLesson()

  const [lesson, setLesson] = useState(EMPTY_LESSON)
  const [quiz, setQuiz] = useState(EMPTY_QUIZ)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('content')  // 'content' | 'quiz'

  useEffect(() => {
    if (profile?.id) fetchTeacherClassrooms(profile.id)
    if (isEditing) fetchLesson(lessonId)
  }, [profile?.id, lessonId])

  // Populate form when editing
  useEffect(() => {
    if (isEditing && currentLesson) {
      setLesson({
        title: currentLesson.title,
        content: currentLesson.content,
        classroom_id: currentLesson.classroom_id,
        has_quiz: currentLesson.has_quiz,
        is_published: currentLesson.is_published,
        order_index: currentLesson.order_index,
      })
      if (currentLesson.quizzes?.[0]) {
        const q = currentLesson.quizzes[0]
        setQuiz({
          title: q.title,
          questions: q.quiz_questions ?? [],
        })
      }
    }
  }, [currentLesson])

  const setField = (key, value) => setLesson((prev) => ({ ...prev, [key]: value }))

  const handleSave = async (publish = null) => {
    if (!lesson.title.trim() || !lesson.classroom_id) return
    setSaving(true)
    try {
      const payload = {
        ...lesson,
        is_published: publish !== null ? publish : lesson.is_published,
      }
      if (isEditing) {
        await handleUpdateLesson(
          lessonId,
          payload,
          quiz,
          currentLesson?.quizzes?.[0]?.id ?? null
        )
      } else {
        const created = await handleCreateLesson(payload, quiz)
        navigate(`/teacher/lessons/${created.id}/edit`, { replace: true })
      }
    } finally {
      setSaving(false)
    }
  }

  const togglePublish = () => handleSave(!lesson.is_published)

  return (
    <PageWrapper
      title={isEditing ? 'Edit Lesson' : 'Create Lesson'}
      subtitle={isEditing ? currentLesson?.title : 'Write your lesson and optionally attach a quiz'}
    >
      <div className="md:min-w-4xl mx-auto flex flex-col gap-5">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors w-fit"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        {/* Top bar — classroom select + actions */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
          <div className="flex-1">
            <label className="text-lg font-semibold text-gray-500 mb-1">Classroom</label>
            <select
              value={lesson.classroom_id}
              onChange={(e) => setField('classroom_id', e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blockly-purple focus:ring-2 focus:ring-blockly-purple/10 transition"
            >
              <option value="">Select a classroom...</option>
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={togglePublish}
              disabled={saving || !lesson.title.trim() || !lesson.classroom_id}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border transition-colors
                ${lesson.is_published
                  ? 'border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100'
                  : 'border-green-200 bg-green-50 text-green-600 hover:bg-green-100'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {lesson.is_published ? (
                <><EyeOff className="w-4 h-4" />Unpublish</>
              ) : (
                <><Eye className="w-4 h-4" />Publish</>
              )}
            </button>

            <button
              onClick={() => handleSave()}
              disabled={saving || !lesson.title.trim() || !lesson.classroom_id}
              className="flex items-center gap-2 px-4 py-2 bg-blockly-purple text-white text-sm font-semibold rounded-lg hover:bg-blockly-purple/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('content')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors
              ${activeTab === 'content'
                ? 'bg-white text-blockly-purple shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <BookOpen className="w-4 h-4" />
            Content
          </button>
          <button
            onClick={() => { setActiveTab('quiz'); setField('has_quiz', true) }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors
              ${activeTab === 'quiz'
                ? 'bg-white text-blockly-purple shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <HelpCircle className="w-4 h-4" />
            Quiz
            {lesson.has_quiz && quiz.questions.length > 0 && (
              <span className="bg-blockly-purple text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {quiz.questions.length}
              </span>
            )}
          </button>
        </div>

        {/* Content tab */}
        {activeTab === 'content' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Lesson Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={lesson.title}
                onChange={(e) => setField('title', e.target.value)}
                placeholder="e.g. Introduction to HTML Tags"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-base font-semibold focus:outline-none focus:border-blockly-purple focus:ring-2 focus:ring-blockly-purple/10 transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Lesson Content</label>
              <p className="text-xs text-gray-400">HTML is supported</p>
              <textarea
                value={lesson.content}
                onChange={(e) => setField('content', e.target.value)}
                placeholder="Write your lesson here..."
                rows={16}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-blockly-purple focus:ring-2 focus:ring-blockly-purple/10 transition resize-y"
              />
            </div>

            <div className="flex items-center gap-4 pt-2 border-t border-gray-50">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500">Order Index</label>
                <input
                  type="number"
                  min={0}
                  value={lesson.order_index}
                  onChange={(e) => setField('order_index', Number(e.target.value))}
                  className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blockly-purple transition"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer mt-4">
                <input
                  type="checkbox"
                  checked={lesson.has_quiz}
                  onChange={(e) => {
                    setField('has_quiz', e.target.checked)
                    if (e.target.checked) setActiveTab('quiz')
                  }}
                  className="w-4 h-4 accent-blockly-purple"
                />
                <span className="text-sm text-gray-600 font-medium">Attach a quiz to this lesson</span>
              </label>
            </div>
          </div>
        )}

        {/* Quiz tab */}
        {activeTab === 'quiz' && (
          <QuizBuilder
            quiz={quiz}
            onChange={setQuiz}
            onDisable={() => {
              setField('has_quiz', false)
              setActiveTab('content')
            }}
          />
        )}
      </div>
    </PageWrapper>
  )
}