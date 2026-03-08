import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useAuthStore } from '../../../store/authStore'
import { useLessonStore } from '../../../store/lessonStore'
import { useLesson } from '../../../hooks/useLesson'
import PageWrapper from '../../../components/layout/PageWrapper'
import MarkdownEditor from '../components/MarkdownEditor'
import AttachmentManager from '../components/AttachmentManager'
import QuizLinker from '../components/QuizLinker'
import {
  Save, Eye, ArrowLeft, Upload, Loader2,
  FileText, Link as LinkIcon, Image as ImageIcon,
  Paperclip
} from 'lucide-react'

const TABS = ['Content', 'Attachments', 'Quiz']

export default function CreateLesson() {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const { currentLesson, loading, fetchLesson } = useLessonStore()
  const { handleCreateLesson, handleUpdateLesson } = useLesson()

  const [activeTab, setActiveTab] = useState('Content')
  const [form, setForm] = useState({
    title: '',
    content_markdown: '',
    thumbnail_url: '',
    estimated_duration: 30,
    is_published: false,
  })
  const [attachments, setAttachments] = useState([])
  const [linkedQuizzes, setLinkedQuizzes] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (lessonId) {
      fetchLesson(lessonId)
    }
  }, [lessonId])

  useEffect(() => {
    if (currentLesson && lessonId) {
      setForm({
        title: currentLesson.title || '',
        content_markdown: currentLesson.content_markdown || '',
        thumbnail_url: currentLesson.thumbnail_url || '',
        estimated_duration: currentLesson.estimated_duration || 30,
        is_published: currentLesson.is_published || false,
      })
      setAttachments(currentLesson.attachments || [])
      setLinkedQuizzes(currentLesson.quizzes?.map((lq) => lq.quiz) || [])
    }
  }, [currentLesson, lessonId])

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    if (!form.title.trim() || !form.content_markdown.trim()) {
      alert('Title and content are required')
      return
    }

    setSaving(true)
    try {
      const payload = {
        ...form,
        teacher_id: profile.id,
      }

      if (lessonId) {
        await handleUpdateLesson(lessonId, payload, attachments, linkedQuizzes)
      } else {
        const newLesson = await handleCreateLesson(payload, attachments, linkedQuizzes)
        navigate(`/teacher/lessons/${newLesson.id}/edit`, { replace: true })
      }
    } finally {
      setSaving(false)
    }
  }

  const handlePreview = () => {
    // TODO: Open preview modal or navigate to preview page
    console.log('Preview:', form)
  }

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/teacher/lessons')}
              className="btn p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {lessonId ? 'Edit Lesson' : 'Create Lesson'}
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {lessonId ? 'Update your lesson content' : 'Create a new lesson for your students'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePreview}
              className="btn flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn flex items-center gap-2 px-6 py-2 bg-blockly-purple text-white rounded-lg text-sm font-semibold hover:bg-blockly-purple/90 disabled:opacity-50 transition-colors"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {lessonId ? 'Update' : 'Save'} Lesson
            </button>
          </div>
        </div>

        {/* Title and Meta */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Lesson Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              placeholder="e.g., Introduction to HTML"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blockly-purple focus:ring-2 focus:ring-blockly-purple/10 transition"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Estimated Duration (minutes)
              </label>
              <input
                type="number"
                value={form.estimated_duration}
                onChange={(e) => setField('estimated_duration', parseInt(e.target.value))}
                min="1"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blockly-purple focus:ring-2 focus:ring-blockly-purple/10 transition"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) => setField('is_published', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blockly-purple focus:ring-blockly-purple"
                />
                <span className="text-sm font-semibold text-gray-700">
                  Publish Lesson
                </span>
              </label>
              <span className="text-xs text-gray-400">
                (Students can view published lessons)
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-semibold transition-colors relative
                ${activeTab === tab
                  ? 'text-blockly-purple'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blockly-purple" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {activeTab === 'Content' && (
            <MarkdownEditor
              value={form.content_markdown}
              onChange={(value) => setField('content_markdown', value)}
            />
          )}

          {activeTab === 'Attachments' && (
            <AttachmentManager
              lessonId={lessonId}
              attachments={attachments}
              onAttachmentsChange={setAttachments}
            />
          )}

          {activeTab === 'Quiz' && (
            <QuizLinker
              lessonId={lessonId}
              linkedQuizzes={linkedQuizzes}
              onQuizzesChange={setLinkedQuizzes}
            />
          )}
        </div>
      </div>
    </PageWrapper>
  )
}