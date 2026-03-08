import { useState } from 'react'
import { lessonService } from '../../../services/lesson.service'
import { useUIStore } from '../../../store/uiStore'
import {
  Paperclip, Link as LinkIcon, Upload, X, Loader2,
  FileText, Image as ImageIcon, Video, ExternalLink
} from 'lucide-react'

const FILE_ICONS = {
  pdf: FileText,
  image: ImageIcon,
  video: Video,
  link: ExternalLink,
}

export default function AttachmentManager({ lessonId, attachments, onAttachmentsChange }) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [modalType, setModalType] = useState('file') // 'file' | 'link'
  const [uploading, setUploading] = useState(false)
  const addToast = useUIStore((s) => s.addToast)

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setUploading(true)
    try {
      for (const file of files) {
        if (!lessonId) {
          // Store temporarily until lesson is saved
          const reader = new FileReader()
          reader.onload = () => {
            const newAttachment = {
              id: Date.now().toString(),
              file_name: file.name,
              file_url: reader.result,
              file_type: getFileType(file.type),
              file_size: file.size,
              _tempFile: file, // Store file for later upload
            }
            onAttachmentsChange([...attachments, newAttachment])
          }
          reader.readAsDataURL(file)
        } else {
          // Upload immediately if lesson exists
          const { file_url, file_name } = await lessonService.uploadAttachmentFile(lessonId, file)
          const attachment = await lessonService.addAttachment(lessonId, {
            file_name,
            file_url,
            file_type: getFileType(file.type),
            file_size: file.size,
          })
          onAttachmentsChange([...attachments, attachment])
        }
      }
      addToast('Files uploaded successfully', 'success')
    } catch (error) {
      addToast(error.message || 'Failed to upload files', 'error')
    } finally {
      setUploading(false)
      e.target.value = '' // Reset input
    }
  }

  const handleAddLink = async (linkData) => {
    try {
      const newAttachment = {
        id: Date.now().toString(),
        file_name: linkData.title,
        file_url: linkData.url,
        file_type: 'link',
        order_index: attachments.length,
      }

      if (lessonId) {
        const attachment = await lessonService.addAttachment(lessonId, newAttachment)
        onAttachmentsChange([...attachments, attachment])
      } else {
        onAttachmentsChange([...attachments, newAttachment])
      }

      addToast('Link added successfully', 'success')
      setShowAddModal(false)
    } catch (error) {
      addToast(error.message || 'Failed to add link', 'error')
    }
  }

  const handleDeleteAttachment = async (attachment) => {
    try {
      if (lessonId && !attachment._tempFile) {
        await lessonService.deleteAttachment(attachment.id)
      }
      onAttachmentsChange(attachments.filter((a) => a.id !== attachment.id))
      addToast('Attachment removed', 'info')
    } catch (error) {
      addToast(error.message || 'Failed to remove attachment', 'error')
    }
  }

  const getFileType = (mimeType) => {
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.startsWith('video/')) return 'video'
    if (mimeType.includes('pdf')) return 'pdf'
    return 'file'
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">Attachments</h3>
        <div className="flex items-center gap-2">
          <label className="btn flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 cursor-pointer transition-colors">
            <Upload className="w-4 h-4" />
            Upload Files
            <input
              type="file"
              multiple
              accept="image/*,video/*,.pdf"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
          <button
            onClick={() => {
              setModalType('link')
              setShowAddModal(true)
            }}
            className="btn flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            <LinkIcon className="w-4 h-4" />
            Add Link
          </button>
        </div>
      </div>

      {uploading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blockly-purple" />
          <span className="ml-2 text-sm text-gray-600">Uploading...</span>
        </div>
      )}

      {/* Attachments List */}
      {attachments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-gray-200 rounded-xl">
          <Paperclip className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-sm text-gray-500">No attachments yet</p>
          <p className="text-xs text-gray-400 mt-1">Upload files or add links to enhance your lesson</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {attachments.map((attachment) => {
            const Icon = FILE_ICONS[attachment.file_type] || FileText
            return (
              <div
                key={attachment.id}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blockly-purple transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {attachment.file_name}
                  </p>
                  {attachment.file_size && (
                    <p className="text-xs text-gray-400">{formatFileSize(attachment.file_size)}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteAttachment(attachment)}
                  className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all"
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Link Modal */}
      {showAddModal && (
        <AddLinkModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddLink}
        />
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────────
// Add Link Modal
// ──────────────────────────────────────────────────────────
function AddLinkModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ title: '', url: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.url.trim()) return
    onAdd(form)
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Add Link</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Link Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g., MDN Web Docs - HTML"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blockly-purple focus:ring-2 focus:ring-blockly-purple/10 transition"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">URL</label>
            <input
              type="url"
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              placeholder="https://example.com"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blockly-purple focus:ring-2 focus:ring-blockly-purple/10 transition"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn flex-1 px-4 py-2.5 bg-blockly-purple text-white text-sm font-semibold rounded-lg hover:bg-blockly-purple/90 transition-colors"
            >
              Add Link
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}