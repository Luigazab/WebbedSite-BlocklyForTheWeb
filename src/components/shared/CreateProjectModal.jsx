import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuthStore } from '../../store/authStore'
import { projectService } from '../../services/project.service'
import { createDefaultProjectFiles } from '../../services/projectfiles.service'
import { X, Loader2 } from 'lucide-react'

const MODES = [
  { title: 'Blocks', description: 'Code using drag and drop blocks' },
  { title: 'Code',   description: 'Code in traditional text mode'  },
]

export default function CreateProjectModal({ onClose, onCreated }) {
  const navigate = useNavigate()
  const profile  = useAuthStore((s) => s.profile)

  const [form, setForm] = useState({ title: '', description: '', mode: 'Blocks' })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return

    setLoading(true)
    setError(null)

    try {
      if (form.mode === 'Blocks') {
        const project = await projectService.createBlocksProject({
          title:       form.title.trim(),
          description: form.description.trim(),
        })

        await createDefaultProjectFiles(project.id)

        navigate(`/${profile?.role}/editor/${project.id}`, {
          state: { projectTitle: project.title },
        })
      } else {
        onCreated?.({ ...form })
        onClose()
      }
    } catch (err) {
      console.error('Error creating project:', err)
      setError(err.message || 'Failed to create project')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-99 flex items-center justify-center p-4">
      <div className="card max-w-xl w-full">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Create Project</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 py-2">
          <div className="flex gap-5">

            {/* Left: title + description */}
            <div className="w-1/2 flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-gray-700">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Name your project"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blockly-purple focus:ring-2 focus:ring-blockly-purple/10 transition"
                  required
                  disabled={loading}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-gray-700">
                  Description <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="What is this project about?"
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm resize-none focus:outline-none focus:border-blockly-purple focus:ring-2 focus:ring-blockly-purple/10 transition"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Right: mode selector */}
            <div className="w-1/2 flex flex-col gap-2 justify-end">
              <label className="text-sm font-bold text-gray-700">Mode</label>
              {MODES.map((m) => (
                <button
                  key={m.title}
                  type="button"
                  disabled={loading}
                  onClick={() => setForm((f) => ({ ...f, mode: m.title }))}
                  className={`flex flex-col items-start gap-0.5 p-4 rounded-xl border-2 transition-all text-left
                    ${form.mode === m.title
                      ? 'border-blockly-purple bg-blockly-purple/5'
                      : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <span className={`font-bold text-sm ${form.mode === m.title ? 'text-blockly-purple' : 'text-gray-800'}`}>
                    {m.title}
                  </span>
                  <span className="text-xs text-gray-500">{m.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg px-4 py-2">{error}</p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn px-5 py-2 text-sm font-semibold text-gray-600 bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !form.title.trim()}
              className="btn btn-primary px-5 py-2 text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Creating…' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}