import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuthStore } from '../../../store/authStore'
import { useLessonStore } from '../../../store/lessonStore'
import { useLesson } from '../../../hooks/useLesson'
import PageWrapper from '../../../components/layout/PageWrapper'
import LessonCard from '../components/LessonCard'
import {
  Plus, Loader2, BookOpen,
  Search, Filter, X
} from 'lucide-react'

const FILTERS = ['All', 'Published', 'Draft', 'Has Quiz']

export default function Lessons() {
  const navigate = useNavigate()
  const profile = useAuthStore((state) => state.profile)
  const { lessons, loading, fetchTeacherLessons } = useLessonStore()
  const { handleDeleteLesson, handleTogglePublish } = useLesson()

  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')

  useEffect(() => {
    if (profile?.id) fetchTeacherLessons(profile.id)
  }, [profile?.id])

  const filtered = lessons.filter((lesson) => {
    const matchesSearch =
      lesson.title.toLowerCase().includes(search.toLowerCase()) ||
      lesson.classroom?.name?.toLowerCase().includes(search.toLowerCase())

    const matchesFilter =
      activeFilter === 'All' ||
      (activeFilter === 'Published' && lesson.is_published) ||
      (activeFilter === 'Draft' && !lesson.is_published) ||
      (activeFilter === 'Has Quiz' && lesson.has_quiz)

    return matchesSearch && matchesFilter
  })

  // Group by classroom
  const grouped = filtered.reduce((acc, lesson) => {
    const key = lesson.classroom?.name ?? 'Unassigned'
    if (!acc[key]) acc[key] = []
    acc[key].push(lesson)
    return acc
  }, {})

  return (
    <PageWrapper
      title="Lessons"
      subtitle="Create and manage lessons for your classrooms"
      actions={
        <button
          onClick={() => navigate('/teacher/lessons/create')}
          className="flex items-center btn gap-2 px-4 py-2 bg-blockly-purple text-white text-sm font-semibold rounded-lg hover:bg-blockly-purple/90"
        >
          <Plus className="w-4 h-4" />
          New Lesson
        </button>
      }
    >
      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search lessons or classrooms..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blockly-purple focus:ring-2 focus:ring-blockly-purple/10 transition"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <div className="flex gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
                  ${activeFilter === f
                    ? 'bg-blockly-purple text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats row */}
      {!loading && lessons.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total" value={lessons.length} color="gray" />
          <StatCard
            label="Published"
            value={lessons.filter((l) => l.is_published).length}
            color="green"
          />
          <StatCard
            label="Drafts"
            value={lessons.filter((l) => !l.is_published).length}
            color="orange"
          />
          <StatCard
            label="With Quiz"
            value={lessons.filter((l) => l.has_quiz).length}
            color="purple"
          />
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
        </div>
      ) : lessons.length === 0 ? (
        <EmptyState onCreateClick={() => navigate('/teacher/lessons/create')} />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Search className="w-8 h-8 text-gray-200" />
          <p className="text-gray-400 text-sm">No lessons match your search.</p>
          <button
            onClick={() => { setSearch(''); setActiveFilter('All') }}
            className="text-sm text-blockly-purple hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {Object.entries(grouped).map(([classroomName, classroomLessons]) => (
            <div key={classroomName} className="flex flex-col gap-3">
              {/* Classroom group header */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blockly-purple" />
                  <h3 className="text-sm font-bold text-gray-700">{classroomName}</h3>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {classroomLessons.length}
                  </span>
                </div>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {classroomLessons.map((lesson) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    onEdit={() => navigate(`/teacher/lessons/${lesson.id}/edit`)}
                    onDelete={() => handleDeleteLesson(lesson.id, lesson.title)}
                    onTogglePublish={() => handleTogglePublish(lesson)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  )
}

function StatCard({ label, value, color }) {
  const colors = {
    gray:   'bg-gray-50   text-gray-700   border-gray-100',
    green:  'bg-green-50  text-green-700  border-green-100',
    orange: 'bg-orange-50 text-orange-700 border-orange-100',
    purple: 'bg-blockly-purple/5 text-blockly-purple border-blockly-purple/10',
  }
  return (
    <div className={`rounded-xl border px-4 py-3 ${colors[color]}`}>
      <p className="text-2xl font-black">{value}</p>
      <p className="text-xs font-medium opacity-70 mt-0.5">{label}</p>
    </div>
  )
}

function EmptyState({ onCreateClick }) {
  return (
    <div className="flex flex-col bg-gray-200 rounded-3xl items-center justify-center py-20 gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-blockly-purple/10 flex items-center justify-center">
        <BookOpen className="w-8 h-8 text-blockly-purple" />
      </div>
      <div>
        <p className="font-semibold text-gray-800">No lessons yet</p>
        <p className="text-sm text-gray-400 mt-1">
          Create your first lesson to share with your students
        </p>
      </div>
      <button
        onClick={onCreateClick}
        className="flex items-center btn gap-2 px-4 py-2 bg-blockly-purple text-white text-sm font-semibold rounded-lg hover:bg-blockly-purple/90"
      >
        <Plus className="w-4 h-4" />
        Create a Lesson
      </button>
    </div>
  )
}