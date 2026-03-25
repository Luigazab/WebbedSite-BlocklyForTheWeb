import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../../../supabaseClient'
import {
  Upload, Trash2, Plus, Save, X, Loader2, RefreshCw,
  Image as ImageIcon, Award, BookOpen, Palette, Hash,
  ChevronUp, ChevronDown, Edit2, Check, AlertCircle,
  Layers, GripVertical, Globe, User
} from 'lucide-react'

// ─── Tiny helpers ──────────────────────────────────────────────────────────────
const slugify = (str) =>
  str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const ACCENT_COLORS = [
  '#f97316', '#3b82f6', '#22c55e', '#a855f7',
  '#ec4899', '#f59e0b', '#14b8a6', '#ef4444',
  '#6366f1', '#0ea5e9', '#84cc16', '#8b5cf6',
]

// ─── Reusable image card ────────────────────────────────────────────────────────
function ImageCard({ src, label, onDelete, deleting }) {
  return (
    <div className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
      <div className="aspect-square bg-gray-50 flex items-center justify-center p-2">
        <img
          src={src}
          alt={label || 'image'}
          className="w-full h-full object-contain rounded-lg"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=?' }}
        />
      </div>
      {label && (
        <div className="px-2 py-1.5 text-center border-t border-gray-100">
          <p className="text-xs text-gray-600 truncate font-medium">{label}</p>
        </div>
      )}
      <button
        onClick={onDelete}
        disabled={deleting}
        className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
      >
        {deleting ? <Loader2 size={10} className="animate-spin" /> : <X size={10} />}
      </button>
    </div>
  )
}

// ─── Upload zone ────────────────────────────────────────────────────────────────
function UploadZone({ onFiles, accept = 'image/*', loading }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false)
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    if (files.length) onFiles(files)
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
        dragging ? 'border-amber-400 bg-amber-50' : 'border-gray-200 hover:border-amber-300 hover:bg-gray-50'
      }`}
    >
      <input ref={inputRef} type="file" multiple accept={accept} className="hidden"
        onChange={(e) => { const f = Array.from(e.target.files); if (f.length) onFiles(f); e.target.value = '' }} />
      {loading
        ? <Loader2 size={24} className="animate-spin text-amber-500 mx-auto mb-2" />
        : <Upload size={24} className="text-gray-400 mx-auto mb-2" />}
      <p className="text-sm font-semibold text-gray-600">
        {loading ? 'Uploading…' : 'Drop images here or click to browse'}
      </p>
      <p className="text-xs text-gray-400 mt-1">PNG, JPG, SVG, WebP — up to 5 MB each</p>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1: AVATAR PRESETS
// ═══════════════════════════════════════════════════════════════════════════════
function AvatarPresetsTab() {
  const [avatars, setAvatars] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [error, setError] = useState('')

  const BUCKET = 'avatars'
  const FOLDER = 'presets'

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const { data, error } = await supabase.storage.from(BUCKET).list(FOLDER, {
        sortBy: { column: 'created_at', order: 'asc' }
      })
      if (error) throw error
      const files = (data || []).filter(f => f.name !== '.emptyFolderPlaceholder')
      setAvatars(files.map(f => ({
        name: f.name,
        url: supabase.storage.from(BUCKET).getPublicUrl(`${FOLDER}/${f.name}`).data.publicUrl,
        path: `${FOLDER}/${f.name}`,
      })))
    } catch (e) {
      setError(e.message)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleUpload = async (files) => {
    setUploading(true)
    try {
      for (const file of files) {
        const ext = file.name.split('.').pop()
        const path = `${FOLDER}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
        const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false })
        if (error) throw error
      }
      await load()
    } catch (e) {
      setError(e.message)
    } finally { setUploading(false) }
  }

  const handleDelete = async (avatar) => {
    setDeleting(avatar.path)
    try {
      const { error } = await supabase.storage.from(BUCKET).remove([avatar.path])
      if (error) throw error
      setAvatars(prev => prev.filter(a => a.path !== avatar.path))
    } catch (e) {
      setError(e.message)
    } finally { setDeleting(null) }
  }

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Preset Avatar Pool</p>
          <p className="text-xs text-amber-700 mt-0.5">
            Images stored here are randomly assigned to new users at sign-up.
            The assignment logic reads from the <code className="bg-amber-100 px-1 rounded">avatars/presets/</code> folder.
            Minimum recommended: 10–20 images for variety.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <UploadZone onFiles={handleUpload} loading={uploading} />

      {loading ? (
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : avatars.length === 0 ? (
        <div className="text-center py-14 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <User size={36} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-500">No preset avatars yet</p>
          <p className="text-xs text-gray-400 mt-1">Upload images above to populate the pool</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-600">
              {avatars.length} preset avatar{avatars.length !== 1 ? 's' : ''} in pool
            </p>
            <button onClick={load} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700">
              <RefreshCw size={12} /> Refresh
            </button>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
            {avatars.map(av => (
              <ImageCard
                key={av.path}
                src={av.url}
                onDelete={() => handleDelete(av)}
                deleting={deleting === av.path}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2: BADGE IMAGE LIBRARY
// ═══════════════════════════════════════════════════════════════════════════════
function BadgeLibraryTab() {
  const [badges, setBadges] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', icon_url: '', file: null, preview: '' })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const { data, error } = await supabase
        .from('badges')
        .select('id, title, icon_url, created_at')
        .is('quiz_id', null)
        .is('tutorial_id', null)
        .order('created_at', { ascending: true })
      if (error) throw error
      setBadges(data || [])
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleFileSelect = (files) => {
    const file = files[0]
    if (!file) return
    const preview = URL.createObjectURL(file)
    setForm(f => ({ ...f, file, preview, icon_url: '' }))
  }

  const uploadFile = async (file) => {
    const ext = file.name.split('.').pop()
    const path = `badges/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('badges').upload(path, file, { upsert: false })
    if (error) throw error
    return supabase.storage.from('badges').getPublicUrl(path).data.publicUrl
  }

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Badge title is required'); return }
    if (!form.file && !form.icon_url.trim()) { setError('Provide an image file or URL'); return }
    setSaving(true); setError('')
    try {
      let icon_url = form.icon_url.trim()
      if (form.file) icon_url = await uploadFile(form.file)
      const { error } = await supabase.from('badges').insert({
        title: form.title.trim(),
        icon_url,
        quiz_id: null,
        tutorial_id: null,
      })
      if (error) throw error
      setForm({ title: '', icon_url: '', file: null, preview: '' })
      setShowForm(false)
      await load()
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (badge) => {
    setDeleting(badge.id)
    try {
      const { error } = await supabase.from('badges').delete().eq('id', badge.id)
      if (error) throw error
      setBadges(prev => prev.filter(b => b.id !== badge.id))
    } catch (e) { setError(e.message) }
    finally { setDeleting(null) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 bg-indigo-50 border border-indigo-200 rounded-xl p-4">
        <Award size={16} className="text-indigo-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-indigo-800">Badge Image Library</p>
          <p className="text-xs text-indigo-700 mt-0.5">
            These images appear in the badge picker when teachers create quizzes or tutorials.
            Teachers borrow the image URL — they don't reuse these rows directly.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          <AlertCircle size={14} /> {error}
          <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      <button
        onClick={() => setShowForm(s => !s)}
        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
      >
        <Plus size={15} /> Add Badge Image
      </button>

      {/* Add form */}
      {showForm && (
        <div className="bg-white border border-indigo-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <Award size={14} className="text-indigo-600" /> New Badge Image
          </h3>
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1">Badge Name *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. HTML Champion"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1">Upload Image</label>
              <UploadZone onFiles={handleFileSelect} loading={uploading} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1">Or Paste Image URL</label>
              <input
                type="url"
                value={form.icon_url}
                onChange={e => setForm(f => ({ ...f, icon_url: e.target.value, file: null, preview: '' }))}
                placeholder="https://example.com/badge.png"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 h-10"
              />
              {(form.preview || form.icon_url) && (
                <div className="mt-3 flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <img
                    src={form.preview || form.icon_url}
                    alt="preview"
                    className="w-14 h-14 object-contain rounded-lg border border-gray-200 bg-white"
                  />
                  <p className="text-xs text-gray-500">{form.title || 'Preview'}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button onClick={() => { setShowForm(false); setForm({ title: '', icon_url: '', file: null, preview: '' }); setError('') }}
              className="flex-1 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {saving ? 'Saving…' : 'Save Badge'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 gap-3">
          {Array(7).fill(0).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : badges.length === 0 ? (
        <div className="text-center py-14 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <Award size={36} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-500">No badge images yet</p>
          <p className="text-xs text-gray-400 mt-1">Add badge images above for teachers to choose from</p>
        </div>
      ) : (
        <>
          <p className="text-sm font-semibold text-gray-600">{badges.length} badge image{badges.length !== 1 ? 's' : ''} in library</p>
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 gap-3">
            {badges.map(b => (
              <ImageCard
                key={b.id}
                src={b.icon_url}
                label={b.title}
                onDelete={() => handleDelete(b)}
                deleting={deleting === b.id}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3: LEARN CATEGORIES
// ═══════════════════════════════════════════════════════════════════════════════
const EMPTY_CAT = { id: '', title: '', description: '', color: '#3b82f6', icon_url: '', order_index: 0 }

function CategoryForm({ initial, onSave, onCancel, saving, error }) {
  const [form, setForm] = useState(initial || EMPTY_CAT)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(initial?.icon_url || '')
  const [uploading, setUploading] = useState(false)
  const isEdit = !!initial?.id

  const handleFileSelect = (files) => {
    const f = files[0]; if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setForm(p => ({ ...p, icon_url: '' }))
  }

  const uploadIcon = async (f) => {
    setUploading(true)
    try {
      const ext = f.name.split('.').pop()
      const path = `category-icons/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('tutorial_images').upload(path, f, { upsert: false })
      if (error) throw error
      return supabase.storage.from('tutorial_images').getPublicUrl(path).data.publicUrl
    } finally { setUploading(false) }
  }

  const handleSubmit = async () => {
    let icon_url = form.icon_url
    if (file) icon_url = await uploadIcon(file)
    // auto-generate id from title if new
    const id = isEdit ? form.id : (form.id.trim() || slugify(form.title))
    onSave({ ...form, id, icon_url })
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm">
      <h3 className="text-sm font-bold text-gray-800">
        {isEdit ? `Edit "${initial.title}"` : 'New Category'}
      </h3>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-700">
          <AlertCircle size={12} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-gray-600 mb-1">Title *</label>
          <input type="text" value={form.title}
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            placeholder="e.g. HTML"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-600 mb-1">
            ID (slug) {!isEdit && <span className="font-normal text-gray-400">— auto-generated if blank</span>}
          </label>
          <input type="text" value={form.id}
            onChange={e => setForm(p => ({ ...p, id: slugify(e.target.value) }))}
            placeholder="html"
            disabled={isEdit}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:bg-gray-50 disabled:text-gray-400 font-mono" />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-gray-600 mb-1">Description</label>
        <input type="text" value={form.description || ''}
          onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
          placeholder="Short description of what students learn here"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Color */}
        <div>
          <label className="text-xs font-bold text-gray-600 mb-2">Accent Color</label>
          <div className="flex items-center gap-2 flex-wrap">
            {ACCENT_COLORS.map(c => (
              <button key={c} type="button"
                onClick={() => setForm(p => ({ ...p, color: c }))}
                className={`w-7 h-7 rounded-full transition-all border-2 ${form.color === c ? 'border-gray-800 scale-110' : 'border-transparent hover:scale-105'}`}
                style={{ backgroundColor: c }} />
            ))}
            <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
              <Palette size={12} />
              <input type="color" value={form.color}
                onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
                className="w-6 h-6 rounded cursor-pointer border-0" />
              Custom
            </label>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="w-5 h-5 rounded-full" style={{ backgroundColor: form.color }} />
            <code className="text-xs text-gray-500">{form.color}</code>
          </div>
        </div>

        {/* Order */}
        <div>
          <label className="text-xs font-bold text-gray-600 mb-1">Display Order</label>
          <input type="number" min={0} value={form.order_index}
            onChange={e => setForm(p => ({ ...p, order_index: parseInt(e.target.value) || 0 }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>
      </div>

      {/* Icon */}
      <div>
        <label className="text-xs font-bold text-gray-600 mb-1">Category Icon</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <UploadZone onFiles={handleFileSelect} loading={uploading} />
            <p className="text-xs text-gray-400 mt-1">Uploads to <code>tutorial_images</code> bucket</p>
          </div>
          <div className="flex flex-col gap-2">
            <input type="url" value={form.icon_url}
              onChange={e => { setForm(p => ({ ...p, icon_url: e.target.value })); setFile(null); setPreview(e.target.value) }}
              placeholder="Or paste image URL…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            {(preview) && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: form.color + '22' }}>
                  <img src={preview} alt="preview"
                    className="w-9 h-9 object-contain"
                    onError={e => e.target.style.display = 'none'} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700">{form.title || 'Preview'}</p>
                  <p className="text-xs text-gray-400">Category icon</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button onClick={onCancel}
          className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={saving || uploading}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-emerald-500 rounded-xl hover:bg-emerald-600 disabled:opacity-50">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          {saving ? 'Saving…' : isEdit ? 'Update' : 'Create'}
        </button>
      </div>
    </div>
  )
}

function LearnCategoriesTab() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(null)   // null = none, 'new' = create form, id = edit
  const [deleting, setDeleting] = useState(null)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const { data, error } = await supabase
        .from('learn_categories')
        .select('*')
        .order('order_index', { ascending: true })
      if (error) throw error
      setCategories(data || [])
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleSave = async (form) => {
    if (!form.title.trim()) { setError('Title is required'); return }
    if (!form.id.trim()) { setError('Category ID (slug) is required'); return }
    setSaving(true); setError('')
    try {
      if (editing === 'new') {
        const { error } = await supabase.from('learn_categories').insert({
          id: form.id,
          title: form.title,
          description: form.description || null,
          color: form.color,
          icon_url: form.icon_url || null,
          order_index: form.order_index,
        })
        if (error) throw error
      } else {
        const { error } = await supabase.from('learn_categories').update({
          title: form.title,
          description: form.description || null,
          color: form.color,
          icon_url: form.icon_url || null,
          order_index: form.order_index,
        }).eq('id', form.id)
        if (error) throw error
      }
      setEditing(null)
      await load()
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (cat) => {
    if (!confirm(`Delete category "${cat.title}"? This cannot be undone.`)) return
    setDeleting(cat.id)
    try {
      const { error } = await supabase.from('learn_categories').delete().eq('id', cat.id)
      if (error) throw error
      setCategories(prev => prev.filter(c => c.id !== cat.id))
    } catch (e) { setError(e.message) }
    finally { setDeleting(null) }
  }

  const moveOrder = async (cat, dir) => {
    const idx = categories.findIndex(c => c.id === cat.id)
    const swap = categories[idx + dir]
    if (!swap) return
    // Swap order_index values
    try {
      await supabase.from('learn_categories').update({ order_index: swap.order_index }).eq('id', cat.id)
      await supabase.from('learn_categories').update({ order_index: cat.order_index }).eq('id', swap.id)
      await load()
    } catch (e) { setError(e.message) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
        <BookOpen size={16} className="text-emerald-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-emerald-800">Learn Page Categories</p>
          <p className="text-xs text-emerald-700 mt-0.5">
            Categories organize lessons on the student Learn page.
            Use the order controls to arrange how they appear.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          <AlertCircle size={14} /> {error}
          <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      <button
        onClick={() => { setEditing('new'); setError('') }}
        disabled={editing !== null}
        className="flex items-center ml-auto gap-2 px-4 py-2.5 bg-emerald-500 text-white text-sm font-semibold rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50"
      >
        <Plus size={15} /> New Category
      </button>

      {editing === 'new' && (
        <CategoryForm
          initial={{ ...EMPTY_CAT, order_index: categories.length }}
          onSave={handleSave}
          onCancel={() => { setEditing(null); setError('') }}
          saving={saving}
          error={error}
        />
      )}

      {loading ? (
        <div className="space-y-3">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-14 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <Layers size={36} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-500">No categories yet</p>
          <p className="text-xs text-gray-400 mt-1">Create your first Learn category above</p>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat, idx) => (
            <div key={cat.id}>
              {editing === cat.id ? (
                <CategoryForm
                  initial={cat}
                  onSave={handleSave}
                  onCancel={() => { setEditing(null); setError('') }}
                  saving={saving}
                  error={error}
                />
              ) : (
                <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
                  {/* Color dot + icon */}
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: cat.color + '22', border: `2px solid ${cat.color}44` }}>
                    {cat.icon_url
                      ? <img src={cat.icon_url} alt={cat.title} className="w-8 h-8 object-contain" />
                      : <div className="w-5 h-5 rounded-full" style={{ backgroundColor: cat.color }} />}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-800 truncate">{cat.title}</p>
                      <code className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-mono shrink-0">{cat.id}</code>
                    </div>
                    {cat.description && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{cat.description}</p>
                    )}
                  </div>

                  {/* Color swatch */}
                  <div className="w-5 h-5 rounded-full shrink-0 border border-white shadow-sm"
                    style={{ backgroundColor: cat.color }} title={cat.color} />

                  {/* Order controls */}
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button onClick={() => moveOrder(cat, -1)} disabled={idx === 0}
                      className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-20">
                      <ChevronUp size={14} />
                    </button>
                    <button onClick={() => moveOrder(cat, 1)} disabled={idx === categories.length - 1}
                      className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-20">
                      <ChevronDown size={14} />
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => { setEditing(cat.id); setError('') }}
                      className="p-2 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(cat)} disabled={deleting === cat.id}
                      className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50">
                      {deleting === cat.id
                        ? <Loader2 size={14} className="animate-spin" />
                        : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
const TABS = [
  { key: 'avatars',     label: 'Avatar Presets',    icon: User,        desc: 'Default avatars for new users' },
  { key: 'badges',      label: 'Badge Library',     icon: Award,       desc: 'Preset images for teacher badges' },
  { key: 'categories',  label: 'Learn Categories',  icon: BookOpen,    desc: 'Organize the student learn page' },
]

export default function PlatformConfig() {
  const [activeTab, setActiveTab] = useState('avatars')
  const active = TABS.find(t => t.key === activeTab)

  return (
    <div className="max-w-7xl mx-auto space-y-6 py-4">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-800">Platform Configuration</h1>
        <p className="text-sm text-gray-500 mt-1">Manage shared image libraries and learn page structure</p>
      </div>

      {/* Tab bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {TABS.map(({ key, label, icon: Icon, desc }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-left transition-all! ${
              activeTab === key
                ? 'border-emerald-400 bg-emerald-50 shadow-sm'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              activeTab === key ? 'bg-emerald-400 text-white' : 'bg-gray-100 text-gray-500'
            }`}>
              <Icon size={16} />
            </div>
            <div className="min-w-0">
              <p className={`text-sm font-bold ${activeTab === key ? 'text-emerald-800' : 'text-gray-700'}`}>
                {label}
              </p>
              <p className={`text-xs ${activeTab === key ? 'text-emerald-600' : 'text-gray-400'}`}>{desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Tab content card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
          {active && <active.icon size={16} className="text-amber-500" />}
          <h2 className="font-bold text-gray-800">{active?.label}</h2>
        </div>

        {activeTab === 'avatars'    && <AvatarPresetsTab />}
        {activeTab === 'badges'     && <BadgeLibraryTab />}
        {activeTab === 'categories' && <LearnCategoriesTab />}
      </div>
    </div>
  )
}