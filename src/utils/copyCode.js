import { useState } from 'react'
import { toast } from 'sonner'

export function useCopyCode() {
  const [copied, setCopied] = useState(false)

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast.success('Classroom code copied to your clipboard successfully!')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Failed to copy code')
    }
  }

  return { copied, copyCode }
}
