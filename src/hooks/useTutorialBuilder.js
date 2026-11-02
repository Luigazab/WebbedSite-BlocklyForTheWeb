import { validateTestCases } from '../utils/validation/tutorialCodeValidation'
import { capturedTests, countChecks } from '../utils/validation/generatedCodeChecks'
import { validateTutorialReference } from '../utils/validation/tutorialStepValidation'
import { saveTutorialDefinition } from '../services/tutorialSubmissionService'
import { useCallback, useEffect, useRef } from 'react'
import * as Blockly from 'blockly/core'
import { tutorialBuilderStore } from '@/store/tutorialBuilderStore'
import { codeGeneratorService } from '@/services/codeGenerator.service'
import { fetchBlockTutorialByLessonId, inferFileType } from '@/services/blockTutorialService'

const makeLocalStep = (order = 0) => ({
  id: null,
  order,
  instruction: '',
  hint: '',
  highlightCategoryPath: null,
  highlightBlockType: null,
  expectedByFile: {},
  initialByFile: {},
  workingState: {},
})

export function useTutorialBuilder({ lessonId, workspace, initialTopicId = null }) {
  const store = tutorialBuilderStore()
  const isLoadingWsRef = useRef(false)

  // ── Load ────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!lessonId) {
      store.reset()
      if (initialTopicId) store.setMeta({ topicId: initialTopicId })
      store.setFiles([{ id: null, filename: 'index.html', fileType: 'html', initialContentJson: null }])
      store.addStep({ ...makeLocalStep(0), initialByFile: { 'index.html': {} } })
      return
    }
    store.setLoading(true)
    try {
      const { lesson, tutorial, steps, files, expected } = await fetchBlockTutorialByLessonId(lessonId)
      if (tutorial && tutorial.type !== 'block') throw new Error('This editor creates block tutorials')

      const inheritedStarts = Object.fromEntries(files.map(file => [file.filename, file.initial_content_json ?? {}]))
      const localSteps = steps.map((s) => {
        const initialByFile = { ...inheritedStarts, ...s.initial_files }
        const expectedByFile = {}
        expected
          .filter((e) => e.step_id === s.id)
          .forEach((e) => {
            const file = files.find((f) => f.id === e.file_id)
            if (!file) return
            expectedByFile[file.filename] = {
              id: e.id,
              fileId: e.file_id,
              blocksJson: e.expected_blocks_json,
              code: e.expected_code,
              testCases: e.test_cases ?? [], requireStructure: e.require_block_structure === true,
            }
            if (e.expected_blocks_json != null) inheritedStarts[file.filename] = e.expected_blocks_json
          })
        return {
          id: s.id, order: s.order, instruction: s.instruction ?? '', hint: s.hint ?? '',
          highlightCategoryPath: s.highlight_category_path ?? null,
          highlightBlockType: s.highlight_block_type ?? null,
          expectedByFile, initialByFile, workingState: {},
        }
      })

      store.hydrate({
        lessonId: lesson.id,
        tutorialId: tutorial?.id ?? null, revision: lesson.revision,
        isPublished: lesson.isPublished ?? false,
        meta: { title: lesson.title, topicId: lesson.topicsId, baseXp: String(lesson.baseXp ?? 50) },
        files: files.length ? files.map((f) => ({
          id: f.id, filename: f.filename, fileType: f.file_type, initialContentJson: f.initial_content_json,
        })) : [{ id: null, filename: 'index.html', fileType: 'html', initialContentJson: null }],
        steps: localSteps.length ? localSteps : [makeLocalStep(0)],
      })
    } finally {
      store.setLoading(false)
    }
  }, [lessonId, initialTopicId])

  useEffect(() => { load().catch(error => { console.error(error); window.alert('Could not load tutorial: ' + error.message) }) }, [load])

  // ── Derived getters — always read fresh via getState() ───────────────────
  const resolveStateForFile = useCallback((filename, stepIndex) => {
    const { steps, files } = tutorialBuilderStore.getState()
    const step = steps[stepIndex]
    if (!step) return null

    if (step.workingState[filename]) return step.workingState[filename]
    if (step.expectedByFile[filename]?.blocksJson) return step.expectedByFile[filename].blocksJson
    if (Object.hasOwn(step.initialByFile ?? {}, filename)) return step.initialByFile[filename]

    for (let i = stepIndex - 1; i >= 0; i--) {
      const prior = steps[i]?.expectedByFile[filename]
      if (prior?.blocksJson) return prior.blocksJson
    }

    return files.find((f) => f.filename === filename)?.initialContentJson ?? null
  }, [])

  const generateCodeForState = useCallback((blocksJson, filename) => {
    if (!blocksJson) return ''
    const temp = new Blockly.Workspace()
    try {
      Blockly.serialization.workspaces.load(blocksJson, temp)
      return codeGeneratorService.generateCode(temp, filename)
    } catch (e) {
      console.error('codegen failed', e)
      return ''
    } finally {
      temp.dispose()
    }
  }, [])

  const getFilesWithCodeForStep = useCallback((stepIndex) => {
    const { files } = tutorialBuilderStore.getState()
    return files.map((f) => {
      const state = resolveStateForFile(f.filename, stepIndex)
      return { filename: f.filename, generatedCode: generateCodeForState(state, f.filename) }
    })
  }, [resolveStateForFile, generateCodeForState])

  const getExpectedFilesWithCodeForStep = useCallback((stepIndex) => {
    const { files, steps } = tutorialBuilderStore.getState()
    const step = steps[stepIndex]
    return files.map(file => ({ filename: file.filename, generatedCode: step?.expectedByFile[file.filename]?.code
      ?? generateCodeForState(step?.initialByFile?.[file.filename] ?? file.initialContentJson, file.filename) }))
  }, [generateCodeForState])

  const getFileStatusForStep = useCallback((filename, stepIndex) => {
    const { steps, files } = tutorialBuilderStore.getState()
    const step = steps[stepIndex]
    if (!step) return 'empty'
    if (step.expectedByFile[filename]) return 'captured'
    if (Object.hasOwn(step.initialByFile ?? {}, filename)) return 'initial'
    for (let i = stepIndex - 1; i >= 0; i--) {
      if (steps[i]?.expectedByFile[filename]) return 'inherited'
    }
    if (files.find((f) => f.filename === filename)?.initialContentJson) return 'initial'
    return 'empty'
  }, [])

  // ── Workspace sync ─────────────────────────────────────────────────────
  const loadFileIntoWorkspace = useCallback((filename, stepIndex) => {
    const idx = stepIndex ?? tutorialBuilderStore.getState().currentStepIndex
    isLoadingWsRef.current = true
    const state = resolveStateForFile(filename, idx)
    if (state) workspace.loadWorkspaceState(state)
    else workspace.clearWorkspace()
    setTimeout(() => { isLoadingWsRef.current = false }, 150)
  }, [resolveStateForFile, workspace])

  const recordWorkingEdit = useCallback((filename) => {
    if (isLoadingWsRef.current || !filename) return
    const blocksJson = workspace.getWorkspaceState()
    store.setStepWorkingState(store.currentStepIndex, filename, blocksJson)
  }, [store.currentStepIndex, workspace])

  // ── Navigation (append-only steps, no reordering) ─────────────────────
  const goToStep = useCallback((idx) => {
    store.setCurrentStepIndex(idx)
  }, [])

  const addStep = useCallback(() => {
    const { steps, files } = tutorialBuilderStore.getState()
    const order = steps.length
    store.addStep({ ...makeLocalStep(order), initialByFile: Object.fromEntries(files.map(file => [file.filename, resolveStateForFile(file.filename, order - 1) ?? {}])) })
    store.setCurrentStepIndex(order)
  }, [resolveStateForFile])

  const deleteStepAt = useCallback(async (idx) => {
    store.removeStepAt(idx)
  }, [])

  // ── Files ──────────────────────────────────────────────────────────────
  const addFile = useCallback((filename) => {
    if (!/^[\w.-]+\.(html|css|js)$/.test(filename) || tutorialBuilderStore.getState().files.some(f => f.filename === filename)) throw new Error('Use a unique HTML, CSS or JS filename')
    store.addFile({ id: null, filename, fileType: inferFileType(filename), initialContentJson: null })
    tutorialBuilderStore.getState().steps.forEach((step, index) => store.updateStepFields(index, { initialByFile: { ...step.initialByFile, [filename]: {} } }))
  }, [])

  const removeFile = useCallback(async (filename) => {
    if (tutorialBuilderStore.getState().files.length <= 1) return
    store.removeFile(filename)
  }, [])

  // ── Capture / clear expected for a given file at the current step ──────
  const captureActiveFile = useCallback((filename, testCases = []) => {
    const wsObj = workspace.getWorkspace()
    if (!wsObj) return
    const blocksJson = workspace.getWorkspaceState()
    const code = codeGeneratorService.generateCode(wsObj, filename)
    const { currentStepIndex, steps, files } = tutorialBuilderStore.getState()
    const step = steps[currentStepIndex]
    if (!Object.hasOwn(step.initialByFile ?? {}, filename)) throw new Error('Capture the starting structure first.')
    if (step.testDraftByFile?.[filename] != null) throw new Error('Apply your manual tests before recapturing.')
    const existing = steps[currentStepIndex]?.expectedByFile[filename]
    const tests = capturedTests(generateCodeForState(step.initialByFile[filename], filename), code, filename, testCases.length ? testCases : existing?.testCases ?? [])
    validateTestCases(tests)
    store.setStepExpected(currentStepIndex, filename, {
      id: existing?.id ?? null,
      fileId: existing?.fileId ?? files.find((f) => f.filename === filename)?.id ?? null,
      blocksJson,
      code,
      requireStructure: false,
      testCases: tests,
    })
    store.setStepWorkingState(currentStepIndex, filename, null)
  }, [workspace, generateCodeForState])

  const clearCapture = useCallback(async (filename) => {
    const idx = tutorialBuilderStore.getState().currentStepIndex
    store.clearStepExpected(idx, filename)
  }, [])

  // ── Save / Publish ─────────────────────────────────────────────────────
  const saveAll = useCallback(async (publish = false) => {
    const s = tutorialBuilderStore.getState()
    if (!s.meta.title.trim()) throw new Error('Tutorial title is required')
    if (!s.meta.topicId) throw new Error('Select a topic')
    if (!Number.isInteger(Number(s.meta.baseXp)) || Number(s.meta.baseXp) < 1) throw new Error('XP must be a positive integer')
    if (s.steps.some(step => Object.values(step.workingState).some(Boolean))) throw new Error('Capture your edited solutions before saving')
    const steps = s.steps.map((step, i) => {
      const expectedByFile = {}
      for (const [filename, exp] of Object.entries(step.expectedByFile)) {
        let tests = exp.testCases ?? []
        if (step.testDraftByFile?.[filename] != null) {
          try { tests = JSON.parse(step.testDraftByFile[filename]) }
          catch { throw new Error('Step ' + (i + 1) + ', ' + filename + ': invalid test JSON') }
        }
        validateTestCases(tests)
        expectedByFile[filename] = { ...exp, testCases: tests }
        if (publish) validateTutorialReference({ filename, expected_code: exp.code, expected_blocks_json: exp.blocksJson, test_cases: tests, require_block_structure: exp.requireStructure === true })
      }
      if (publish && (!step.instruction.trim() || !Object.keys(expectedByFile).length)) throw new Error('Step ' + (i + 1) + ' needs instructions and a captured solution')
      if (publish && Object.values(expectedByFile).some(exp => exp.testCases?.some(test => test.type === 'generatedChanges')) && !Object.values(expectedByFile).some(exp => countChecks(exp.testCases) > 0)) throw new Error('Step ' + (i + 1) + ' needs at least one active code check.')
      return { ...step, expectedByFile, workingState: {}, testDraftByFile: {} }
    })
    if (!steps.length) throw new Error('Add at least one step')
    store.setSaving(true)
    try {
      const saved = await saveTutorialDefinition({ lessonId: s.lessonId, tutorialId: s.tutorialId, revision: s.revision, mode: 'block', meta: s.meta, files: s.files, steps }, publish)
      // IDs/revision only change after the entire transaction succeeds.
      store.hydrate({ ...saved, meta: s.meta, isPublished: publish })
      store.setCurrentStepIndex(Math.min(s.currentStepIndex, saved.steps.length - 1))
      return saved.lessonId
    } finally { store.setSaving(false) }
  }, [])

  const publish = useCallback(() => saveAll(true), [saveAll])

  return {
    loading: store.loading, saving: store.saving, dirty: store.dirty,
    isPublished: store.isPublished,
    meta: store.meta, files: store.files, steps: store.steps,
    currentStepIndex: store.currentStepIndex,
    currentStep: store.steps[store.currentStepIndex] ?? null,
    isLoadingWsRef,

    setMeta: store.setMeta,
    addFile, removeFile,
    updateCurrentStep: (patch) => store.updateStepFields(store.currentStepIndex, patch),
    goToStep, addStep, deleteStepAt,
    resolveStateForFile, loadFileIntoWorkspace, recordWorkingEdit,
    getFilesWithCodeForStep, getExpectedFilesWithCodeForStep, getFileStatusForStep,
    captureActiveFile, clearCapture,
    captureInitial: (filename) => {
      const s = tutorialBuilderStore.getState()
      const step = s.steps[s.currentStepIndex]
      if (step.testDraftByFile?.[filename] != null) throw new Error('Apply your manual tests before recapturing.')
      const state = workspace.getWorkspaceState() ?? {}
      const expected = step.expectedByFile[filename]
      const tests = expected ? capturedTests(generateCodeForState(state, filename), expected.code, filename, expected.testCases) : null
      if (tests) validateTestCases(tests)
      store.updateStepFields(s.currentStepIndex, { initialByFile: { ...step.initialByFile, [filename]: state } })
      if (expected) store.setStepExpected(s.currentStepIndex, filename, { ...expected, testCases: tests, requireStructure: false })
      store.setStepWorkingState(s.currentStepIndex, filename, null)
    },
    loadInitial: (filename) => {
      const s = tutorialBuilderStore.getState()
      let state = s.files.find(f => f.filename === filename)?.initialContentJson ?? null
      for (let i = 0; i < s.currentStepIndex; i++) {
        if (s.steps[i].expectedByFile[filename]) state = s.steps[i].expectedByFile[filename].blocksJson
      }
      if (Object.hasOwn(s.steps[s.currentStepIndex].initialByFile ?? {}, filename)) state = s.steps[s.currentStepIndex].initialByFile[filename]
      isLoadingWsRef.current = true
      if (state) workspace.loadWorkspaceState(state); else workspace.clearWorkspace()
      setTimeout(() => { isLoadingWsRef.current = false }, 150)
    },
    loadExpected: (filename) => {
      const s = tutorialBuilderStore.getState()
      const expected = s.steps[s.currentStepIndex]?.expectedByFile[filename]
      if (!expected) return
      isLoadingWsRef.current = true
      workspace.loadWorkspaceState(expected.blocksJson ?? {})
      store.setStepWorkingState(s.currentStepIndex, filename, null)
      setTimeout(() => { isLoadingWsRef.current = false }, 150)
    },
    setTests: (filename, tests) => {
      validateTestCases(tests)
      const s = tutorialBuilderStore.getState()
      const expected = s.steps[s.currentStepIndex]?.expectedByFile[filename]
      if (!expected) throw new Error('Capture a solution first')
      store.setStepExpected(s.currentStepIndex, filename, { ...expected, testCases: tests })
      const drafts = { ...s.steps[s.currentStepIndex].testDraftByFile }
      delete drafts[filename]
      store.updateStepFields(s.currentStepIndex, { testDraftByFile: drafts })
    },
    setTestsDraft: (filename, text) => store.setTestsDraft(tutorialBuilderStore.getState().currentStepIndex, filename, text),
    setStructureRequirement: (filename, required) => {
      const s = tutorialBuilderStore.getState()
      const expected = s.steps[s.currentStepIndex]?.expectedByFile[filename]
      if (expected) store.setStepExpected(s.currentStepIndex, filename, { ...expected, requireStructure: required })
    },
    saveAll, publish,
  }
}
