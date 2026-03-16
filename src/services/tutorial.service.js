import { supabase } from '../supabaseClient'

// ─── Tutorials ────────────────────────────────────────────────────────────────

export async function fetchTeacherTutorials(teacherId) {
  const { data, error } = await supabase
    .from('tutorials')
    .select('*, tutorial_steps ( id ), badges ( id, title, icon_url )')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function fetchTutorialById(id) {
  const { data, error } = await supabase
    .from('tutorials')
    .select(`
      *,
      badges ( id, title, description, icon_url ),
      tutorial_steps (
        id, instruction_text, hint, step_order, order_index,
        expected_blocks_exact, minimum_blocks,
        tutorial_step_files ( id, filename, blocks_json, order_index )
      )
    `)
    .eq('id', id)
    .single()
  if (error) throw error
  if (data?.tutorial_steps) {
    data.tutorial_steps.sort((a, b) =>
      (a.order_index ?? a.step_order) - (b.order_index ?? b.step_order)
    )
    data.tutorial_steps.forEach((s) => {
      if (s.tutorial_step_files)
        s.tutorial_step_files.sort((a, b) => a.order_index - b.order_index)
    })
  }
  return data
}

export async function createTutorial(payload) {
  const { data, error } = await supabase
    .from('tutorials')
    .insert([payload])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateTutorial(id, payload) {
  const { data, error } = await supabase
    .from('tutorials')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteTutorial(id) {
  const { error } = await supabase.from('tutorials').delete().eq('id', id)
  if (error) throw error
}

// ─── Tutorial Steps ───────────────────────────────────────────────────────────

export async function createTutorialStep(payload) {
  const { step_order, ...safe } = payload
  const { data, error } = await supabase
    .from('tutorial_steps')
    .insert([safe])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateTutorialStep(id, payload) {
  const { step_order, ...safe } = payload
  const { data, error } = await supabase
    .from('tutorial_steps')
    .update(safe)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteTutorialStep(id) {
  const { error } = await supabase.from('tutorial_steps').delete().eq('id', id)
  if (error) throw error
}

export async function reorderTutorialSteps(orderedIds) {
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from('tutorial_steps').update({ order_index: index }).eq('id', id)
    )
  )
}

// ─── Tutorial Step Files ──────────────────────────────────────────────────────
// Replaces all files for a step with the provided array.
// Simple delete-then-insert — these are template files with no downstream FK refs.

export async function saveStepFiles(stepId, files) {
  // Delete all existing files for this step
  const { error: delErr } = await supabase
    .from('tutorial_step_files')
    .delete()
    .eq('step_id', stepId)
  if (delErr) throw delErr

  if (!files.length) return []

  const { data, error } = await supabase
    .from('tutorial_step_files')
    .insert(
      files.map((f, i) => ({
        step_id:     stepId,
        filename:    f.filename,
        blocks_json: f.blocks_json ?? {},
        order_index: i,
      }))
    )
    .select()
  if (error) throw error
  return data
}

// ─── Badges ───────────────────────────────────────────────────────────────────

export async function upsertTutorialBadge(tutorialId, { id, title, description, icon_url }) {
  if (id) {
    const { data, error } = await supabase
      .from('badges')
      .update({ title, description, icon_url, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  }
  const { data, error } = await supabase
    .from('badges')
    .insert([{ tutorial_id: tutorialId, title, description, icon_url }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteTutorialBadge(badgeId) {
  const { error } = await supabase.from('badges').delete().eq('id', badgeId)
  if (error) throw error
}