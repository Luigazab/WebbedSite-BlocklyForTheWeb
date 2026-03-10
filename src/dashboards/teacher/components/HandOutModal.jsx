import { useState, useEffect } from 'react'
import { fetchTeacherClassrooms, fetchLearnCategories, handOutLesson } from '../../../services/lessonService'
import { useAuth } from '../../../hooks/useAuth'

export default function HandOutModal({ lesson, onClose, onSuccess }) {
  const { user } = useAuth()
  const [mode, setMode] = useState('classroom') 
  const [classrooms, setClassrooms] = useState([])
  const [learnCategories, setLearnCategories] = useState([])
  const [selectedClassroom, setSelectedClassroom] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setFetchLoading(true)
      try {
        const [rooms, cats] = await Promise.all([
          fetchTeacherClassrooms(user.id),
          fetchLearnCategories(),
        ])
        setClassrooms(rooms || [])
        setLearnCategories(cats || [])
      } catch (err) {
        console.error(err)
      } finally {
        setFetchLoading(false)
      }
    }
    load()
  }, [user.id])

  const handleSubmit = async () => {
    setError('')
    if (mode === 'classroom' && !selectedClassroom) {
      setError('Please select a classroom.')
      return
    }
    if (mode === 'learn' && !selectedCategory) {
      setError('Please select a learn category.')
      return
    }

    setLoading(true)
    try {
      const assignment = {
        lesson_id: lesson.id,
        title: lesson.title,
        description: description || null,
        due_date: dueDate || null,
        created_by: user.id,
        assignment_type: 'lesson',
      }

      if (mode === 'classroom') {
        assignment.classroom_id = selectedClassroom
        assignment.learn_topic_id = null
      } else {
        // For learn page, we still need a classroom_id due to FK.
        // If there's a dedicated learn pathway, adapt accordingly.
        // For now, assign to first classroom or create a general one.
        // This is a UX placeholder — adapt to your learn_topics flow.
        assignment.classroom_id = classrooms[0]?.id
        assignment.learn_topic_id = selectedCategory
      }

      await handOutLesson(assignment)
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to hand out lesson.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-400">
          <div>
            <h2 className="text-base font-bold text-slate-800">Hand Out Lesson</h2>
            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{lesson.title}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl leading-none">
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Mode tabs */}
          <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
            {[
              { key: 'classroom', label: 'To Classroom' },
              { key: 'learn', label: 'To Learn Page' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setMode(tab.key)}
                className={`flex-1 py-2 px-3 text-sm font-semibold rounded-lg transition-all ${
                  mode === tab.key
                    ? 'bg-white text-blockly-blue shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {fetchLoading ? (
            <p className="text-sm text-slate-400 text-center py-4">Loading…</p>
          ) : (
            <>
              {/* Classroom select */}
              {mode === 'classroom' && (
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-1.5">
                    Select Classroom
                  </label>
                  {classrooms.length === 0 ? (
                    <p className="text-sm text-slate-400 bg-slate-50 p-3 rounded-lg">
                      You have no active classrooms yet.
                    </p>
                  ) : (
                    <select
                      value={selectedClassroom}
                      onChange={(e) => setSelectedClassroom(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blockly-blue bg-white"
                    >
                      <option value="">— Choose a classroom —</option>
                      {classrooms.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.class_code})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Learn category select */}
              {mode === 'learn' && (
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-1.5">
                    Select Category
                  </label>
                  {learnCategories.length === 0 ? (
                    <p className="text-sm text-slate-400 bg-slate-50 p-3 rounded-lg">
                      No learn categories set up yet. Ask your admin to create some.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {learnCategories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                            selectedCategory === cat.id
                              ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                              : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                          }`}
                        >
                          {cat.icon_url && (
                            <img src={cat.icon_url} alt="" className="w-5 h-5 object-contain" />
                          )}
                          <span className="text-xs font-bold">{cat.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Optional due date */}
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1.5">
                  Due Date <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blockly-blue bg-white"
                />
              </div>

              {/* Optional description / instructions */}
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1.5">
                  Instructions <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add any instructions for students…"
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blockly-blue bg-white resize-none"
                />
              </div>
            </>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="flex-1 btn py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl "
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || fetchLoading}
            className="flex-1 py-2.5 text-sm font-semibold btn-primary rounded-xl btn disabled:opacity-50 "
          >
            {loading ? 'Sending…' : 'Hand Out'}
          </button>
        </div>
      </div>
    </div>
  )
}