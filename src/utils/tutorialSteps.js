export function buildStudentSteps(steps, files) {
  const states = new Map(files.map(file => [file.id, file.initial_content_json ?? null]))
  return [...steps].sort((a, b) => a.order - b.order).map(step => {
    const initialFiles = files.map(file => ({ ...file, blocks_json: states.get(file.id), code: '' }))
    const expected = step.block_tutorial_step_expected ?? []
    for (const solution of expected) if (solution.expected_blocks_json != null) states.set(solution.file_id, solution.expected_blocks_json)
    return { ...step, instruction_text: step.instruction, order_index: step.order, tutorial_step_files: initialFiles, expected }
  })
}

export function buildTextStudentSteps(steps, files) {
  return [...steps].sort((a, b) => a.order - b.order).map(step => ({
    ...step, instruction_text: step.instruction, order_index: step.order,
    expected: step.text_tutorial_step_expected ?? [],
    tutorial_step_files: files.filter(file => !file.step_id || file.step_id === step.id).map(file => ({ ...file, blocks_json: null, code: file.initial_content ?? '' })),
  }))
}

export function resolveStudentStepFiles(step, steps, submissions, drafts = new Map()) {
  const index = steps.findIndex(item => item.id === step.id)
  const own = drafts.get(step.id) ?? submissions.find(item => item.step_key === step.id)?.files
  if (own) return own.map(file => ({ ...file }))
  const inherited = new Map()
  for (let i = 0; i < index; i++) {
    const files = drafts.get(steps[i].id) ?? submissions.find(item => item.step_key === steps[i].id)?.files ?? []
    for (const file of files) inherited.set(file.filename, file)
  }
  return (step.tutorial_step_files ?? []).map(file => ({ ...file, ...(inherited.get(file.filename) ?? {}), id: file.id }))
}
