import { useState } from 'react'
import { X } from 'lucide-react'

const MODES = [
  { title: 'Blocks', description: 'Code using drag and drop blocks'},
  { title: 'Code',   description: 'Code in traditional text mode'},
]

export default function CreateProjectModal({ onClose, onConfirm }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    mode: 'Blocks',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    onConfirm(form)
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card max-w-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 m-4">
          <h2 className="text-xl font-bold text-gray-800">Create Project</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <hr className='text-gray-500'/>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 m-4">
          {/* Title */}
          <div className='flex gap-5'>
            <div className='w-2/4 flex flex-col justify-between'>
              <div className="flex flex-col gap-1.5">
                <label className="text-lg font-bold text-gray-700">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Name your project"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blockly-purple focus:ring-2 focus:ring-blockly-purple/10 transition"
                  required
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-lg font-bold text-gray-700">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Value"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blockly-purple focus:ring-2 focus:ring-blockly-purple/10 transition"
                />
              </div>
            </div>

            {/* Mode selection */}
            <div className="flex gap-3 flex-1 justify-evenly">
              {MODES.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, mode }))}
                  className={`flex-1 border-2 rounded-xl px-4 py-2 transition-all
                    ${form.mode === mode
                      ? 'border-blockly-yellow bg-blockly-yellow/5'
                      : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="flex flex-col items-start gap-2 font-bold">
                    <h3 className='text-lg'>{mode.title}</h3>
                    <p className='text-md text-slate-500 text-justify'>{mode.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 justify-evenly">
            <button
              type="button"
              onClick={onClose}
              className="btn flex-1 bg-slate-200 text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!form.title.trim()}
              className="btn btn-secondary w-3/5"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}