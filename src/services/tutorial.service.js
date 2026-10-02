import { supabase } from '../supabaseClient'
import { buildStudentSteps } from '../utils/tutorialSteps'

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
      lesson:lesson_id ( id, title ),
      block_tutorial_step_files ( * ),
      block_tutorial_steps ( *, block_tutorial_step_expected ( * ) ),
      text_tutorial_steps ( *, text_tutorial_step_files ( * ) )
    `)
    .eq('id', id)
    .single()
  if (error) throw error
  if (data.type === 'block') return { ...data, title: data.lesson?.title, badges: [], tutorial_steps: buildStudentSteps(data.block_tutorial_steps ?? [], data.block_tutorial_step_files ?? []) }
  const steps = data.type === 'block' ? data.block_tutorial_steps : data.text_tutorial_steps
  return { ...data, title: data.lesson?.title, badges: [], tutorial_steps: (steps ?? []).map(step => ({
    ...step, instruction_text: step.instruction, order_index: step.order,
    expected_blocks_exact: step.block_tutorial_step_expected?.[0]?.expected_blocks_json ?? null,
    tutorial_step_files: (step.block_tutorial_step_files ?? step.text_tutorial_step_files ?? []).map(file => ({
      ...file, blocks_json: file.initial_content_json ?? null, code: file.initial_content ?? '',
    })),
  })).sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)) }
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
  const { step_order: _stepOrder, ...safe } = payload
  const { data, error } = await supabase
    .from('tutorial_steps')
    .insert([safe])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateTutorialStep(id, payload) {
  const { step_order: _stepOrder, ...safe } = payload
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
