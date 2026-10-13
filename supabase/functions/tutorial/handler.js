const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }
const reply = (status, body) => Response.json(body, { status, headers: cors })

export function createTutorialHandler({ authenticate, loadDefinition, saveSubmission, saveDefinition, canonicalize, validateStep, validateReference, validateTests }) {
  return async request => {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
    if (request.method !== 'POST') return reply(405, { error: 'Method not allowed' })
    const token = request.headers.get('Authorization')?.match(/^Bearer (\S+)$/i)?.[1]
    if (!token) return reply(401, { error: 'Sign in to continue.' })
    try {
      const user = await authenticate(token)
      if (!user?.id) return reply(401, { error: 'Sign in to continue.' })
      const raw = await request.text()
      if (new TextEncoder().encode(raw).length > 2097152) return reply(413, { error: 'Tutorial requests are limited to 2 MB.' })
      const body = JSON.parse(raw)
      if (body.action === 'submit' || body.action === 'check') {
        if (body.action === 'submit' && typeof body.finish !== 'boolean') throw new Error('Finish must be a boolean')
        const definition = await loadDefinition(user.id, body.lessonId, body.stepId, body.action === 'check')
        const expected = definition.expected.map(solution => definition.mode !== 'block' || solution.expected_blocks_json == null ? solution : {
          ...solution, expected_code: canonicalize([{ filename: solution.filename, blocks_json: solution.expected_blocks_json }], definition.mode, definition.files)[0].code,
        })
        for (const solution of expected) validateReference(solution, definition.mode)
        const files = canonicalize(body.files, definition.mode, definition.files)
        const result = validateStep({ files, expected, mode: definition.mode, fileDefinitions: definition.files })
        if (!result.passed) return reply(422, { error: result.failures.join(' • '), failures: result.failures })
        if (body.action === 'check') return reply(200, { passed: true })
        const submission = await saveSubmission(user.id, { ...body, files, revision: definition.revision })
        return reply(200, { submission })
      }
      if (body.action === 'save') {
        if (typeof body.publish !== 'boolean') throw new Error('Publish must be a boolean')
        const definition = body.definition
        if (!definition || !Array.isArray(definition.files) || !definition.files.length || definition.files.length > 32 || !Array.isArray(definition.steps) || !definition.steps.length || definition.steps.length > 100) throw new Error('Add files and between 1 and 100 steps')
        const filenames = definition.files.map(file => file.filename)
        if (filenames.some(name => typeof name !== 'string' || !/^[\w.-]+\.(html|css|js)$/.test(name)) || new Set(filenames).size !== filenames.length) throw new Error('Use unique HTML, CSS or JS filenames')
        const mode = definition.mode ?? 'block'
        if (mode !== 'block') throw new Error('The current builder creates block tutorials')
        for (const file of definition.files) if (file.initialContentJson != null) canonicalize([{ filename: file.filename, blocks_json: file.initialContentJson }], mode, definition.files)
        const steps = definition.steps.map((step, index) => {
          const expectedByFile = {}
          for (const [filename, expected] of Object.entries(step.expectedByFile ?? {})) {
            if (!filenames.includes(filename)) throw new Error('A solution references an unknown file')
            const source = expected.blocksJson
              ? canonicalize([{ filename, blocks_json: expected.blocksJson }], mode, definition.files)[0].code
              : expected.code
            const solution = { filename, expected_code: source, expected_blocks_json: expected.blocksJson, test_cases: expected.testCases ?? [], require_block_structure: expected.requireStructure === true }
            // Drafts may be incomplete, but invalid test configuration is never saved.
            validateTests(solution.test_cases)
            if (body.publish) validateReference(solution, mode)
            expectedByFile[filename] = { ...expected, code: source, requireStructure: solution.require_block_structure }
          }
          if (body.publish && (!step.instruction?.trim() || !Object.keys(expectedByFile).length)) throw new Error(`Step ${index + 1} needs instructions and a captured solution`)
          return { ...step, expectedByFile }
        })
        const saved = await saveDefinition(user.id, { ...definition, steps }, body.publish)
        return reply(200, { saved })
      }
      return reply(400, { error: 'Unsupported tutorial action' })
    } catch (error) {
      return reply(error?.status ?? 400, { error: error instanceof Error ? error.message : 'Could not process the tutorial.' })
    }
  }
}
