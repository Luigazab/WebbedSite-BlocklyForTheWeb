import { useEffect } from 'react'
import { useUIStore } from '../../store/uiStore'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

const icons = {
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  error: <AlertCircle className="w-5 h-5 text-red-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
}

const styles = {
  success: 'border-green-200 bg-green-50 text-green-800',
  error: 'border-red-200 bg-red-50 text-red-800',
  info: 'border-blue-200 bg-blue-50 text-blue-800',
}

function ToastItem({ toast }) {
  const removeToast = useUIStore((state) => state.removeToast)

  // Auto-dismiss after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => removeToast(toast.id), 4000)
    return () => clearTimeout(timer)
  }, [toast.id])

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-md text-sm font-medium ${styles[toast.type]}`}>
      {icons[toast.type]}
      <span className="flex-1">{toast.message}</span>
      <button onClick={() => removeToast(toast.id)}>
        <X className="w-4 h-4 opacity-60 hover:opacity-100" />
      </button>
    </div>
  )
}

export default function Toast() {
  const toasts = useUIStore((state) => state.toasts)

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 w-full max-w-sm">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}