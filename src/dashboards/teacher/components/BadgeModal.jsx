import { useState, useEffect } from 'react'
import { Award, Check, X } from 'lucide-react'
import BadgePicker from './BadgePicker'
import { upsertTutorialBadge, deleteTutorialBadge } from '../../../services/tutorial.service'

// BadgeModal: shown after saving a tutorial to let teachers award a completion badge.
// Props:
//   tutorialId   — the saved tutorial UUID
//   existingBadge — { id, title, description, icon_url } | null (already in DB)
//   onClose      — () => void
//   onSaved      — (badge | null) => void  — called after DB write

export default function BadgeModal({ tutorialId, existingBadge, onClose, onSaved }) {
  const [badge, setBadge] = useState(
    existingBadge
      ? { id: existingBadge.id, title: existingBadge.title, description: existingBadge.description, icon_url: existingBadge.icon_url }
      : null
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!badge) {
      // User explicitly removed the badge
      if (existingBadge?.id) {
        setSaving(true)
        try {
          await deleteTutorialBadge(existingBadge.id)
          onSaved(null)
          onClose()
        } catch (err) {
          setError(err.message)
        } finally {
          setSaving(false)
        }
      } else {
        onClose()
      }
      return
    }

    if (!badge.title?.trim()) {
      setError('Badge name is required.')
      return
    }
    if (!badge.icon_url) {
      setError('Please select or upload a badge image.')
      return
    }

    setSaving(true)
    setError('')
    try {
      const saved = await upsertTutorialBadge(tutorialId, {
        id: badge.id ?? existingBadge?.id,
        title: badge.title.trim(),
        description: badge.description?.trim() || '',
        icon_url: badge.icon_url,
      })
      onSaved(saved)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-100 rounded-xl">
              <Award size={18} className="text-amber-600" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-800">Completion Badge</h2>
              <p className="text-xs text-slate-500">Award a badge when students finish this tutorial</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <BadgePicker value={badge} onChange={setBadge} />
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-4 border-t border-slate-100 space-y-3">
          {error && (
            <p className="text-xs text-red-500 font-semibold">{error}</p>
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Skip for now
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 text-sm font-semibold flex items-center justify-center gap-2 btn btn-primary rounded-xl disabled:opacity-50"
            >
              <Check size={15} />
              {saving ? 'Saving…' : badge ? 'Save Badge' : 'Remove Badge'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}