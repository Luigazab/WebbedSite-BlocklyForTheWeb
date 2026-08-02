/*
 * Classroom Modal used in teacher/classrooms page
 * July 24, 2026 - checked 
 */
import { useState } from 'react'
import { X, Loader2, GraduationCap, RefreshCw } from 'lucide-react'
import { Button } from '#components/ui/button'
import { validateClassroomData } from '@/utils/validation/classroomValidation'
import { formatDate } from '@/utils/dateFormat'
import { useCopyCode } from '@/utils/copyCode'

export default function CreateClassroomModal({ mode = "create", classroom, onSubmit, onClose, loading, handleRegenerate }) {
  const [name, setName] = useState(classroom?.name || '')
  const [description, setDescription] = useState(classroom?.description || '')
  const [error, setError] = useState('')
  const {copied, copyCode} = useCopyCode()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      validateClassroomData({ name, description })
      setError('')
      await onSubmit({ id: classroom?.id, name: name.trim(), description: description.trim() })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border-b-8 border-slate-400">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blockly-blue/10 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-blockly-blue" />
            </div>
            <h2 className="text-base font-bold text-slate-800">
              {mode === "edit" ? "Edit Classroom" : "New Classroom" } 
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors!"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {mode === "edit" && classroom && (
          <div className="px-6 py-2 flex justify-between">
            <div>
              <p className='text-slate-400'>Class code:</p>
              <div className='flex items-end'>
                {copied
                  ? <button onClick={() => copyCode(classroom.join_code || '')} title="copy join code" className="rounded-md bg-green-500/15 px-2 py-1 font-mono text-[11px] font-extrabold tracking-widest text-green-500">
                      Code copied
                    </button>
                  : <button onClick={() => copyCode(classroom.join_code || '')} title="copy join code" className="rounded-md bg-primary/15 px-2 py-1 font-mono text-[11px] font-extrabold tracking-widest text-primary">
                      {classroom.join_code || "N/A"}
                    </button>
                }
                <button
                  onClick={handleRegenerate}
                  title="Regenerate code"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-blockly-blue hover:bg-blockly-blue/5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div>
              <p className='text-slate-400'>Created at:</p>
              <p className='text-slate-400'>{formatDate(classroom.created_at)}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-slate-700">
              Classroom name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Section Name ABC"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blockly-blue transition-colors!"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-slate-700">
              Description <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will students learn in this classroom?"
              rows={3}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blockly-blue transition-colors! resize-none"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 pt-1">
            <Button type="button" onClick={onClose} className="flex-1" variant='default'>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1" variant='primary'>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (mode === "edit" ? "Save Changes" : "Create Classroom")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}