import { useState, useEffect } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { useLessonStore } from '../../../store/lessonStore'
import { lessonService } from '../../../services/lesson.service'
import { useUIStore } from '../../../store/uiStore'
import {
  X, Search, BookOpen, Clock, HelpCircle,
  Loader2, CalendarDays, CheckCircle2,
} from 'lucide-react'

export default function PostLessonModal({ classroomId, onClose, onSuccess }) {
  const profile  = useAuthStore((s) => s.profile)
  const addToast = useUIStore((s) => s.addToast)
  const { lessons, fetchTeacherLessons } = useLessonStore()

  const [search,    setSearch]    = useState('')
  const [selected,  setSelected]  = useState(null)
  const [dueDate,   setDueDate]   = useState('')
  const [posting,   setPosting]   = useState(false)

  useEffect(() => {
    if (profile?.id) fetchTeacherLessons(profile.id)
  }, [profile?.id])

  const filtered = lessons
    .filter((l) => l.is_published)
    .filter((l) => l.title.toLowerCase().includes(search.toLowerCase()))

  const handlePost = async () => {
    if (!selected) return
    setPosting(true)
    try {
      await lessonService.assignToClassroom({
        classroom_id:    classroomId,
        lesson_id:       selected.id,
        title:           selected.title,
        assignment_type: 'lesson',
        due_date:        dueDate || null,
        created_by:      profile.id,
      })
      addToast(`"${selected.title}" posted to classroom`, 'success')
      onSuccess?.()
      onClose()
    } catch (err) {
      addToast(err.message || 'Failed to post lesson', 'error')
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-800">Post a Lesson</h2>
            <p className="text-xs text-gray-400 mt-0.5">Pick from your published lessons</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 pt-4 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search lessons…"
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blockly-purple focus:ring-2 focus:ring-blockly-purple/10"
            />
          </div>
        </div>

        {/* Lesson list */}
        <div className="flex-1 overflow-y-auto px-6 py-3 flex flex-col gap-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">
              No published lessons found.{' '}
              <a href="/teacher/lessons/create" className="text-blockly-purple hover:underline font-medium">
                Create one
              </a>
            </p>
          ) : filtered.map((lesson) => {
            const quizCount = lesson.lesson_quizzes?.length ?? 0
            const isSelected = selected?.id === lesson.id
            return (
              <button
                key={lesson.id}
                onClick={() => setSelected(isSelected ? null : lesson)}
                className={`w-full text-left flex items-start gap-3 p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-blockly-purple bg-blockly-purple/5'
                    : 'border-gray-100 hover:border-gray-200 bg-white'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${isSelected ? 'bg-blockly-purple/10' : 'bg-gray-100'}`}>
                  <BookOpen className={`w-4 h-4 ${isSelected ? 'text-blockly-purple' : 'text-gray-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{lesson.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    {lesson.estimated_duration && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />{lesson.estimated_duration}m
                      </span>
                    )}
                    {quizCount > 0 && (
                      <span className="flex items-center gap-1 text-xs text-blockly-purple bg-purple-50 px-2 py-0.5 rounded-full">
                        <HelpCircle className="w-3 h-3" />Quiz
                      </span>
                    )}
                  </div>
                </div>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-blockly-purple shrink-0 mt-1" />}
              </button>
            )
          })}
        </div>

        {/* Due date + post */}
        {selected && (
          <div className="px-6 pb-6 pt-3 border-t border-gray-100 shrink-0 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-gray-400" />
                Due date <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blockly-purple focus:ring-2 focus:ring-blockly-purple/10"
              />
            </div>
            <button
              onClick={handlePost}
              disabled={posting}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blockly-purple text-white text-sm font-bold rounded-xl hover:bg-blockly-purple/90 disabled:opacity-50 transition-colors shadow-md shadow-blockly-purple/20"
            >
              {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
              Post "{selected.title}"
            </button>
          </div>
        )}
      </div>
    </div>
  )
}