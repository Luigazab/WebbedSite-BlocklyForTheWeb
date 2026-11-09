import { useState } from 'react'
import { supabase } from '../../supabaseClient'
import { Button } from '../ui/button'

export default function TopicPublicationButton({ topicId, published, onChanged }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function toggle() {
    if (busy) return
    setBusy(true); setError('')
    try {
      const { data, error: cause } = await supabase.from('topics').update({ is_published: !published }).eq('id', topicId).select('id,is_published').single()
      if (cause) throw cause
      await onChanged?.(data)
    } catch (cause) { setError(cause.message || 'Could not update topic publication.') }
    finally { setBusy(false) }
  }
  return <div className="flex flex-col items-start gap-1">
    <Button type="button" size="sm" variant="outline" disabled={busy} onClick={toggle}>{busy ? 'Saving…' : published ? 'Move to draft' : 'Publish topic'}</Button>
    {error && <p role="alert" className="max-w-xs text-xs text-red-700 dark:text-red-300">{error}</p>}
  </div>
}
