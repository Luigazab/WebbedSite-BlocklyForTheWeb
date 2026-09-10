import { create } from 'zustand'

const emptyMeta = { title: '', topicId: '', baseXp: '50' }

export const tutorialBuilderStore = create((set) => ({
  lessonId: null,
  tutorialId: null,
  isPublished: false,

  meta: emptyMeta,
  files: [],
  steps: [],
  currentStepIndex: 0,

  loading: false,
  saving: false,
  dirty: false,

  setLessonId:   (id) => set({ lessonId: id }),
  setTutorialId: (id) => set({ tutorialId: id }),
  setPublished:  (v) => set({ isPublished: v }),
  setMeta:    (patch) => set((s) => ({ meta: { ...s.meta, ...patch }, dirty: true })),
  setLoading: (v) => set({ loading: v }),
  setSaving:  (v) => set({ saving: v }),
  markSaved:  () => set({ dirty: false }),

  hydrate: ({ lessonId, tutorialId, isPublished, meta, files, steps }) =>
    set({ lessonId, tutorialId, isPublished, meta, files, steps, currentStepIndex: 0, dirty: false }),

  setFiles: (files) => set({ files }),

  addFile: (file) => set((s) => ({ files: [...s.files, file], dirty: true })),

  removeFile: (filename) => set((s) => ({
    files: s.files.filter((f) => f.filename !== filename),
    steps: s.steps.map((step) => {
      const expectedByFile = { ...step.expectedByFile }
      const workingState = { ...step.workingState }
      delete expectedByFile[filename]
      delete workingState[filename]
      return { ...step, expectedByFile, workingState }
    }),
    dirty: true,
  })),

  setSteps: (steps) => set({ steps }),
  setCurrentStepIndex: (idx) => set({ currentStepIndex: idx }),

  addStep: (step) => set((s) => ({ steps: [...s.steps, step], dirty: true })),

  removeStepAt: (idx) => set((s) => {
    const steps = s.steps.filter((_, i) => i !== idx)
    const nextIdx = Math.max(0, Math.min(s.currentStepIndex, steps.length - 1))
    return { steps, currentStepIndex: nextIdx, dirty: true }
  }),

  updateStepFields: (idx, patch) => set((s) => ({
    steps: s.steps.map((step, i) => (i === idx ? { ...step, ...patch } : step)),
    dirty: true,
  })),

  setStepWorkingState: (idx, filename, blocksJson) => set((s) => ({
    steps: s.steps.map((step, i) =>
      i === idx
        ? { ...step, workingState: { ...step.workingState, [filename]: blocksJson } }
        : step
    ),
  })),

  setStepExpected: (idx, filename, expected) => set((s) => ({
    steps: s.steps.map((step, i) =>
      i === idx
        ? { ...step, expectedByFile: { ...step.expectedByFile, [filename]: expected } }
        : step
    ),
    dirty: true,
  })),

  clearStepExpected: (idx, filename) => set((s) => ({
    steps: s.steps.map((step, i) => {
      if (i !== idx) return step
      const expectedByFile = { ...step.expectedByFile }
      delete expectedByFile[filename]
      return { ...step, expectedByFile }
    }),
    dirty: true,
  })),

  patchStepIds: (dbSteps) => set((s) => ({
    steps: s.steps.map((step, i) => ({ ...step, id: dbSteps[i]?.id ?? step.id })),
  })),

  reset: () => set({
    lessonId: null, tutorialId: null, isPublished: false, meta: emptyMeta,
    files: [], steps: [], currentStepIndex: 0,
    loading: false, saving: false, dirty: false,
  }),
}))