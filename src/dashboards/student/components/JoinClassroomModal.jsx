import { useState } from 'react'
import { X, Loader2, Hash } from 'lucide-react'

export default function JoinClassroomModal({ onSubmit, onClose, loading }) {
  const [code,  setCode]  = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!code.trim()) { setError('Please enter a join code.'); return }
    setError('')
    try {
      await onSubmit(code.trim().toUpperCase())
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blockly-purple/10 flex items-center justify-center">
              <Hash className="w-5 h-5 text-blockly-purple" />
            </div>
            <h2 className="text-base font-bold text-gray-800">Join a Classroom</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <p className="text-sm text-gray-500">
            Ask your teacher for the 6-character classroom code.
          </p>

          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. AB12CD"
            maxLength={6}
            autoFocus
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center text-2xl font-black tracking-[0.4em] text-blockly-purple uppercase focus:outline-none focus:border-blockly-purple transition-colors"
          />

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || code.trim().length === 0}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-blockly-purple rounded-xl hover:bg-blockly-purple/90 disabled:opacity-50 transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Join'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}