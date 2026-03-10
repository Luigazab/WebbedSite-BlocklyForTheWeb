import { useState, useEffect, useRef } from 'react'
import { fetchAdminPresetBadgeImages, uploadBadgeImage } from '../../../services/quizService'
import { Medal, Palette, Pencil, Upload, Check } from 'lucide-react'

// BadgePicker lets the teacher:
//   1. Write a badge name + description (always required)
//   2. Choose the badge IMAGE from either:
//      a) Admin preset image pool  — picks the icon_url only
//      b) Custom upload            — uploads and uses that url
//
// onChange receives: { title, description, icon_url } | null

export default function BadgePicker({ value, onChange }) {
  const [presetImages, setPresetImages] = useState([])
  const [imageTab, setImageTab] = useState('presets') // 'presets' | 'upload'
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  useEffect(() => {
    fetchAdminPresetBadgeImages()
      .then((data) => setPresetImages(data || []))
      .catch(console.error)
  }, [])

  // ── Helpers ──────────────────────────────────────────────────────────────
  const emit = (patch) => onChange({ title: '', description: '', icon_url: '', ...value, ...patch })

  const handlePresetImageSelect = (preset) => {
    emit({ icon_url: preset.icon_url })
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadBadgeImage(file)
      emit({ icon_url: url })
      setImageTab('upload') // stay on upload tab showing the result
    } catch (err) {
      alert('Image upload failed: ' + err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleClear = () => onChange(null)

  const selectedIconUrl = value?.icon_url || ''

  return (
    <div className="space-y-4">

      {/* ── Badge name + description ─────────────────────────────────────── */}
      <div className="space-y-3">
        <div>
          <label className="text-sm font-bold text-slate-700 mb-1">
            Badge Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={value?.title || ''}
            onChange={(e) => emit({ title: e.target.value })}
            placeholder="e.g. Python Beginner"
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blockly-blue bg-white"
          />
        </div>
        <div>
          <label className="text-sm font-bold text-slate-700 mb-1">
            Description <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <textarea
            rows={2}
            value={value?.description || ''}
            onChange={(e) => emit({ description: e.target.value })}
            placeholder="What did the student achieve to earn this?"
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blockly-blue bg-white resize-none"
          />
        </div>
      </div>

      {/* ── Image picker ─────────────────────────────────────────────────── */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden">
        <div className="flex border-b border-slate-200">
          {[
            { key: 'presets', label: 'Choose from Library', icon: Palette },
            { key: 'upload',  label: 'Upload My Own',       icon: Upload  },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setImageTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all ${
                imageTab === tab.key
                  ? 'bg-white text-indigo-700 border-b-2 border-indigo-600'
                  : 'text-slate-500 bg-slate-50 hover:text-slate-700'
              }`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {/* Current image preview (shown in both tabs) */}
          {selectedIconUrl && (
            <div className="flex items-center gap-3 p-3 mb-4 bg-indigo-50 border border-indigo-200 rounded-xl">
              <img
                src={selectedIconUrl}
                alt="badge"
                className="w-12 h-12 object-contain rounded-lg border border-indigo-200 bg-white"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-indigo-700">
                  {value?.title || 'Badge image selected'}
                </p>
                <p className="text-xs text-indigo-500 truncate">{selectedIconUrl}</p>
              </div>
              <button
                type="button"
                onClick={() => emit({ icon_url: '' })}
                className="text-xs text-red-500 hover:text-red-700 px-2 py-1 hover:bg-red-50 rounded shrink-0"
              >
                Remove
              </button>
            </div>
          )}

          {/* Preset image grid */}
          {imageTab === 'presets' && (
            <>
              {presetImages.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">
                  No images in the library yet — ask your admin to add some, or upload your own.
                </p>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {presetImages.map((img) => {
                    const isSelected = selectedIconUrl === img.icon_url
                    return (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => handlePresetImageSelect(img)}
                        title={img.title}
                        className={`relative flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                          isSelected
                            ? 'border-indigo-400 bg-indigo-50 ring-2 ring-indigo-300'
                            : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                        }`}
                      >
                        <img
                          src={img.icon_url}
                          alt={img.title}
                          className="w-10 h-10 object-contain"
                        />
                        {img.title && (
                          <span className="text-[10px] text-slate-500 truncate w-full text-center leading-tight">
                            {img.title}
                          </span>
                        )}
                        {isSelected && (
                          <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white rounded-full p-0.5">
                            <Check size={10} />
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </>
          )}

          {/* Upload tab */}
          {imageTab === 'upload' && (
            <div className="flex flex-col items-center gap-4 py-4">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 px-5 py-3 text-sm font-semibold border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all disabled:opacity-50"
              >
                <Upload size={16} />
                {uploading ? 'Uploading…' : 'Click to upload an image'}
              </button>
              <p className="text-xs text-slate-400">PNG, JPG, SVG up to 5 MB</p>
            </div>
          )}
        </div>
      </div>

      {/* Clear whole badge */}
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="text-xs text-red-500 hover:text-red-700 underline"
        >
          Remove badge from this quiz
        </button>
      )}
    </div>
  )
}