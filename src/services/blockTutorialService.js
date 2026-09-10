import { supabase } from "@/supabaseClient";

export async function fetchBlockTutorialByLessonId(lessonId) {
  const { data, error } = await supabase
    .from('lessons')
    .select(`
      id, title, topics_id, base_xp, is_published,
      tutorials (
        id, type,
        block_tutorial_steps ( id, instruction, hint, order, highlight_category_path, highlight_block_type ),
        block_tutorial_step_files ( id, filename, file_type, initial_content_json )
      )
    `)
    .eq('id', lessonId)
    .single()
  if (error) throw error

  const tutorial = data.tutorials?.[0] ?? null
  const steps = (tutorial?.block_tutorial_steps ?? [])
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  const files = tutorial?.block_tutorial_step_files ?? []

  let expected = []
  const stepIds = steps.map((s) => s.id)
  if (stepIds.length) {
    const { data: expData, error: expError } = await supabase
      .from('block_tutorial_step_expected')
      .select('id, step_id, file_id, expected_code, expected_blocks_json, test_cases')
      .in('step_id', stepIds)
    if (expError) throw expError
    expected = expData ?? []
  }

  return {
    lesson: {
      id: data.id,
      title: data.title,
      topicsId: data.topics_id,
      baseXp: data.base_xp,
      isPublished: data.is_published,
    },
    tutorial: tutorial ? { id: tutorial.id, type: tutorial.type } : null,
    steps,
    files,
    expected,
  }
}

export async function createBlockTutorial({ lessonId }) {
  const { data, error } = await supabase
    .from('tutorials')
    .insert({ lesson_id: lessonId, type: 'block' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function publishLesson(lessonId) {
  const { error } = await supabase
    .from('lessons')
    .update({ is_published: true })
    .eq('id', lessonId)
  if (error) throw error
}

export async function createStep({ tutorialId, instruction, hint, order, highlightCategoryPath, highlightBlockType }) {
  const { data, error } = await supabase
    .from('block_tutorial_steps')
    .insert({
      tutorial_id: tutorialId, instruction, hint, order,
      highlight_category_path: highlightCategoryPath ?? null,
      highlight_block_type: highlightBlockType ?? null,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateStep(stepId, { instruction, hint, order, highlightCategoryPath, highlightBlockType }) {
  const { data, error } = await supabase
    .from('block_tutorial_steps')
    .update({
      instruction, hint, order,
      highlight_category_path: highlightCategoryPath ?? null,
      highlight_block_type: highlightBlockType ?? null,
    })
    .eq('id', stepId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteStep(stepId) {
  await supabase.from('block_tutorial_step_expected').delete().eq('step_id', stepId)
  const { error } = await supabase.from('block_tutorial_steps').delete().eq('id', stepId)
  if (error) throw error
}

export async function upsertTutorialFile({ id, tutorialId, filename, fileType, initialContentJson }) {
  const payload = {
    tutorial_id: tutorialId,
    filename,
    file_type: fileType,
    initial_content_json: initialContentJson ?? null,
  }
  if (id) {
    const { data, error } = await supabase
      .from('block_tutorial_step_files')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  }
  const { data, error } = await supabase
    .from('block_tutorial_step_files')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteTutorialFile(fileId) {
  await supabase.from('block_tutorial_step_expected').delete().eq('file_id', fileId)
  const { error } = await supabase.from('block_tutorial_step_files').delete().eq('id', fileId)
  if (error) throw error
}

export async function upsertStepExpected({ id, stepId, fileId, expectedCode, expectedBlocksJson, testCases }) {
  const payload = {
    step_id: stepId,
    file_id: fileId,
    expected_code: expectedCode,
    expected_blocks_json: expectedBlocksJson ?? null,
    test_cases: testCases ?? [],
  }
  if (id) {
    const { data, error } = await supabase
      .from('block_tutorial_step_expected')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  }
  const { data, error } = await supabase
    .from('block_tutorial_step_expected')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteStepExpected(id) {
  const { error } = await supabase.from('block_tutorial_step_expected').delete().eq('id', id)
  if (error) throw error
}

export function inferFileType(filename) {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (ext === 'html') return 'html'
  if (ext === 'css') return 'css'
  if (ext === 'js') return 'js'
  return 'text'
}