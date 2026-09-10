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

export function useTutorialBuilder({ lessonId, authorId, workspace }) {
  const store = tutorialBuilderStore()
  const isLoadingWsRef = useRef(false)

  // ── Load ────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!lessonId) {
      store.reset()
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
  }, [lessonId])

  useEffect(() => { load() }, [load])

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
      try { await deleteStepService(step.id) } catch (e) { console.error(e) }
    }
    store.removeStepAt(idx)
  }, [])

  // ── Files ──────────────────────────────────────────────────────────────
  const addFile = useCallback((filename) => {
    store.addFile({ id: null, filename, fileType: inferFileType(filename), initialContentJson: null })
  }, [])

  const removeFile = useCallback(async (filename) => {
    if (tutorialBuilderStore.getState().files.length <= 1) return
    const file = tutorialBuilderStore.getState().files.find((f) => f.filename === filename)
    if (file?.id) {
      try { await deleteTutorialFile(file.id) } catch (e) { console.error(e) }
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

  const clearCapture = useCallback((filename) => {
    const idx = tutorialBuilderStore.getState().currentStepIndex
    store.clearStepExpected(idx, filename)
  }, [])

  // ── Save / Publish ─────────────────────────────────────────────────────
  const saveAll = useCallback(async () => {
    const s = tutorialBuilderStore.getState()
    if (!s.meta.title.trim()) throw new Error('Tutorial title is required')
    if (!s.meta.topicId) throw new Error('Select a topic')

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
            ? updateStep(step.id, { instruction: step.instruction, hint: step.hint, order })
            : createStep({ tutorialId, instruction: step.instruction, hint: step.hint, order })
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
    saveAll, publish,
  }
}