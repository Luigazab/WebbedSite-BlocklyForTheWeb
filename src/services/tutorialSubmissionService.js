import { supabase } from '../supabaseClient'

export async function tutorialAction(body) {
  const { data, error } = await supabase.functions.invoke('tutorial', { body })
  if (error) {
    let message = error.message
    try { message = (await error.context.json()).error ?? message } catch { /* Network errors have no response body. */ }
    throw new Error(message)
  }
  if (data?.error) throw new Error(data.error)
  return data
}

export async function saveTutorialSubmission(body) {
  const submission = (await tutorialAction({ ...body, action: 'submit' })).submission
  if (body.finish) { const { error } = await supabase.rpc('copy_learning_project',{p_lesson:body.lessonId}); if(error) console.error('Tutorial submitted, but project copy could not be saved:',error.message) }
  return submission
}

export async function saveTutorialDefinition(definition, publish = false) {
  return (await tutorialAction({ action: 'save', definition, publish })).saved
}
