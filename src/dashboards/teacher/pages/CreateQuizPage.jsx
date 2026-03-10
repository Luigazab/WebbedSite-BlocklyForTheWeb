import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
import {
  createQuiz,
  updateQuiz,
  fetchQuizById,
  upsertQuizQuestions,
  createBadge,
} from '../../../services/quizService'
import { useAuth } from '../../../hooks/useAuth'
import QuestionEditor from '../components/QuestionEditor'
import BadgePicker from '../components/BadgePicker'
import { Save } from 'lucide-react'

function makeBlankQuestion() {
  return {
    _key: Math.random().toString(36).slice(2),
    question_text: '',
    options: ['', '', '', ''],
    correct_answer: '',
    order_index: 0,
  }
}

export default function CreateQuizPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [timeLimit, setTimeLimit] = useState('')
  const [questions, setQuestions] = useState([makeBlankQuestion()])
  const [passingScore, setPassingScore] = useState('')
  const [badgeData, setBadgeData] = useState(null)
  const [attachBadge, setAttachBadge] = useState(false)

  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEdit)
  const [saveMsg, setSaveMsg] = useState('')
  const [errors, setErrors] = useState({})
  const [savedId, setSavedId] = useState(id || null)
  const [activeSection, setActiveSection] = useState('questions') 

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

        if (quiz.badges) {
          const badge = Array.isArray(quiz.badges) ? quiz.badges[0] : quiz.badges
          if (badge) {
            setBadgeData({ title: badge.title, description: badge.description, icon_url: badge.icon_url, preset_id: badge.id })
            setAttachBadge(true)
          }
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
  const maxPassingScore = totalQuestions

  const validate = () => {
    const e = {}
    if (!title.trim()) e.title = 'Quiz title is required.'
    if (questions.length === 0) e.questions = 'Add at least one question.'

    const badQuestions = questions.filter(
      (q) =>
        !q.question_text.trim() ||
        !q.options.every((o) => o.trim()) ||
        !q.correct_answer ||
        !q.options.includes(q.correct_answer)
    )
    if (badQuestions.length > 0)
      e.questions = `${badQuestions.length} question(s) are incomplete.`

    if (passingScore !== '') {
      const ps = parseInt(passingScore)
      if (isNaN(ps) || ps < 1 || ps > totalQuestions)
        e.passingScore = `Passing score must be between 1 and ${totalQuestions}.`
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    setSaveMsg('')

    try {
      const ps = passingScore ? parseInt(passingScore) : null

      const quizPayload = {
        teacher_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        time_limit: timeLimit ? parseInt(timeLimit) : null,
        passing_score: ps,
      }

      let quiz
      if (savedId) {
        quiz = await updateQuiz(savedId, quizPayload)
      } else {
        quiz = await createQuiz(quizPayload)
        setSavedId(quiz.id)
      }

      await upsertQuizQuestions(quiz.id, questions)

      if (attachBadge && badgeData?.title) {
        if (!badgeData.preset_id) {
          await createBadge({
            title: badgeData.title,
            description: badgeData.description || null,
            icon_url: badgeData.icon_url || null,
          })
        }
      }

      setSaveMsg('✅ Quiz saved!')
      setTimeout(() => setSaveMsg(''), 3000)
    } catch (err) {
      alert('Save failed: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const addQuestion = () => {
    setQuestions((prev) => [...prev, makeBlankQuestion()])
    setActiveSection('questions')
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100)
  }

  const updateQuestion = (index, q) => {
    setQuestions((prev) => prev.map((item, i) => (i === index ? q : item)))
  }

  const removeQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index))
  }

  const moveQuestion = (from, to) => {
    setQuestions((prev) => {
      const arr = [...prev]
      const [item] = arr.splice(from, 1)
      arr.splice(to, 0, item)
      return arr
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400 text-sm animate-pulse">Loading quiz…</div>
      </div>
    )
  }

  const SECTIONS = [
    { key: 'questions', label: `Questions (${totalQuestions})` },
    { key: 'settings', label: 'Settings' },
    { key: 'badge', label: 'Badge' },
  ]

  return (
    <div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/teacher/quizzes')}
            className="text-slate-400 hover:text-slate-700 text-sm flex items-center gap-1.5"
          >
            ← Back
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-extrabold text-slate-900">
              {isEdit ? 'Edit Quiz' : 'Create New Quiz'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {saveMsg && <span className="text-sm font-semibold text-emerald-600">{saveMsg}</span>}
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 flex items-center text-sm btn btn-primary disabled:opacity-50"
            >
              <Save className="mr-2" size={18} />
              {saving ? 'Saving…' : 'Save Quiz'}
            </button>
          </div>
        </div>

        {/* Title field */}
        <div className="mb-6">
          <input
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setErrors((err) => ({ ...err, title: '' })) }}
            placeholder="Quiz title…"
            className={`w-full px-5 py-3.5 text-lg font-bold border-2 rounded-2xl focus:outline-none focus:ring-0 bg-white transition-all ${
              errors.title ? 'border-blockly-red' : 'border-slate-200 focus:border-blockly-blue'
            }`}
          />
          {errors.title && <p className="text-xs text-red-500 mt-1 ml-1">{errors.title}</p>}
        </div>

        {/* Description */}
        <div className="mb-6">
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description (optional)…"
            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blockly-blue bg-white resize-none"
          />
        </div>

        {/* Section tabs */}
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

        {/* ─ Questions section ─ */}
        {activeSection === 'questions' && (
          <div className="space-y-3">
            {errors.questions && (
              <p className="text-sm text-amber-700 bg-amber-50 px-4 py-2 rounded-xl border border-amber-200">
                ⚠️ {errors.questions}
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

        {/* ─ Settings section ─ */}
        {activeSection === 'settings' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
            <h4 className='font-bold text-slate-700 border-b border-slate-400 pb-3'>Settings</h4>
            <div>
              <label className="text-sm font-bold text-slate-700 mb-1.5">
                Passing Score
                <span className="font-normal text-slate-400 ml-1">
                  (out of {totalQuestions} question{totalQuestions !== 1 ? 's' : ''})
                </span>
              </label>
              <div className="flex items-center gap-3 ml-2">
                <input
                  type="number"
                  min={1}
                  max={totalQuestions}
                  value={passingScore}
                  onChange={(e) => {
                    setPassingScore(e.target.value)
                    setErrors((err) => ({ ...err, passingScore: '' }))
                  }}
                  placeholder={`e.g. ${Math.ceil(totalQuestions * 0.7)}`}
                  className={`w-32 px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blockly-blue ${
                    errors.passingScore ? 'border-red-400' : 'border-slate-200'
                  }`}
                />
                <span className="text-sm text-slate-400">
                  out of {totalQuestions}
                  {passingScore && ` (${Math.round((parseInt(passingScore) / totalQuestions) * 100)}%)`}
                </span>
              </div>
              {errors.passingScore && (
                <p className="text-xs text-red-500 mt-1">{errors.passingScore}</p>
              )}
              <p className="text-xs text-slate-400 mt-1">
                Leave blank to not require a passing score.
              </p>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700 mb-1.5">
                Time Limit <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <div className="flex items-center gap-2 ml-2">
                <input
                  type="number"
                  min={1}
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  placeholder="e.g. 30"
                  className="w-32 px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blockly-blue"
                />
                <span className="text-sm text-slate-400">minutes</span>
              </div>
            </div>
          </div>
        )}

        {/* ─ Badge section ─ */}
        {activeSection === 'badge' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Award a Badge</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Students who pass will earn this badge.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={attachBadge}
                  onChange={(e) => setAttachBadge(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:ring-2 peer-focus:ring-blockly-blue rounded-full peer peer-checked:bg-blockly-blue after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
              </label>
            </div>

            {attachBadge && (
              <BadgePicker value={badgeData} onChange={setBadgeData} />
            )}
          </div>
        )}

        {/* Bottom save */}
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
              className="px-5 py-2.5 flex items-center text-sm btn btn-primary disabled:opacity-50"
            >
              <Save className="mr-2" size={18} />
              {saving ? 'Saving…' : 'Save Quiz'}
            </button>
        </div>
      </div>
    </div>
  )
}