import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
import {
  createQuiz,
  updateQuiz,
  fetchQuizById,
  upsertQuizQuestions,
  upsertQuizBadge,
  deleteQuizBadge,
} from '../../../services/quizService'
import { useAuth } from '../../../hooks/useAuth'
import QuestionEditor from '../components/QuestionEditor'
import BadgePicker from '../components/BadgePicker'
import { ArrowLeft, MessageCircleWarning, Save } from 'lucide-react'

function makeBlankQuestion() {
  return {
    _key: Math.random().toString(36).slice(2),
    question_text: '',
    options: ['', '', '', ''],
    correct_answer: '',
  }
}

export default function CreateQuizPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  // ── Form state ──────────────────────────────────────────────────────────────
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [timeLimit, setTimeLimit] = useState('')
  const [passingScore, setPassingScore] = useState('')
  const [questions, setQuestions] = useState([makeBlankQuestion()])

  // Badge: { title, description, icon_url } | null
  // existingBadgeId tracks the DB row id so we can UPDATE instead of INSERT
  const [attachBadge, setAttachBadge] = useState(false)
  const [badgeData, setBadgeData] = useState(null)
  const [existingBadgeId, setExistingBadgeId] = useState(null)

  // ── UI state ────────────────────────────────────────────────────────────────
  const [savedId, setSavedId] = useState(id || null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEdit)
  const [saveMsg, setSaveMsg] = useState('')
  const [errors, setErrors] = useState({})
  const [activeSection, setActiveSection] = useState('questions')

  // ── Load existing quiz ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isEdit) return
    const load = async () => {
      setLoading(true)
      try {
        const quiz = await fetchQuizById(id)
        setTitle(quiz.title || '')
        setDescription(quiz.description || '')
        setTimeLimit(quiz.time_limit?.toString() || '')
        setPassingScore(quiz.passing_score?.toString() || '')
        setSavedId(quiz.id)

        if (quiz.quiz_questions?.length > 0) {
          setQuestions(
            quiz.quiz_questions
              .sort((a, b) => a.order_index - b.order_index)
              .map((q) => ({
                ...q,
                _key: q.id,
                options: Array.isArray(q.options) ? q.options : Object.values(q.options || {}),
              }))
          )
        }

        // Load existing badge — badges is an array via FK reverse join
        const badge = Array.isArray(quiz.badges) ? quiz.badges[0] : quiz.badges
        if (badge) {
          setExistingBadgeId(badge.id)
          setBadgeData({
            title: badge.title || '',
            description: badge.description || '',
            icon_url: badge.icon_url || '',
          })
          setAttachBadge(true)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, isEdit])

  const totalQuestions = questions.length

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {}
    if (!title.trim()) e.title = 'Quiz title is required.'

    if (questions.length === 0) {
      e.questions = 'Add at least one question.'
    } else {
      const incomplete = questions.filter(
        (q) =>
          !q.question_text.trim() ||
          q.options.some((o) => !o.trim()) ||
          !q.correct_answer ||
          !q.options.includes(q.correct_answer)
      )
      if (incomplete.length > 0)
        e.questions = `${incomplete.length} question(s) are incomplete.`
    }

    if (passingScore !== '') {
      const ps = parseInt(passingScore)
      if (isNaN(ps) || ps < 1 || ps > totalQuestions)
        e.passingScore = `Must be between 1 and ${totalQuestions}.`
    }

    if (attachBadge) {
      if (!badgeData?.title?.trim()) e.badge = 'Badge name is required.'
      if (!badgeData?.icon_url) e.badge = (e.badge ? e.badge + ' ' : '') + 'Please select or upload a badge image.'
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    setSaveMsg('')

    try {
      // 1. Save quiz row
      const quizPayload = {
        teacher_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        time_limit: timeLimit ? parseInt(timeLimit) : null,
        passing_score: passingScore ? parseInt(passingScore) : null,
      }

      let quizId = savedId
      if (quizId) {
        await updateQuiz(quizId, quizPayload)
      } else {
        const quiz = await createQuiz(quizPayload)
        quizId = quiz.id
        setSavedId(quizId)
      }

      // 2. Save questions
      await upsertQuizQuestions(quizId, questions)

      // 3. Save badge
      if (attachBadge && badgeData?.title?.trim() && badgeData?.icon_url) {
        const saved = await upsertQuizBadge(quizId, {
          existingBadgeId,
          title: badgeData.title.trim(),
          description: badgeData.description?.trim() || null,
          icon_url: badgeData.icon_url,
        })
        setExistingBadgeId(saved.id) // remember for future updates
      } else if (!attachBadge && existingBadgeId) {
        // Teacher toggled badge off — delete the old badge row
        await deleteQuizBadge(existingBadgeId)
        setExistingBadgeId(null)
      }

      setSaveMsg('Quiz saved!')
      setTimeout(() => setSaveMsg(''), 3000)
    } catch (err) {
      alert('Save failed: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  // ── Question helpers ────────────────────────────────────────────────────────
  const addQuestion = () => {
    setQuestions((prev) => [...prev, makeBlankQuestion()])
    setActiveSection('questions')
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100)
  }

  const updateQuestion = (i, q) =>
    setQuestions((prev) => prev.map((item, idx) => (idx === i ? q : item)))

  const removeQuestion = (i) =>
    setQuestions((prev) => prev.filter((_, idx) => idx !== i))

  const moveQuestion = (from, to) =>
    setQuestions((prev) => {
      const arr = [...prev]
      const [item] = arr.splice(from, 1)
      arr.splice(to, 0, item)
      return arr
    })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400 text-sm animate-pulse">Loading quiz…</p>
      </div>
    )
  }

  const SECTIONS = [
    { key: 'questions', label: `Questions (${totalQuestions})` },
    { key: 'settings',  label: 'Settings' },
    { key: 'badge',     label: attachBadge ? 'Badge Attached' : 'Badge' },
  ]

  return (
    <div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/teacher/quizzes')}
            className="text-slate-400 hover:text-slate-700 text-sm flex items-center gap-1.5"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="flex-1 text-xl font-extrabold text-slate-900">
            {isEdit ? 'Edit Quiz' : 'Create New Quiz'}
          </h1>
          <div className="flex items-center gap-3">
            {saveMsg && <span className="text-sm font-semibold text-emerald-600">{saveMsg}</span>}
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 flex items-center gap-2 text-sm btn btn-primary disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? 'Saving…' : 'Save Quiz'}
            </button>
          </div>
        </div>

        {/* ── Title ───────────────────────────────────────────────────────── */}
        <div className="mb-4">
          <input
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: '' })) }}
            placeholder="Quiz title…"
            className={`w-full px-5 py-3.5 text-lg font-bold border-2 rounded-2xl focus:outline-none bg-white transition-all ${
              errors.title ? 'border-red-400' : 'border-slate-200 focus:border-indigo-400'
            }`}
          />
          {errors.title && <p className="text-xs text-red-500 mt-1 ml-1">{errors.title}</p>}
        </div>

        {/* ── Description ─────────────────────────────────────────────────── */}
        <div className="mb-6">
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description (optional)…"
            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white resize-none"
          />
        </div>

        {/* ── Section tabs ─────────────────────────────────────────────────── */}
        <div className="flex gap-1.5 p-1 bg-white border border-slate-200 rounded-xl shadow-sm mb-6">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeSection === s.key
                  ? 'bg-blockly-blue text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* ══ Questions ═══════════════════════════════════════════════════════ */}
        {activeSection === 'questions' && (
          <div className="space-y-3">
            {errors.questions && (
              <p className="text-sm text-amber-700 bg-amber-50 px-4 py-2 rounded-xl border border-amber-200">
                <MessageCircleWarning /> {errors.questions}
              </p>
            )}

            {questions.map((q, i) => (
              <QuestionEditor
                key={q._key || q.id || i}
                index={i}
                question={q}
                onChange={(updated) => updateQuestion(i, updated)}
                onRemove={() => removeQuestion(i)}
                onMoveUp={() => moveQuestion(i, i - 1)}
                onMoveDown={() => moveQuestion(i, i + 1)}
                isFirst={i === 0}
                isLast={i === questions.length - 1}
              />
            ))}

            <button
              type="button"
              onClick={addQuestion}
              className="w-full py-4 text-sm font-semibold text-indigo-600 border-2 border-dashed border-indigo-200 rounded-2xl hover:border-indigo-400 hover:bg-indigo-50 transition-all"
            >
              + Add Question
            </button>

            <p className="text-xs text-slate-400 text-center">
              {totalQuestions} question{totalQuestions !== 1 ? 's' : ''} total
            </p>
          </div>
        )}

        {/* ══ Settings ════════════════════════════════════════════════════════ */}
        {activeSection === 'settings' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
            <h4 className="font-bold text-slate-700 border-b border-slate-200 pb-3">Settings</h4>

            {/* Passing score */}
            <div>
              <label className="text-sm font-bold text-slate-700 mb-1.5">
                Passing Score{' '}
                <span className="font-normal text-slate-400">
                  (out of {totalQuestions} question{totalQuestions !== 1 ? 's' : ''})
                </span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={totalQuestions}
                  value={passingScore}
                  onChange={(e) => { setPassingScore(e.target.value); setErrors((p) => ({ ...p, passingScore: '' })) }}
                  placeholder={`e.g. ${Math.ceil(totalQuestions * 0.7)}`}
                  className={`w-28 px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                    errors.passingScore ? 'border-red-400' : 'border-slate-200'
                  }`}
                />
                <span className="text-sm text-slate-400">
                  out of {totalQuestions}
                  {passingScore && !isNaN(parseInt(passingScore)) &&
                    ` (${Math.round((parseInt(passingScore) / totalQuestions) * 100)}%)`}
                </span>
              </div>
              {errors.passingScore && <p className="text-xs text-red-500 mt-1">{errors.passingScore}</p>}
              <p className="text-xs text-slate-400 mt-1">Leave blank for no passing requirement.</p>
            </div>

            {/* Time limit */}
            <div>
              <label className="text-sm font-bold text-slate-700 mb-1.5">
                Time Limit <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  placeholder="e.g. 30"
                  className="w-28 px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
                <span className="text-sm text-slate-400">minutes</span>
              </div>
            </div>
          </div>
        )}

        {/* ══ Badge ═══════════════════════════════════════════════════════════ */}
        {activeSection === 'badge' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
            {/* Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Award a Badge</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Students who meet the passing score will earn this badge.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={attachBadge}
                  onChange={(e) => setAttachBadge(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:ring-2 peer-focus:ring-indigo-400 rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
              </label>
            </div>

            {/* Only show picker when toggled on */}
            {attachBadge && (
              <>
                {errors.badge && (
                  <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl border border-red-200">
                    <MessageCircleWarning /> {errors.badge}
                  </p>
                )}
                <BadgePicker
                  value={badgeData}
                  onChange={(v) => { setBadgeData(v); setErrors((p) => ({ ...p, badge: '' })) }}
                />
              </>
            )}

            {!attachBadge && (
              <p className="text-xs text-slate-400 bg-slate-50 px-4 py-3 rounded-xl text-center">
                Toggle on to award a badge for passing this quiz.
              </p>
            )}
          </div>
        )}

        {/* ── Bottom bar ──────────────────────────────────────────────────── */}
        <div className="flex justify-end gap-3 pt-6 pb-8">
          <button
            onClick={() => navigate('/teacher/quizzes')}
            className="px-6 py-2.5 btn text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 flex items-center gap-2 text-sm btn btn-primary disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? 'Saving…' : 'Save Quiz'}
          </button>
        </div>

      </div>
    </div>
  )
}