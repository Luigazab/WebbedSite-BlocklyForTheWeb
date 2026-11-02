import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { captureWebsiteThumbnail } from '../utils/websiteThumbnail.js'
import { uploadProjectThumbnail } from '../services/projectThumbnail.js'

export function useWebsiteThumbnail() {
  const [loading, setLoading] = useState(false)
  const saveThumbnail = async (html, projectId) => {
    setLoading(true)
    try {
      const blob = await captureWebsiteThumbnail(html)
      return await uploadProjectThumbnail(supabase, projectId, blob)
    } finally {
      setLoading(false)
    }
  }
  return { saveThumbnail, loading }
}
