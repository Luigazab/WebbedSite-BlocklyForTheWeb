export function buildStudentSteps(steps, files) {
  const states = new Map(files.map(file => [file.id, file.initial_content_json ?? null]))
  return [...steps].sort((a, b) => a.order - b.order).map(step => {
    const initialFiles = files.map(file => ({ ...file, blocks_json: states.get(file.id), code: '' }))
    const expected = step.block_tutorial_step_expected ?? []
    for (const solution of expected) states.set(solution.file_id, solution.expected_blocks_json ?? null)
    return { ...step, instruction_text: step.instruction, order_index: step.order, tutorial_step_files: initialFiles, expected }
  })
}
