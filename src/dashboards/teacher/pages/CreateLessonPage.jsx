import { useState, useEffect, useRef, useCallback } from 'react'
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
  linkTutorialToLesson,
  unlinkTutorialFromLesson,
} from '../../../services/lessonService'
import { useAuth } from '../../../hooks/useAuth'
import MediaAttachments from '../components/MediaAttachments'
import AttachQuizModal from '../components/AttachQuizModal'
import QuizBuilderSlideOver from '../components/QuizBuilderSlideOver'
import { ArrowLeft, Check, Edit, FileEdit, MonitorSmartphone, Paperclip, Save, BookOpen as TutorialIcon } from 'lucide-react'
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor'
import { supabase } from '../../../supabaseClient'
import AttachTutorialModal from '../components/AttachTutorialModal'


export default function CreateLessonPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const pendingImageDeletes = useRef(new Set())

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')           // HTML from TipTap
  const [estimatedDuration, setEstimatedDuration] = useState('')
  const [attachments, setAttachments] = useState([])
  const [linkedQuizzes, setLinkedQuizzes] = useState([])
  const [isPublished, setIsPublished] = useState(false)

  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEdit)
  const [showQuizPanel, setShowQuizPanel] = useState(false)
  const [savedId, setSavedId] = useState(id || null)
  const [saveMsg, setSaveMsg] = useState('')
  const [errors, setErrors] = useState({})

  const [linkedTutorials, setLinkedTutorials] = useState([])
  const [showTutorialModal, setShowTutorialModal] = useState(false)

  const handleImageRemoved = useCallback((url) => {
    if (url?.includes('supabase.co')) {
      pendingImageDeletes.current.add(url)
    }
  }, [])

  const handleImageRestored = useCallback((url) => {
    pendingImageDeletes.current.delete(url)
  }, [])

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
        setLinkedTutorials(lesson.lesson_tutorials || [])
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
      if (pendingImageDeletes.current.size > 0) {
        const urlsToDelete = [...pendingImageDeletes.current]
        
        const pathsToDelete = urlsToDelete.map(url => {
          const parts = url.split('/content-images/')
          return parts[1] // → "lesson-images/uuid.png"
        }).filter(Boolean)

        if (pathsToDelete.length > 0) {
          const { error } = await supabase.storage
            .from('content-images')
            .remove(pathsToDelete)

          if (!error) {
            pendingImageDeletes.current.clear()
          }
        }
      }
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

  const handleAttachTutorial = async (tutorial) => {
    if (!savedId) await handleSave()
    try {
      const link = await linkTutorialToLesson(savedId, tutorial.id)
      setLinkedTutorials((prev) => [...prev, { id: link.id, tutorial }])
    } catch (err) {
      console.error(err)
    }
  }
  
  const handleDetachTutorial = async (linkId) => {
    try {
      await unlinkTutorialFromLesson(linkId)
      setLinkedTutorials((prev) => prev.filter((lt) => lt.id !== linkId))
    } catch (err) {
      console.error(err)
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400 text-sm animate-pulse">Loading lesson…</div>
      </div>
    )
  }

  return (
    <div className='relative h-[93vh] w-full flex bg-slate-50 overflow-hidden'>
      {/* Dual Gradient Overlay Background */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(229,231,235,0.8) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(229,231,235,0.8) 1px, transparent 1px),
            radial-gradient(circle 500px at 20% 80%, rgba(139,92,246,0.3), transparent),
            radial-gradient(circle 500px at 80% 20%, rgba(59,130,246,0.3), transparent)
          `,
          backgroundSize: "48px 48px, 48px 48px, 100% 100%, 100% 100%",
        }}
      />
    <div className='z-10 flex flex-1 overflow-y-auto'>
      <div className="max-w-sm md:max-w-2xl lg:max-w-4xl mx-auto sm:px-6 py-8">
        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row items-start justify-center gap-4 mb-8 bg-white/50 backdrop-blur-sm p-4 rounded-3xl border border-white/60 shadow-sm">
            <button
              onClick={() => navigate('/teacher/lessons')}
              className="bg-white hover:bg-slate-100 p-2 rounded-xl transition-colors shadow-sm border border-slate-200"
            >
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
            <h1 className="flex-1 text-2xl font-extrabold text-slate-800 pt-1">
              {isEdit ? 'Edit Lesson' : 'Create New Lesson'}
            </h1>
            <div className="flex self-end gap-3 items-center">
              {saveMsg && (
                <span className="text-sm font-semibold text-emerald-600">{saveMsg}</span>
              )}
              <button
                onClick={() => {/* handleSave(false) */}}
                disabled={saving}
                className="px-5 py-2.5 flex items-center gap-2 text-sm font-bold bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition disabled:opacity-50"
              >
                <Save size={18} />
                {saving ? 'Saving…' : 'Save Draft'}
              </button>
              <button
                onClick={() => {/* handleSave(true) */}}
                disabled={saving || isPublished}
                className="px-5 py-2.5 flex items-center gap-2 text-sm font-bold bg-violet-500 text-white rounded-xl hover:bg-violet-600 shadow-md transition disabled:opacity-50"
              >
                <Check size={18} />
                {isPublished ? 'Published' : 'Save & Publish'}
              </button>
            </div>
          </div>

        <div className="space-y-6">

          {/* ── Title & Duration ──────────────────────────────────────── */}
            <div className="bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-white/60 shadow-sm flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <label className="text-md font-bold text-slate-700 mb-2">
                  Lesson Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: '' })) }}
                  placeholder="e.g. Introduction to Variables"
                  className={`w-full px-4 py-3 text-lg font-bold border-2 rounded-xl focus:outline-none transition-all ${
                    errors.title ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-violet-400'
                  }`}
                />
              </div>
              <div className="w-full md:w-48">
                <label className="text-md font-bold text-slate-700 mb-2">
                  Est. Duration
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={estimatedDuration}
                    onChange={(e) => setEstimatedDuration(e.target.value)}
                    placeholder="30"
                    className="w-full px-4 py-3 text-lg font-bold border-2 border-slate-200 rounded-xl focus:outline-none focus:border-violet-400 pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">min</span>
                </div>
              </div>
            </div>

          {/* ── Content editor ──────────────────────────────────────────── */}
          <div className="bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-white/60 shadow-sm">
              <label className="text-md font-bold text-slate-700 mb-4">
                Lesson Content <span className="text-red-500">*</span>
              </label>
            <SimpleEditor
              value={content}
              onChange={(v) => { setContent(v); setErrors((p) => ({ ...p, content: '' })) }}
              onImageRemoved={handleImageRemoved}
              onImageRestored={handleImageRestored}
            />
          </div>

          {/* ── Attachments ─────────────────────────────────────────────── */}
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm p-5">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Paperclip size={20} className="text-violet-500"/> Attachments
            </h2>
            <p className="text-sm text-slate-500 mb-4 font-medium">
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
          <div className="bg-white/50 backdrop-blur-sm rounded-3xl border border-white/60 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileEdit size={20} className="text-violet-500"/> Lesson Quiz
              </h2>
              <button
                type="button"
                onClick={() => setShowQuizPanel(true)} // Opens Slide-Over
                className="text-sm font-bold text-violet-600 px-4 py-2 border-2 border-violet-200 rounded-xl hover:bg-violet-50 transition-colors"
              >
                + Add / Edit Quiz
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-4 font-medium">
              Assess your students' understanding after they complete this lesson.
            </p>

            {linkedQuizzes.length === 0 ? (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-8 rounded-2xl flex flex-col items-center justify-center text-center">
                <FileEdit size={32} className="text-slate-300 mb-2"/>
                <p className="text-slate-500 font-bold">No quiz attached</p>
                <p className="text-sm text-slate-400">Click the button above to link or build a quiz.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {linkedQuizzes.map((lq) => (
                  <div key={lq.id} className="flex items-center gap-4 p-4 bg-violet-50 border border-violet-200 rounded-2xl">
                    <div className="bg-violet-200 p-3 rounded-full text-violet-700">
                      <FileEdit size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-bold text-violet-900">{lq.quiz?.title || 'Untitled Quiz'}</p>
                      <p className="text-sm font-semibold text-violet-600">10 Questions • 5 Mins</p>
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

          {/* ── Linked tutorials ───────────────────────────────────────────────── */}
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-white/60 p-5 shadow-md">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <MonitorSmartphone size={20} className="text-violet-500"/> Attached Tutorials
              </h2>
              <button
                type="button"
                onClick={() => setShowTutorialModal(true)}
                className="text-sm font-bold text-violet-600 px-4 py-2 border-2 border-violet-200 rounded-xl hover:bg-violet-50 transition-colors"
              >
                + Attach Tutorial
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-4 font-medium">
              Students will open an interactive block editor to work through the tutorial step-by-step.
            </p>
          
            {linkedTutorials.length === 0 ? (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-8 rounded-2xl flex flex-col items-center justify-center text-center">
                <MonitorSmartphone size={32} className="text-slate-300 mb-2"/>
                <p className="text-slate-500 font-bold">No tutorial attached</p>
                <p className="text-sm text-slate-400">Click the button above to link or build a tutorial.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {linkedTutorials.map((lt) => (
                  <div key={lt.id} className="flex items-center gap-4 p-4 bg-violet-50 border border-violet-200 rounded-2xl">
                    <div className='bg-violet-200 p-3 rounded-full text-violet-700'>
                      <MonitorSmartphone size={20}/>
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-bold text-violet-900">
                        {lt.tutorial?.title || 'Untitled Tutorial'}
                      </p>
                      <p className="text-sm font-semibold text-violet-600 capitalize">
                        {lt.tutorial?.difficulty_level ?? ''}
                        {lt.tutorial?.estimated_time_minutes
                          ? ` · ${lt.tutorial.estimated_time_minutes} min`
                          : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDetachTutorial(lt.id)}
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
      
      {showQuizPanel && (
        <div className="w-full md:w-[60%] lg:w-[45%] xl:w-[35%] z-10 space-y-4 bg-sky-50/90 p-6 h-full">
          <QuizBuilderSlideOver 
            isOpen={showQuizPanel} 
            onClose={() => setShowQuizPanel(false)} 
            lessonTitle={title || "Untitled Lesson"}
            onAttach={(quizData) => {
              console.log("Attached:", quizData);
              setShowQuizPanel(false);
            }}
          />
        </div>
      )}

      {showTutorialModal && (
        <AttachTutorialModal
          teacherId={user.id}
          attachedTutorialIds={linkedTutorials.map((lt) => lt.tutorial?.id)}
          onAttach={handleAttachTutorial}
          onClose={() => setShowTutorialModal(false)}
        />
      )}
      
    </div>
    </div>
  )
}