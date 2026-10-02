import { useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useClassroomStore } from '../store/classroomStore'

export default function useClassroomLivePosts(classroomId) {
  const refresh = useClassroomStore(state => state.refreshClassroomPosts)
  useEffect(() => {
    if (!classroomId) return
    const reload = () => { refresh(classroomId).catch(() => {}) }
    const channel = supabase.channel(`classroom-activity:${classroomId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'classroom_posts', filter: `classroom_id=eq.${classroomId}` }, reload)
      .subscribe()
    window.addEventListener('focus', reload)
    return () => {
      window.removeEventListener('focus', reload)
      supabase.removeChannel(channel)
    }
  }, [classroomId, refresh])
}
