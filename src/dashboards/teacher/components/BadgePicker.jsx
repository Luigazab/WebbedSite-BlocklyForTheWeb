import { useState, useEffect, useRef } from 'react'
import { fetchAdminPresetBadges, uploadBadgeImage } from '../../../services/quizService'
import { Medal, Palette, Pencil, Upload } from 'lucide-react'

export default function BadgePicker({ value, onChange }) {
  const [presets, setPresets] = useState([])
  const [tab, setTab] = useState('presets')
  const [customTitle, setCustomTitle] = useState(value?.title || '')
  const [customDesc, setCustomDesc] = useState(value?.description || '')
  const [customImageUrl, setCustomImageUrl] = useState(value?.icon_url || '')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  useEffect(() => {
    fetchAdminPresetBadges()
      .then((data) => setPresets(data || []))
      .catch(console.error)
  }, [])

  const handlePresetSelect = (badge) => {
    onChange({
      preset_id: badge.id,
      title: badge.title,
      description: badge.description,
      icon_url: badge.icon_url,
    })
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadBadgeImage(file)
      setCustomImageUrl(url)
      onChange({ title: customTitle, description: customDesc, icon_url: url })
    } catch (err) {
      alert('Image upload failed: ' + err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleCustomChange = (field, val) => {
    const updated = {
      title: field === 'title' ? val : customTitle,
      description: field === 'desc' ? val : customDesc,
      icon_url: customImageUrl,
    }
    if (field === 'title') setCustomTitle(val)
    if (field === 'desc') setCustomDesc(val)
    onChange(updated)
  }

  const handleClear = () => {
    setCustomTitle('')
    setCustomDesc('')
    setCustomImageUrl('')
    onChange(null)
  }

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {[
          { key: 'presets', label: 'Preset Badges', icon: Palette },
          { key: 'custom', label: 'Custom Badge', icon: Pencil },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2.5 text-sm font-semibold flex items-center justify-center transition-all ${
              tab === t.key
                ? 'bg-white text-blockly-blue border-b-2 border-blockly-blue'
                : 'text-slate-500 bg-slate-50 hover:text-slate-700'
            }`}
          >
            <t.icon className="w-4 h-4 mr-2" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {/* Current selection preview */}
        {value && (
          <div className="flex items-center gap-3 p-3 mb-4 bg-purple-50 border border-purple-200 rounded-xl">
            {value.icon_url ? (
              <img src={value.icon_url} alt={value.title} className="w-10 h-10 object-contain rounded-lg" />
            ) : (
              <div className="w-10 h-10 bg-purple-200 rounded-lg flex items-center justify-center text-xl"><Medal size={24} color='green' /></div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-purple-800">{value.title || 'Untitled Badge'}</p>
              {value.description && (
                <p className="text-xs text-purple-600 truncate">{value.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-red-500 hover:text-red-700 px-2 py-1 hover:bg-red-50 rounded"
            >
              Remove
            </button>
          </div>
        )}

        {/* Preset grid */}
        {tab === 'presets' && (
          <>
            {presets.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">
                No preset badges yet. Ask the admin to add some, or create a custom one.
              </p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {presets.map((badge) => (
                  <button
                    key={badge.id}
                    type="button"
                    onClick={() => handlePresetSelect(badge)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all text-center ${
                      value?.preset_id === badge.id
                        ? 'border-purple-400 bg-purple-50'
                        : 'border-slate-200 hover:border-purple-300 hover:bg-purple-50/50'
                    }`}
                  >
                    {badge.icon_url ? (
                      <img src={badge.icon_url} alt={badge.title} className="w-10 h-10 object-contain" />
                    ) : (
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-xl"><Medal size={16} /></div>
                    )}
                    <span className="text-xs font-medium text-slate-600 truncate w-full">
                      {badge.title}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Custom badge */}
        {tab === 'custom' && (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-bold text-slate-600">Badge Name</label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => handleCustomChange('title', e.target.value)}
                placeholder="e.g. Python Beginner"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blockly-blue"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-600">Description</label>
              <textarea
                rows={2}
                value={customDesc}
                onChange={(e) => handleCustomChange('desc', e.target.value)}
                placeholder="What did the student achieve?"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blockly-blue resize-none"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-600">Badge Image</label>
              <div className="flex items-center gap-3">
                {customImageUrl ? (
                  <img src={customImageUrl} alt="badge" className="w-14 h-14 object-contain rounded-lg border border-slate-200" />
                ) : (
                  <div className="w-14 h-14 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-2xl">
                    <Medal size={24} color='green'/>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                  className="px-3 py-2 flex gap-2 text-sm items-center btn shadow-none font-semibold border border-slate-200 rounded-lg disabled:opacity-50"
                >
                  <Upload size={16} />
                  {uploading ? 'Uploading…' : 'Upload Image'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}