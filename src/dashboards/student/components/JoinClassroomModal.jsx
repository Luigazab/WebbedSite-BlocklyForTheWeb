import { useState } from 'react'
import { X, Loader2, Hash } from 'lucide-react'

export default function JoinClassroomModal({ onSubmit, onClose }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (code.trim().length < 6) return
    setLoading(true)
    try {
      await onSubmit(code.trim().toUpperCase())
    } finally {
      setLoading(false)
    }
  }

  // Auto-uppercase as user types
  const handleChange = (e) => {
    setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Join a Classroom</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Class Code</label>
            <p className="text-xs text-gray-400">Ask your teacher for the 6-character class code</p>
            <div className="relative mt-1">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={code}
                onChange={handleChange}
                placeholder="ABC123"
                maxLength={6}
                className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-3 text-xl font-bold text-center tracking-[0.4em] text-blockly-purple placeholder:text-gray-200 placeholder:font-normal placeholder:tracking-normal focus:outline-none focus:border-blockly-purple focus:ring-2 focus:ring-blockly-purple/10 transition uppercase"
                required
              />
            </div>
            {/* Character dots */}
            <div className="flex justify-center gap-2 mt-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i < code.length ? 'bg-blockly-purple' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || code.length < 6}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blockly-purple text-white text-sm font-semibold rounded-lg hover:bg-blockly-purple/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Join Classroom'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}