import { validateTestCases, validateTutorialCode } from '../utils/validation/tutorialCodeValidation'
import { useCallback, useEffect, useRef } from 'react'
import * as Blockly from 'blockly/core'
import { tutorialBuilderStore } from '@/store/tutorialBuilderStore'
import { codeGeneratorService } from '@/services/codeGenerator.service'
import {
  fetchBlockTutorialByLessonId,
  createBlockTutorial,
  publishLesson,
  createStep,
  updateStep,
  deleteStep as deleteStepService,
  upsertTutorialFile,
  deleteTutorialFile,
  upsertStepExpected,
  inferFileType,
  deleteStepExpected,
} from '@/services/blockTutorialService'
import { createLessonBase, updateLessonBase } from '@/services/contentCreationService'

const makeLocalStep = (order = 0) => ({
  id: null,
  order,
  instruction: '',
  hint: '',
  highlightCategoryPath: null,
  highlightBlockType: null,
  expectedByFile: {},
  workingState: {},
})

export function useTutorialBuilder({ lessonId, authorId, workspace, initialTopicId = null }) {
  const store = tutorialBuilderStore()
  const isLoadingWsRef = useRef(false)

  // ── Load ────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!lessonId) {
      store.reset()
      if (initialTopicId) store.setMeta({ topicId: initialTopicId })
      store.setFiles([{ id: null, filename: 'index.html', fileType: 'html', initialContentJson: null }])
      store.addStep(makeLocalStep(0))
      return
    }
    store.setLoading(true)
    try {
      const { lesson, tutorial, steps, files, expected } = await fetchBlockTutorialByLessonId(lessonId)

      const localSteps = steps.map((s) => {
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
              testCases: e.test_cases ?? [],
            }
          })
        return {
          id: s.id, order: s.order, instruction: s.instruction ?? '', hint: s.hint ?? '',
          highlightCategoryPath: s.highlight_category_path ?? null,
          highlightBlockType: s.highlight_block_type ?? null,
          expectedByFile, workingState: {},
        }
      })

      store.hydrate({
        lessonId: lesson.id,
        tutorialId: tutorial?.id ?? null,
        isPublished: lesson.isPublished ?? false,
        meta: { title: lesson.title, topicId: lesson.topicsId, baseXp: String(lesson.baseXp ?? 50) },
        files: files.map((f) => ({
          id: f.id, filename: f.filename, fileType: f.file_type, initialContentJson: f.initial_content_json,
        })),
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

  const getFileStatusForStep = useCallback((filename, stepIndex) => {
    const { steps, files } = tutorialBuilderStore.getState()
    const step = steps[stepIndex]
    if (!step) return 'empty'
    if (step.expectedByFile[filename]) return 'captured'
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
    const order = tutorialBuilderStore.getState().steps.length
    store.addStep(makeLocalStep(order))
    store.setCurrentStepIndex(order)
  }, [])

  const deleteStepAt = useCallback(async (idx) => {
    const step = tutorialBuilderStore.getState().steps[idx]
    if (step?.id) {
      await deleteStepService(step.id)
    }
    store.removeStepAt(idx)
  }, [])

  // ── Files ──────────────────────────────────────────────────────────────
  const addFile = useCallback((filename) => {
    if (!/^[\w.-]+\.(html|css|js)$/.test(filename) || tutorialBuilderStore.getState().files.some(f => f.filename === filename)) throw new Error('Use a unique HTML, CSS or JS filename')
    store.addFile({ id: null, filename, fileType: inferFileType(filename), initialContentJson: null })
  }, [])

  const removeFile = useCallback(async (filename) => {
    if (tutorialBuilderStore.getState().files.length <= 1) return
    const file = tutorialBuilderStore.getState().files.find((f) => f.filename === filename)
    if (file?.id) {
      await deleteTutorialFile(file.id)
    }
    store.removeFile(filename)
  }, [])

  // ── Capture / clear expected for a given file at the current step ──────
  const captureActiveFile = useCallback((filename, testCases = []) => {
    const wsObj = workspace.getWorkspace()
    if (!wsObj) return
    const blocksJson = workspace.getWorkspaceState()
    const code = codeGeneratorService.generateCode(wsObj, filename)
    const { currentStepIndex, steps, files } = tutorialBuilderStore.getState()
    const existing = steps[currentStepIndex]?.expectedByFile[filename]
    store.setStepExpected(currentStepIndex, filename, {
      id: existing?.id ?? null,
      fileId: existing?.fileId ?? files.find((f) => f.filename === filename)?.id ?? null,
      blocksJson,
      code,
      testCases: testCases.length ? testCases : (existing?.testCases ?? []),
    })
    store.setStepWorkingState(currentStepIndex, filename, null)
  }, [workspace])

  const clearCapture = useCallback(async (filename) => {
    const idx = tutorialBuilderStore.getState().currentStepIndex
    const existing = tutorialBuilderStore.getState().steps[idx]?.expectedByFile[filename]
    if (existing?.id) await deleteStepExpected(existing.id)
    store.clearStepExpected(idx, filename)
  }, [])

  // ── Save / Publish ─────────────────────────────────────────────────────
  const saveAll = useCallback(async () => {
    const s = tutorialBuilderStore.getState()
    if (!s.meta.title.trim()) throw new Error('Tutorial title is required')
    if (!s.meta.topicId) throw new Error('Select a topic')

    if (!Number.isInteger(Number(s.meta.baseXp)) || Number(s.meta.baseXp) < 1) throw new Error('XP must be a positive integer')
    for (const step of s.steps) for (const exp of Object.values(step.expectedByFile)) validateTestCases(exp.testCases ?? [])
    if (s.steps.some(step => Object.values(step.workingState).some(Boolean))) throw new Error('Capture your edited solutions before saving')
    store.setSaving(true)
    try {
      const lesson = s.lessonId
        ? await updateLessonBase({
            lessonId: s.lessonId, topicId: s.meta.topicId,
            title: s.meta.title, baseXp: Number(s.meta.baseXp),
          })
        : await createLessonBase({
            topicId: s.meta.topicId, authorId, title: s.meta.title,
            type: 'tutorial', baseXp: Number(s.meta.baseXp),
          })
      store.setLessonId(lesson.id)

      let tutorialId = s.tutorialId
      if (!tutorialId) {
        const tut = await createBlockTutorial({ lessonId: lesson.id })
        tutorialId = tut.id
        store.setTutorialId(tutorialId)
      }

      const savedFiles = await Promise.all(
        s.files.map((f) =>
          upsertTutorialFile({
            id: f.id, tutorialId, filename: f.filename,
            fileType: f.fileType, initialContentJson: f.initialContentJson,
          })
        )
      )
      const filesWithIds = s.files.map((f, i) => ({ ...f, id: savedFiles[i].id }))
      store.setFiles(filesWithIds)

      const savedSteps = await Promise.all(
        s.steps.map((step, order) =>
          step.id
            ? updateStep(step.id, {
                instruction: step.instruction, hint: step.hint, order,
                highlightCategoryPath: step.highlightCategoryPath,
                highlightBlockType: step.highlightBlockType,
              })
            : createStep({
                tutorialId, instruction: step.instruction, hint: step.hint, order,
                highlightCategoryPath: step.highlightCategoryPath,
                highlightBlockType: step.highlightBlockType,
              })
        )
      )
      store.patchStepIds(savedSteps)

      await Promise.all(
        s.steps.flatMap((step, i) =>
          Object.entries(step.expectedByFile).map(async ([filename, exp]) => {
            const fileId = filesWithIds.find((f) => f.filename === filename)?.id
            if (!fileId) return
            const saved = await upsertStepExpected({
              id: exp.id, stepId: savedSteps[i].id, fileId,
              expectedCode: exp.code, expectedBlocksJson: exp.blocksJson, testCases: exp.testCases,
            })
            store.setStepExpected(i, filename, { ...exp, id: saved.id, fileId })
          })
        )
      )

      store.markSaved()
      return lesson.id
    } finally {
      store.setSaving(false)
    }
  }, [authorId])

  const publish = useCallback(async () => {
    const s = tutorialBuilderStore.getState()
    if (!s.steps.length) throw new Error('Add at least one step')
    for (const [i, step] of s.steps.entries()) {
      if (!step.instruction.trim() || !Object.keys(step.expectedByFile).length) throw new Error('Step ' + (i + 1) + ' needs instructions and a captured solution')
      for (const exp of Object.values(step.expectedByFile)) {
        const result = validateTutorialCode(exp.code, exp.code, exp.testCases ?? [])
        if (!result.passed) throw new Error('Step ' + (i + 1) + ' solution fails its tests: ' + result.failures.join(', '))
      }
    }
    const lessonId = await saveAll()
    await publishLesson(lessonId)
    store.setPublished(true)
    return lessonId
  }, [saveAll])

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
    getFilesWithCodeForStep, getFileStatusForStep,
    captureActiveFile, clearCapture,
    captureInitial: (filename) => {
      const s = tutorialBuilderStore.getState()
      if (s.currentStepIndex !== 0) return
      store.setFiles(s.files.map(f => f.filename === filename ? { ...f, initialContentJson: workspace.getWorkspaceState() } : f))
      store.setStepWorkingState(0, filename, null)
    },
    loadInitial: (filename) => {
      const s = tutorialBuilderStore.getState()
      let state = s.files.find(f => f.filename === filename)?.initialContentJson ?? null
      for (let i = 0; i < s.currentStepIndex; i++) {
        if (s.steps[i].expectedByFile[filename]) state = s.steps[i].expectedByFile[filename].blocksJson
      }
      isLoadingWsRef.current = true
      if (state) workspace.loadWorkspaceState(state); else workspace.clearWorkspace()
      setTimeout(() => { isLoadingWsRef.current = false }, 150)
    },
    setTests: (filename, tests) => {
      validateTestCases(tests)
      const s = tutorialBuilderStore.getState()
      const expected = s.steps[s.currentStepIndex]?.expectedByFile[filename]
      if (!expected) throw new Error('Capture a solution first')
      store.setStepExpected(s.currentStepIndex, filename, { ...expected, testCases: tests })
    },
    saveAll, publish,
  }
}