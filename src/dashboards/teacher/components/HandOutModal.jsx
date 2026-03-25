import React, { useState, useEffect } from 'react'
import { X, BookOpen, GraduationCap, ChevronDown } from 'lucide-react'
import { handOutLesson, fetchTeacherClassrooms } from '../../../services/lessonService'
import {
  publishLessonAsLearnTopic,
  fetchLearnCategories,
  fetchAllLearnTopicsForPrereq,
} from '../../../services/learnService'

const TABS = [
  { id: 'lesson', label: 'Hand Out to Classroom', icon: BookOpen },
  { id: 'topic',  label: 'Add as Learn Topic',    icon: GraduationCap },
]

export default function HandOutModal({ lesson, onClose, onSuccess, teacherId }) {
  const [tab, setTab] = useState('lesson')

  // ── Lesson tab ────────────────────────────────────────────────────────────
  const [classrooms, setClassrooms] = useState([])
  const [selectedClassroom, setSelectedClassroom] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [loadingClassrooms, setLoadingClassrooms] = useState(true)

  // ── Topic tab ─────────────────────────────────────────────────────────────
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [allTopics, setAllTopics] = useState([])   // existing topics for prereq dropdown
  const [prerequisiteTopicId, setPrerequisiteTopicId] = useState('none')
  const [loadingTopicData, setLoadingTopicData] = useState(false)

  // ── UI ────────────────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Load classrooms + categories + existing topics once
  useEffect(() => {
    const load = async () => {
      setLoadingClassrooms(true)
      setLoadingTopicData(true)
      try {
        const [cls, cats, topics] = await Promise.all([
          fetchTeacherClassrooms(teacherId),
          fetchLearnCategories(),
          fetchAllLearnTopicsForPrereq(),
        ])
        setClassrooms(cls)
        setCategories(cats)
        setAllTopics(topics)
        if (cats.length) setSelectedCategory(cats[0].id)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoadingClassrooms(false)
        setLoadingTopicData(false)
      }
    }
    load()
  }, [teacherId])

  const handleSubmit = async () => {
    setError('')

    if (tab === 'lesson') {
      if (!selectedClassroom) { setError('Please select a classroom.'); return }
    } else {
      if (!selectedCategory) { setError('Please select a category.'); return }
    }

    setSubmitting(true)
    try {
      if (tab === 'lesson') {
        await handOutLesson({
          classroom_id: selectedClassroom,
          lesson_id: lesson.id,
          assignment_type: 'lesson',
          title: lesson.title,
          due_date: dueDate || null,
          created_by: teacherId,
        })
      } else {
        // Global publish — no classroom involved
        await publishLessonAsLearnTopic({
          lessonId: lesson.id,
          categoryId: selectedCategory,
          title: lesson.title,
          description: lesson.description ?? null,
          estimatedDuration: lesson.estimated_duration ?? null,
          prerequisiteTopicId: prerequisiteTopicId === 'none' ? null : prerequisiteTopicId,
        })
      }
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-base font-black text-slate-800">Distribute Lesson</h2>
            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{lesson.title}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-5">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setTab(id); setError('') }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
                tab === id
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-4">

          {/* ── LESSON TAB ─────────────────────────────────────────────── */}
          {tab === 'lesson' && (
            <>
              <p className="text-xs text-slate-500 bg-slate-50 rounded-xl p-3 border border-slate-200">
                Hands out this lesson exclusively to a classroom. Only enrolled students can access it.
              </p>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1.5 flex">
                  Classroom <span className="text-red-500 ml-0.5">*</span>
                </label>
                {loadingClassrooms ? (
                  <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
                ) : classrooms.length === 0 ? (
                  <p className="text-xs text-slate-400 p-3 bg-slate-50 rounded-xl">No active classrooms found.</p>
                ) : (
                  <div className="relative">
                    <select
                      value={selectedClassroom}
                      onChange={(e) => setSelectedClassroom(e.target.value)}
                      className="w-full appearance-none px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white pr-9"
                    >
                      <option value="">Select a classroom…</option>
                      {classrooms.map((c) => (
                        <option key={c.id} value={c.id}>{c.name} ({c.class_code})</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1.5 flex">
                  Due Date <span className="ml-1 font-normal text-slate-400">(optional)</span>
                </label>
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                />
              </div>
            </>
          )}

          {/* ── TOPIC TAB ──────────────────────────────────────────────── */}
          {tab === 'topic' && (
            <>
              <p className="text-xs text-slate-500 bg-indigo-50 rounded-xl p-3 border border-indigo-100">
                Publishes this lesson as a <strong>Learn topic</strong> visible to <strong>all students</strong> on the Learn page. No classroom required — no deadline.
              </p>

              {/* Category */}
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1.5 flex">
                  Category <span className="text-red-500 ml-0.5">*</span>
                </label>
                {loadingTopicData ? (
                  <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
                ) : (
                  <div className="relative">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full appearance-none px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white pr-9"
                    >
                      <option value="">Select a category…</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                )}
              </div>

              {/* Prerequisite — picks from ALL existing learn topics */}
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1.5 flex gap-1 flex-wrap">
                  Prerequisite Topic
                  <span className="font-normal text-slate-400">— students must complete this first</span>
                </label>
                {loadingTopicData ? (
                  <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
                ) : (
                  <div className="relative">
                    <select
                      value={prerequisiteTopicId}
                      onChange={(e) => setPrerequisiteTopicId(e.target.value)}
                      className="w-full appearance-none px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white pr-9"
                    >
                      <option value="none">None — always unlocked</option>
                      {allTopics
                        .filter((t) => t.id !== lesson.id) // exclude self
                        .map((t) => (
                          <option key={t.id} value={t.id}>{t.title}</option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                )}
                {allTopics.filter((t) => t.id !== lesson.id).length === 0 && !loadingTopicData && (
                  <p className="text-xs text-slate-400 mt-1">No other topics published yet — this will be unlocked by default.</p>
                )}
              </div>
            </>
          )}

          {error && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {submitting
                ? 'Saving…'
                : tab === 'lesson'
                ? 'Hand Out'
                : 'Publish to Learn'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}