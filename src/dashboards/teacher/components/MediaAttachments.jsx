import { File, FolderOpen, Image, Link, Paperclip, Presentation } from 'lucide-react'
import { useState, useRef } from 'react'

const FILE_ICONS = {
  image: Image,
  pdf: File,
  ppt: Presentation,
  pptx: Presentation,
  link: Link,
  default: Paperclip,
}

const FILE_COLORS = {
  image: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  pdf: 'bg-red-50 border-red-200 text-red-700',
  ppt: 'bg-orange-50 border-orange-200 text-orange-700',
  pptx: 'bg-orange-50 border-orange-200 text-orange-700',
  link: 'bg-blue-50 border-blue-200 text-blue-700',
  default: 'bg-slate-50 border-slate-200 text-slate-700',
}

function getFileType(file) {
  const ext = file.name.split('.').pop().toLowerCase()
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image'
  if (ext === 'pdf') return 'pdf'
  if (['ppt', 'pptx'].includes(ext)) return ext
  return 'default'
}

function formatBytes(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function MediaAttachments({ attachments = [], onAdd, onRemove, uploading = false }) {
  const fileInputRef = useRef(null)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkName, setLinkName] = useState('')
  const [showLinkForm, setShowLinkForm] = useState(false)

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    files.forEach((file) => {
      const fileType = getFileType(file)
      onAdd({ file, file_type: fileType, file_name: file.name, file_size: file.size })
    })
    e.target.value = ''
  }

  const handleAddLink = () => {
    if (!linkUrl.trim()) return
    let url = linkUrl.trim()
    if (!url.startsWith('http')) url = 'https://' + url
    onAdd({
      file_type: 'link',
      file_name: linkName.trim() || url,
      file_url: url,
      file_size: null,
    })
    setLinkUrl('')
    setLinkName('')
    setShowLinkForm(false)
  }

  return (
    <div className="space-y-3">
      {/* Attached items grid */}
      {attachments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {attachments.map((att, i) => {
            const type = att.file_type || 'default'
            const colorClass = FILE_COLORS[type] || FILE_COLORS.default
            const icon = FILE_ICONS[type] || FILE_ICONS.default
            return (
              <div
                key={att.id || i}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border ${colorClass} group`}
              >
                <span className="text-lg">{icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{att.file_name}</p>
                  {att.file_size && (
                    <p className="text-xs opacity-60">{formatBytes(att.file_size)}</p>
                  )}
                  {type === 'link' && (
                    <p className="text-xs opacity-60 truncate">{att.file_url}</p>
                  )}
                </div>
                {att._uploading ? (
                  <span className="text-xs animate-pulse">Uploading…</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onRemove(att.id || i)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-current hover:scale-110"
                    title="Remove"
                  >
                    ✕
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Add buttons */}
      <div className="flex flex-wrap gap-2">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.ppt,.pptx"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-blockly-purple hover:text-blockly-purple hover:bg-indigo-50 transition-all disabled:opacity-50"
        >
          <span><FolderOpen size={16} /></span> Upload file
        </button>
        <button
          type="button"
          onClick={() => setShowLinkForm((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-blockly-blue hover:text-blockly-blue hover:bg-blue-50 transition-all"
        >
          <span><Link size={16} /></span> Add link
        </button>
      </div>

      {/* Link form */}
      {showLinkForm && (
        <div className="flex flex-col sm:flex-row gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <input
            type="url"
            placeholder="https://example.com"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
          />
          <input
            type="text"
            placeholder="Display name (optional)"
            value={linkName}
            onChange={(e) => setLinkName(e.target.value)}
            className="w-48 px-3 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          />
          <button
            type="button"
            onClick={handleAddLink}
            disabled={!linkUrl.trim()}
            className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setShowLinkForm(false)}
            className="px-3 py-2 text-sm text-blue-600 hover:text-blue-800"
          >
            Cancel
          </button>
        </div>
      )}

      {attachments.length === 0 && !showLinkForm && (
        <p className="text-xs text-slate-400">
          Supported: images, PDF, PowerPoint, or external links
        </p>
      )}
    </div>
  )
}