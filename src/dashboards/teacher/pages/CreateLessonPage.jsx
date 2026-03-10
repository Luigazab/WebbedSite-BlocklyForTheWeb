import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
import {
  createLesson,
  updateLesson,
  fetchLessonById,
  addLessonAttachment,
  removeLessonAttachment,
  uploadLessonFile,
  linkQuizToLesson,
  unlinkQuizFromLesson,
} from '../../../services/lessonService'
import { useAuth } from '../../../hooks/useAuth'
import LessonEditor from '../components/LessonEditor'
import MediaAttachments from '../components/MediaAttachments'
import AttachQuizModal from '../components/AttachQuizModal'
import { ArrowLeft, Check, Edit, FileEdit, Paperclip, Save } from 'lucide-react'
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor'

export default function CreateLessonPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')           // HTML from TipTap
  const [estimatedDuration, setEstimatedDuration] = useState('')
  const [attachments, setAttachments] = useState([])
  const [linkedQuizzes, setLinkedQuizzes] = useState([])
  const [isPublished, setIsPublished] = useState(false)

  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEdit)
  const [showQuizModal, setShowQuizModal] = useState(false)
  const [savedId, setSavedId] = useState(id || null)
  const [saveMsg, setSaveMsg] = useState('')
  const [errors, setErrors] = useState({})

  // ─── Load existing lesson for editing ──────────────────────────────────────
  useEffect(() => {
    if (!isEdit) return
    const load = async () => {
      setLoading(true)
      try {
        const lesson = await fetchLessonById(id)
        setTitle(lesson.title || '')
        setContent(lesson.content || '')
        setEstimatedDuration(lesson.estimated_duration?.toString() || '')
        setIsPublished(lesson.is_published || false)
        setAttachments(
          (lesson.lesson_attachments || []).map((a) => ({
            id: a.id,
            file_name: a.file_name,
            file_url: a.file_url,
            file_type: a.file_type,
            file_size: a.file_size,
            storage_path: a.storage_path,
          }))
        )
        setLinkedQuizzes(lesson.lesson_quizzes || [])
        setSavedId(lesson.id)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, isEdit])

  // ─── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {}
    if (!title.trim()) e.title = 'Title is required.'
    // Strip tags to check for actual content
    const stripped = content.replace(/<[^>]*>/g, '').trim()
    if (!stripped) e.content = 'Content cannot be empty.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ─── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async (publish = false) => {
    if (!validate()) return
    setSaving(true)
    setSaveMsg('')
    try {
      const payload = {
        teacher_id: user.id,
        title: title.trim(),
        content,                   // HTML stored directly
        has_quiz: linkedQuizzes.length > 0,
        is_published: publish ? true : isPublished,
        estimated_duration: estimatedDuration ? parseInt(estimatedDuration) : null,
        updated_at: new Date().toISOString(),
      }

      let lesson
      if (savedId) {
        lesson = await updateLesson(savedId, payload)
      } else {
        lesson = await createLesson({ ...payload, created_at: new Date().toISOString() })
        setSavedId(lesson.id)
      }

      // Upload any pending file attachments
      const pendingFiles = attachments.filter((a) => a.file && !a.id)
      for (const att of pendingFiles) {
        setAttachments((prev) => prev.map((a) => (a === att ? { ...a, _uploading: true } : a)))
        try {
          const { path, url } = await uploadLessonFile(att.file, lesson.id)
          const saved = await addLessonAttachment({
            lesson_id: lesson.id,
            file_name: att.file_name,
            file_url: url,
            file_type: att.file_type,
            file_size: att.file_size,
            storage_path: path,
            order_index: attachments.indexOf(att),
          })
          setAttachments((prev) =>
            prev.map((a) =>
              a === att
                ? { id: saved.id, file_name: saved.file_name, file_url: saved.file_url, file_type: saved.file_type, file_size: saved.file_size, storage_path: saved.storage_path }
                : a
            )
          )
        } catch (e) {
          console.error('Upload failed', e)
          setAttachments((prev) => prev.map((a) => (a === att ? { ...a, _uploading: false } : a)))
        }
      }

      if (publish) setIsPublished(true)
      setSaveMsg(publish ? 'Published!' : 'Saved!')
      setTimeout(() => setSaveMsg(''), 3000)
    } catch (err) {
      alert('Save failed: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  // ─── Attachments ──────────────────────────────────────────────────────────
  const handleAddAttachment = (att) => setAttachments((prev) => [...prev, att])

  const handleRemoveAttachment = async (idOrIndex) => {
    const target =
      typeof idOrIndex === 'string'
        ? attachments.find((a) => a.id === idOrIndex)
        : attachments[idOrIndex]

    if (target?.id) {
      try { await removeLessonAttachment(target.id) }
      catch (err) { console.error(err) }
    }
    setAttachments((prev) =>
      typeof idOrIndex === 'string'
        ? prev.filter((a) => a.id !== idOrIndex)
        : prev.filter((_, i) => i !== idOrIndex)
    )
  }

  // ─── Quizzes ──────────────────────────────────────────────────────────────
  const handleAttachQuiz = async (quiz) => {
    if (!savedId) await handleSave()
    try {
      const link = await linkQuizToLesson(savedId, quiz.id)
      setLinkedQuizzes((prev) => [...prev, { id: link.id, quiz }])
    } catch (err) { console.error(err) }
  }

  const handleDetachQuiz = async (linkId) => {
    try {
      await unlinkQuizFromLesson(linkId)
      setLinkedQuizzes((prev) => prev.filter((lq) => lq.id !== linkId))
    } catch (err) { console.error(err) }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400 text-sm animate-pulse">Loading lesson…</div>
      </div>
    )
  }

  return (
    <div className='bg-slate-200'>
      <div className="max-w-sm md:max-w-2xl lg:max-w-4xl mx-auto sm:px-6 py-8">
        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row items-start justify-center gap-4 mb-8">
          <button
            onClick={() => navigate('/teacher/lessons')}
            className="text-slate-400 hover:text-slate-700 transition-colors text-sm flex items-center gap-1.5"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="flex-1 text-xl font-extrabold text-slate-900">
            {isEdit ? 'Edit Lesson' : 'Create New Lesson'}
          </h1>
          <div className="flex self-end gap-3 ">
            {saveMsg && (
              <span className="text-sm font-semibold text-emerald-600">{saveMsg}</span>
            )}
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="px-4 py-2 flex items-center gap-2 text-xs truncate md:text-sm font-semibold btn btn-primary disabled:opacity-50"
            >
              <Save size={15} />
              {saving ? 'Saving…' : 'Save Draft'}
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving || isPublished}
              className="px-4 py-2 flex items-center gap-2 text-xs truncate md:text-sm font-semibold btn btn-secondary disabled:opacity-50"
            >
              <Check size={15} />
              {isPublished ? 'Published' : 'Save & Publish'}
            </button>
          </div>
        </div>

        <div className="space-y-6">

          {/* ── Title ───────────────────────────────────────────────────── */}
          <div>
            <label className="text-md font-bold text-slate-700 mb-2">
              Lesson Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: '' })) }}
              placeholder="e.g. Introduction to Variables"
              className={`w-full px-4 py-3 text-base font-semibold border rounded-xl focus:outline-none focus:ring-2 bg-white transition-all ${
                errors.title ? 'border-red-400 focus:ring-red-300' : 'border-slate-200 focus:ring-indigo-300'
              }`}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* ── Estimated duration ──────────────────────────────────────── */}
          <div className="w-48">
            <label className="text-md font-bold text-slate-700 mb-2">
              Estimated Duration
            </label>
            <div className="relative">
              <input
                type="number"
                min={1}
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
                placeholder="30"
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white pr-12"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">min</span>
            </div>
          </div>

          {/* ── Content editor ──────────────────────────────────────────── */}
          <div>
            <label className="text-md font-bold text-slate-700 mb-2">
              Lesson Content <span className="text-red-500">*</span>
            </label>
            <SimpleEditor value={content} onChange={(v) => { setContent(v); setErrors((p) => ({ ...p, content: '' })) }} />
            {errors.content && <p className="text-xs text-red-500 mt-1">{errors.content}</p>}
          </div>

          {/* ── Attachments ─────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-2">
              <Paperclip size={15} /> Attachments
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Add images, PDFs, PowerPoint files, or external links.
            </p>
            <MediaAttachments
              attachments={attachments}
              onAdd={handleAddAttachment}
              onRemove={handleRemoveAttachment}
              uploading={saving}
            />
          </div>

          {/* ── Linked quizzes ──────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <FileEdit size={15} /> Attached Quizzes
              </h2>
              <button
                type="button"
                onClick={() => setShowQuizModal(true)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 px-3 py-1.5 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                + Attach Quiz
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Students will take attached quizzes after this lesson.
            </p>

            {linkedQuizzes.length === 0 ? (
              <p className="text-xs text-slate-400 bg-slate-50 p-4 rounded-xl text-center">
                No quizzes attached yet.
              </p>
            ) : (
              <div className="space-y-2">
                {linkedQuizzes.map((lq) => (
                  <div key={lq.id} className="flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                    <span className="text-lg"><Edit size={16} /></span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-indigo-800">{lq.quiz?.title}</p>
                      {lq.quiz?.passing_score != null && (
                        <p className="text-xs text-indigo-500">Passing: {lq.quiz.passing_score} correct</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDetachQuiz(lq.id)}
                      className="text-xs text-red-500 hover:text-red-700 px-2 py-1 hover:bg-red-50 rounded"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Bottom action bar ───────────────────────────────────────── */}
          <div className="flex justify-end gap-3 pt-2 pb-8">
            <button
              onClick={() => navigate('/teacher/lessons')}
              className="px-6 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="px-4 py-2 flex items-center gap-2 text-xs truncate md:text-sm font-semibold btn btn-primary disabled:opacity-50"
            >
              <Save size={15} />
              {saving ? 'Saving…' : 'Save Draft'}
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving || isPublished}
              className="px-4 py-2 flex items-center gap-2 text-xs truncate md:text-sm font-semibold btn btn-secondary disabled:opacity-50"
            >
              <Check size={15} />
              {isPublished ? 'Published' : 'Save & Publish'}
            </button>
          </div>

        </div>
      </div>

      {showQuizModal && (
        <AttachQuizModal
          teacherId={user.id}
          attachedQuizIds={linkedQuizzes.map((lq) => lq.quiz?.id)}
          onAttach={handleAttachQuiz}
          onClose={() => setShowQuizModal(false)}
        />
      )}
    </div>
  )
}