import { useState, useEffect, useCallback } from 'react'
import { searchTeacherTutorials } from '../../../services/lessonService'
import { useNavigate } from 'react-router'
import { Search, LayoutList, Clock, ChevronRight, BookOpen } from 'lucide-react'

const DIFFICULTY_META = {
  beginner:     { label: 'Beginner',     color: 'bg-emerald-100 text-emerald-700' },
  intermediate: { label: 'Intermediate', color: 'bg-amber-100  text-amber-700'   },
  advanced:     { label: 'Advanced',     color: 'bg-red-100    text-red-700'      },
}

export default function AttachTutorialModal({
  teacherId,
  attachedTutorialIds = [],
  onAttach,
  onClose,
}) {
  const navigate   = useNavigate()
  const [search,   setSearch]   = useState('')
  const [tutorials,setTutorials]= useState([])
  const [loading,  setLoading]  = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await searchTeacherTutorials(teacherId, search)
      setTutorials(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [teacherId, search])

  useEffect(() => {
    const t = setTimeout(load, 300)
    return () => clearTimeout(t)
  }, [load])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-800">Attach a Tutorial</h2>
            <p className="text-xs text-slate-400 mt-0.5">Students will launch the editor and work through it step-by-step</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search your published tutorials…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blockly-blue bg-slate-50"
              autoFocus
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-6 py-3 space-y-2">
          {loading && (
            <p className="text-sm text-slate-400 text-center py-6">Searching…</p>
          )}

          {!loading && tutorials.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="w-8 h-8 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-slate-500 mb-3">
                {search ? 'No tutorials match your search.' : 'No published tutorials found.'}
              </p>
              <button
                onClick={() => { onClose(); navigate('/teacher/tutorials/create') }}
                className="px-4 py-2 text-sm font-semibold bg-blockly-blue text-white rounded-xl hover:bg-blockly-blue/90 transition-colors"
              >
                + Create a tutorial
              </button>
            </div>
          )}

          {tutorials.map((tut) => {
            const isAttached   = attachedTutorialIds.includes(tut.id)
            const stepCount    = tut.tutorial_steps?.length ?? 0
            const diff         = DIFFICULTY_META[tut.difficulty_level] ?? DIFFICULTY_META.beginner

            return (
              <div
                key={tut.id}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  isAttached
                    ? 'border-indigo-300 bg-indigo-50'
                    : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 cursor-pointer'
                }`}
                onClick={() => !isAttached && onAttach(tut)}
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-blockly-blue/10 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-blockly-blue" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{tut.title}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${diff.color}`}>
                      {diff.label}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-0.5">
                      <LayoutList size={11} /> {stepCount} step{stepCount !== 1 ? 's' : ''}
                    </span>
                    {tut.estimated_time_minutes && (
                      <span className="text-xs text-slate-400 flex items-center gap-0.5">
                        <Clock size={11} /> {tut.estimated_time_minutes}m
                      </span>
                    )}
                  </div>
                  {tut.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{tut.description}</p>
                  )}
                </div>

                {/* Action */}
                {isAttached ? (
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-100 px-2.5 py-1 rounded-full shrink-0">
                    Attached
                  </span>
                ) : (
                  <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 px-3 py-1.5 border border-indigo-200 rounded-lg hover:bg-indigo-50 flex items-center gap-1 shrink-0">
                    Attach <ChevronRight size={12} />
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center">
          <button
            onClick={() => { onClose(); navigate('/teacher/tutorials/create') }}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            + Create new tutorial
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}