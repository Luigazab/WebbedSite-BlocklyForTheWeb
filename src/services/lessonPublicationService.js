import { supabase } from '../supabaseClient'

export async function publishSavedLesson(lessonId) {
  // The database publication trigger validates the complete saved definition.
  const { data, error } = await supabase.from('lessons').update({ is_published: true }).eq('id', lessonId).select('id,is_published').single()
  if (error) throw error
  return data
}
