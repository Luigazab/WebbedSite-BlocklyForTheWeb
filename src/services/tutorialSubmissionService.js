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
  return (await tutorialAction({ ...body, action: 'submit' })).submission
}

export async function saveTutorialDefinition(definition, publish = false) {
  return (await tutorialAction({ action: 'save', definition, publish })).saved
}
