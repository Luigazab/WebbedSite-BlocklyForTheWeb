import { AlertTriangle, Loader2, X } from 'lucide-react'
import React from 'react'

const DeleteModal = ({isOpen, onClose, onConfirm, title = 'Delete Item', message = 'This action cannot be undone.', confirmText = 'Delete', loading = false}) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card max-w-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          </div>
          <button onClick={onClose} disabled={loading} className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <hr className='text-gray-300'/>

        <div className="justify-center items-center flex">
          <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={onClose} disabled={loading} className="flex-1 btn border border-gray-300 text-gray-600 disabled:opacity-50">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} disabled={loading} className="flex-1 flex btn items-center justify-center btn-accent disabled:opacity-50">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteModal