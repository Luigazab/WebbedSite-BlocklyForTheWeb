import { Dialog } from '@headlessui/react'
import { useEffect, useState } from 'react'
import { Loader2, Upload, X } from 'lucide-react'
import { profileService } from '../../services/profile.service'

export default function ProfilePictureModal({ open, onClose, onSelect, saving = false }) {
  const [avatars, setAvatars] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [preview, setPreview] = useState('')

  useEffect(() => {
    if (!open) return
    let active = true
    setLoading(true)
    setError('')
    profileService.getPresetAvatars()
      .then(items => { if (active) setAvatars(items) })
      .catch(err => { if (active) setError(err.message || 'Could not load avatars.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [open])

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

  const chooseFile = file => {
    if (!file) return
    if (!file.type.startsWith('image/') || file.size > 2 * 1024 * 1024) {
      setError('Choose an image smaller than 2 MB.')
      return
    }
    setError('')
    setSelected({ file })
    setPreview(URL.createObjectURL(file))
  }

  const save = async () => {
    if (!selected || saving) return
    try {
      setError('')
      await onSelect(selected)
      setSelected(null)
      setPreview('')
      onClose()
    } catch (err) {
      setError(err.message || 'Could not save your avatar.')
    }
  }

  return <Dialog open={open} onClose={saving ? () => {} : onClose} className="relative z-50">
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" aria-hidden="true" />
    <div className="fixed inset-0 flex items-center justify-center p-4">
      <Dialog.Panel className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div><Dialog.Title className="text-xl font-black text-slate-900">Choose your avatar</Dialog.Title><p className="mt-1 text-sm text-slate-500">Pick from the avatar pool or upload your own picture.</p></div>
          <button type="button" onClick={onClose} disabled={saving} aria-label="Close avatar picker" className="rounded-full p-2 text-slate-500 hover:bg-slate-100"><X size={20} /></button>
        </div>
        {loading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blockly-purple" /></div> : <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {avatars.map(avatar => <button key={avatar.path} type="button" onClick={() => { setSelected(avatar); setPreview(''); setError('') }} aria-label={`Choose ${avatar.name}`} aria-pressed={selected?.path === avatar.path} className={`aspect-square overflow-hidden rounded-2xl border-4 bg-slate-50 p-1 ${selected?.path === avatar.path ? 'border-blockly-purple' : 'border-transparent hover:border-violet-200'}`}><img src={avatar.url} alt={avatar.name} className="h-full w-full rounded-xl object-cover" /></button>)}
        </div>}
        {!loading && avatars.length === 0 && !error && <p className="mt-3 text-sm text-slate-500">No preset avatars are available yet. You can upload a picture.</p>}
        <label className="mt-5 flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed border-violet-200 p-4 hover:bg-violet-50">
          {selected?.file && preview ? <img src={preview} alt="Your uploaded picture preview" className="h-14 w-14 rounded-xl object-cover" /> : <Upload className="h-8 w-8 text-blockly-purple" />}
          <span className="text-sm font-semibold text-slate-700">Upload your picture <span className="text-xs font-normal text-slate-500">Image, up to 2 MB</span></span>
          <input type="file" accept="image/*" className="sr-only" onChange={event => { chooseFile(event.target.files?.[0]); event.target.value = '' }} />
        </label>
        {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
        <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={onClose} disabled={saving} className="rounded-xl px-5 py-2.5 font-semibold text-slate-600 hover:bg-slate-100">Cancel</button><button type="button" onClick={save} disabled={!selected || saving} className="rounded-xl bg-blockly-purple px-5 py-2.5 font-semibold text-white disabled:opacity-50">{saving ? 'Saving…' : 'Use this avatar'}</button></div>
      </Dialog.Panel>
    </div>
  </Dialog>
}
