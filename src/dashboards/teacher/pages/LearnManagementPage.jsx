import { useState, useEffect, useCallback } from 'react'
import { useLearnStore } from '../../../store/learnStore'
import { useAuthStore } from '../../../store/authStore'
import { useUIStore } from '../../../store/uiStore'
import {
  ChevronUp, ChevronDown, Trash2, Users, BookOpen,
  AlertTriangle, X, ChevronDown as ExpandIcon, Check,
  Loader2, Link2, Link2Off, RefreshCw,
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { updateTopicOrder } from '../../../services/learnService'

// ─── Prerequisite picker ──────────────────────────────────────────────────────
function PrereqPicker({ topic, allTopics, onSave, saving }) {
  const [open,  setOpen]  = useState(false)
  const [value, setValue] = useState(topic.prerequisite_topic ?? 'none')

  const options = allTopics.filter(
    (t) => t.id !== topic.id && t.category_id === topic.category_id
  )
  const current = allTopics.find((t) => t.id === value)

  const handleSave = async () => {
    await onSave(topic.id, value === 'none' ? null : value)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors max-w-[160px] truncate"
      >
        {value === 'none' ? (
          <><Link2Off size={12} className="text-gray-400 shrink-0" /><span className="text-gray-400 truncate">No prerequisite</span></>
        ) : (
          <><Link2 size={12} className="text-indigo-500 shrink-0" /><span className="text-indigo-700 font-semibold truncate">{current?.title ?? value}</span></>
        )}
        <ExpandIcon size={10} className="ml-auto text-gray-400 shrink-0" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden">
          <div className="p-2 space-y-0.5 max-h-48 overflow-y-auto">
            <button
              onClick={() => setValue('none')}
              className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors ${value === 'none' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-gray-50 text-gray-600'}`}
            >
              None — always unlocked
            </button>
            {options.length === 0 && (
              <p className="px-3 py-2 text-xs text-gray-400">No other topics in same category</p>
            )}
            {options.map((t) => (
              <button
                key={t.id}
                onClick={() => setValue(t.id)}
                className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors ${value === t.id ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-gray-50 text-gray-600'}`}
              >
                {t.title}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 p-2 border-t border-gray-100">
            <button onClick={() => setOpen(false)} className="flex-1 py-1.5 text-xs text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-1.5 text-xs text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-1"
            >
              {saving ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />}
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Student progress panel ───────────────────────────────────────────────────
function StudentProgressPanel({ topicId, topicTitle, onClose }) {
  const { topicStudentProgress, fetchTopicStudentProgress } = useLearnStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      await fetchTopicStudentProgress(topicId)
      setLoading(false)
    }
    load()
  }, [topicId])

  const completedCount = topicStudentProgress.filter((p) => p.completed_at).length

  return (
    <div className="fixed inset-0 z-50 flex items-stretch">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-md bg-white shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Student Progress</p>
            <h2 className="text-base font-black text-gray-900 truncate">{topicTitle}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
          </div>
        ) : topicStudentProgress.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
            <Users size={36} className="text-gray-200" />
            <p className="text-sm text-gray-400">No students have started this topic yet.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="px-6 py-3 border-b border-gray-50 bg-gray-50">
              <p className="text-xs text-gray-500">
                <span className="font-black text-gray-800">{completedCount}</span> of {topicStudentProgress.length} students completed
              </p>
              <div className="h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${topicStudentProgress.length ? (completedCount / topicStudentProgress.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="divide-y divide-gray-50">
              {topicStudentProgress.map((row) => {
                const pct = row.progress_percentage ?? 0
                const done = !!row.completed_at
                return (
                  <div key={row.id} className="flex items-center gap-3 px-6 py-3">
                    <img
                      src={row.student?.avatar_url || '/default-avatar.png'}
                      alt={row.student?.username}
                      className="w-8 h-8 rounded-full object-cover border border-gray-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{row.student?.username}</p>
                      <p className="text-xs text-gray-400">
                        Last seen {formatDistanceToNow(new Date(row.last_accessed), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${done ? 'bg-green-500' : 'bg-indigo-500'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-500 w-8 text-right">{pct}%</span>
                      </div>
                      {done && (
                        <span className="text-[10px] font-bold text-green-600">
                          ✓ {format(new Date(row.completed_at), 'MMM d')}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Remove confirm ───────────────────────────────────────────────────────────
function RemoveConfirm({ topic, dependents, loading, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h2 className="text-base font-black text-red-600 mb-2">Remove Topic?</h2>
        <p className="text-sm text-gray-600 mb-3">
          <strong>"{topic.title}"</strong> will be removed from the Learn page permanently.
        </p>
        {dependents.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex gap-2">
            <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-800 mb-1">These topics will lose their prerequisite:</p>
              {dependents.map((d) => (
                <p key={d.id} className="text-xs text-amber-700">• {d.title}</p>
              ))}
              <p className="text-xs text-amber-600 mt-1">They will become unlocked for all students.</p>
            </div>
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function LearnManagementPage() {
  const profile = useAuthStore((s) => s.profile)
  const addToast = useUIStore((s) => s.addToast)
  const { managementTopics, managementLoading, fetchManagementTopics, updatePrerequisite, removeTopic } = useLearnStore()

  const [categories, setCategories] = useState([])
  const [prereqSaving, setPrereqSaving] = useState(null)   // topicId being saved
  const [progressTopic, setProgressTopic] = useState(null) // {id, title}
  const [removeTarget,  setRemoveTarget]  = useState(null) // topic to remove
  const [removing,      setRemoving]      = useState(false)

  // Local order state (mirrors managementTopics, allows drag/reorder)
  const [orderedTopics, setOrderedTopics] = useState([])

  useEffect(() => {
    fetchManagementTopics()
  }, [])

  useEffect(() => {
    setOrderedTopics(managementTopics)

    // Extract unique categories from topics
    const catMap = {}
    for (const t of managementTopics) {
      if (!catMap[t.category_id]) {
        catMap[t.category_id] = { id: t.category_id, title: t.category_id }
      }
    }
    setCategories(Object.values(catMap))
  }, [managementTopics])

  const moveTopicInCategory = useCallback(async (topicId, direction) => {
    setOrderedTopics((prev) => {
      const list = [...prev]
      const idx = list.findIndex((t) => t.id === topicId)
      if (idx < 0) return prev

      const cat = list[idx].category_id

      const catItems = list
        .map((t, i) => ({ t, i }))
        .filter(({ t }) => t.category_id === cat)

      const posInCat = catItems.findIndex(({ t }) => t.id === topicId)
      const swapPos = posInCat + direction

      if (swapPos < 0 || swapPos >= catItems.length) return prev

      const swapIdx = catItems[swapPos].i

      ;[list[idx], list[swapIdx]] = [list[swapIdx], list[idx]]

      const reordered = list
        .filter(t => t.category_id === cat)
        .map((t, i) => ({
          id: t.id,
          order_index: i
        }))

      updateTopicOrder(reordered).catch(err => {
        console.error(err)
        addToast('Failed saving order', 'error')
      })

      return list
    })
  }, [addToast])

  const handlePrereqSave = async (topicId, prereqId) => {
    setPrereqSaving(topicId)
    try {
      await updatePrerequisite(topicId, prereqId)
      addToast('Prerequisite updated', 'success')
    } catch (err) {
      addToast(err.message || 'Failed to update prerequisite', 'error')
    } finally {
      setPrereqSaving(null)
    }
  }

  const handleRemoveConfirm = async () => {
    if (!removeTarget) return
    setRemoving(true)
    try {
      const { unlinkedTitles } = await removeTopic(removeTarget.id)
      if (unlinkedTitles.length > 0) {
        addToast(
          `"${removeTarget.title}" removed. ${unlinkedTitles.length} topic(s) had their prerequisite cleared.`,
          'info'
        )
      } else {
        addToast(`"${removeTarget.title}" removed.`, 'info')
      }
      setRemoveTarget(null)
    } catch (err) {
      addToast(err.message || 'Failed to remove topic', 'error')
    } finally {
      setRemoving(false)
    }
  }

  // Compute dependents for the remove confirm dialog
  const removeDependents = removeTarget
    ? orderedTopics.filter((t) => t.prerequisite_topic === removeTarget.id)
    : []

  // Group by category
  const topicsByCategory = {}
  for (const t of orderedTopics) {
    if (!topicsByCategory[t.category_id]) topicsByCategory[t.category_id] = []
    topicsByCategory[t.category_id].push(t)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Learn Page Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage topic order, prerequisites, and student progress.</p>
        </div>
        <button
          onClick={() => fetchManagementTopics()}
          disabled={managementLoading}
          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={13} className={managementLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {managementLoading && orderedTopics.length === 0 ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
        </div>
      ) : orderedTopics.length === 0 ? (
        <div className="text-center py-20 text-slate-400 text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          No topics published yet. Use "Add as Learn Topic" from Class Materials to publish lessons here.
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(topicsByCategory).map(([catId, catTopics]) => (
            <section key={catId}>
              <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 px-1">{catId}</h2>
              <div className="space-y-2">
                {catTopics.map((topic, idxInCat) => (
                  <div
                    key={topic.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-all"
                  >
                    {/* Order controls */}
                    <div className="flex flex-col gap-0.5 shrink-0">
                      <button
                        onClick={() => moveTopicInCategory(topic.id, -1)}
                        disabled={idxInCat === 0}
                        className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-20 transition-colors"
                      >
                        <ChevronUp size={15} />
                      </button>
                      <button
                        onClick={() => moveTopicInCategory(topic.id, 1)}
                        disabled={idxInCat === catTopics.length - 1}
                        className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-20 transition-colors"
                      >
                        <ChevronDown size={15} />
                      </button>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{topic.title}</p>
                      {topic.lesson && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate">
                          Lesson by {topic.lesson.teacher?.username ?? '—'}
                        </p>
                      )}
                    </div>

                    {/* Prereq picker */}
                    <div className="shrink-0">
                      <PrereqPicker
                        topic={topic}
                        allTopics={orderedTopics}
                        onSave={handlePrereqSave}
                        saving={prereqSaving === topic.id}
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setProgressTopic({ id: topic.id, title: topic.title })}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                      >
                        <Users size={13} />
                        Progress
                      </button>
                      <button
                        onClick={() => setRemoveTarget(topic)}
                        className="p-2 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Student progress drawer */}
      {progressTopic && (
        <StudentProgressPanel
          topicId={progressTopic.id}
          topicTitle={progressTopic.title}
          onClose={() => setProgressTopic(null)}
        />
      )}

      {/* Remove confirm */}
      {removeTarget && (
        <RemoveConfirm
          topic={removeTarget}
          dependents={removeDependents}
          loading={removing}
          onConfirm={handleRemoveConfirm}
          onClose={() => setRemoveTarget(null)}
        />
      )}
    </div>
  )
}