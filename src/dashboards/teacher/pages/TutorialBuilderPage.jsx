import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router'
import {
  createTutorial,
  updateTutorial,
  fetchTutorialById,
  createTutorialStep,
  updateTutorialStep,
  deleteTutorialStep,
  reorderTutorialSteps,
  saveStepFiles,
} from '../../../services/tutorial.service'
import { useAuth } from '../../../hooks/useAuth'
import BlocklyWorkspace from '../../../components/editor/BlocklyWorkspace'
import PreviewPane from '../../../components/editor/PreviewPane'
import FileTabs from '../../../components/editor/FileTabs'
import { codeGeneratorService } from '../../../services/codeGenerator.service'
import { defineFileReferenceBlocks } from '../../../blockly/fileReferenceBlocks'
import { useUIStore } from '../../../store/uiStore'
import BadgeModal from '../components/BadgeModal'
import {
  ArrowLeft, Award, BookOpen, Check,
  ChevronDown, ChevronRight, CircleDot,
  GripVertical, Lightbulb, ListOrdered,
  PlusCircle, Save, Trash2, Zap,
} from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 10)

/** A single file object for a tutorial step */
const makeFile = (filename = 'index.html') => ({
  _key: uid(),   // stable local React key + used as FileTabs "id"
  id:   null,    // tutorial_step_files.id (null = not yet persisted)
  filename,
  blocks_json: null,
})

/**
 * A blank step — optionally inherits the previous step's files so teachers
 * build incrementally (html template already in place, add css next).
 */
const makeBlankStep = (inheritedFiles = null) => {
  const files = inheritedFiles
    ? inheritedFiles.map((f) => ({ ...f, _key: uid(), id: null })) // copy, reset id
    : [makeFile()]
  return {
    id:            null,
    instruction:   '',
    hint:          '',
    requireBlocks: false,
    capturedBlocks: null,
    files,
    activeFileKey: files[0]._key,
  }
}

const DIFFICULTY_OPTIONS = ['beginner', 'intermediate', 'advanced']

// ─── Step Panel ───────────────────────────────────────────────────────────────
function StepPanel({
  tutorialTitle, setTutorialTitle,
  tutorialDescription, setTutorialDescription,
  difficulty, setDifficulty,
  estimatedTime, setEstimatedTime,
  isPublished,
  steps,
  currentStepIndex,
  onGoToStep,
  onAddStep,
  onDeleteStep,
  onDragReorder,
  instruction, setInstruction,
  hint, setHint,
  requireBlocks, setRequireBlocks,
  capturedBlocks,
  onCaptureBlocks,
  onClearBlocks,
  onSaveTutorial,
  onOpenBadge,
  onPublish,
  saving,
  saveMsg,
  hasBadge,
}) {
  const [metaOpen, setMetaOpen] = useState(true)
  const dragFromRef = useRef(null)

  const handleDragStart = (e, idx) => { dragFromRef.current = idx; e.dataTransfer.effectAllowed = 'move' }
  const handleDragOver  = (e)      => e.preventDefault()
  const handleDrop      = (e, idx) => {
    e.preventDefault()
    const from = dragFromRef.current
    if (from != null && from !== idx) onDragReorder(from, idx)
    dragFromRef.current = null
  }

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 overflow-hidden">

      {/* Header */}
      <div className="shrink-0 bg-blockly-blue px-4 py-4">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen size={16} className="text-white/80" />
          <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Tutorial Builder</span>
        </div>
        <p className="text-white font-black text-sm leading-tight truncate">
          {tutorialTitle || 'Untitled Tutorial'}
        </p>
        {saveMsg && (
          <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-emerald-200">
            <Check size={10} /> {saveMsg}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">

        {/* ── Tutorial Meta ──────────────────────────────────────────── */}
        <div className="border-b border-slate-100">
          <button
            onClick={() => setMetaOpen((o) => !o)}
            className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <span className="flex items-center gap-1.5"><ListOrdered size={13} /> Tutorial Info</span>
            {metaOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>

          {metaOpen && (
            <div className="px-4 pb-4 space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Title *</label>
                <input
                  type="text"
                  value={tutorialTitle}
                  onChange={(e) => setTutorialTitle(e.target.value)}
                  placeholder="e.g. Build a webpage from scratch"
                  className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blockly-blue bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Description</label>
                <textarea
                  value={tutorialDescription}
                  onChange={(e) => setTutorialDescription(e.target.value)}
                  placeholder="What will students learn?"
                  rows={2}
                  className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blockly-blue bg-white resize-none"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blockly-blue bg-white"
                  >
                    {DIFFICULTY_OPTIONS.map((d) => (
                      <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="w-24">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Min</label>
                  <input
                    type="number" min={1}
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(e.target.value)}
                    placeholder="30"
                    className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blockly-blue bg-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Steps List ─────────────────────────────────────────────── */}
        <div className="border-b border-slate-100">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <CircleDot size={13} /> Steps ({steps.length})
            </span>
            <button
              onClick={onAddStep}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <PlusCircle size={14} /> Add Step
            </button>
          </div>

          <div className="px-3 pb-3 space-y-1">
            {steps.map((step, idx) => (
              <div
                key={step.id ?? `new-${idx}`}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, idx)}
                className={`group flex items-start gap-1.5 rounded-xl transition-all ${
                  idx === currentStepIndex ? 'bg-indigo-600 shadow-sm' : 'hover:bg-slate-100'
                }`}
              >
                <div className={`shrink-0 pt-2.5 pl-1.5 cursor-grab active:cursor-grabbing ${
                  idx === currentStepIndex ? 'text-white/40' : 'text-slate-300 group-hover:text-slate-400'
                }`}>
                  <GripVertical size={14} />
                </div>
                <button
                  onClick={() => onGoToStep(idx)}
                  className="flex-1 text-left px-2 py-2.5 text-xs font-semibold flex items-start gap-2"
                >
                  <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black mt-0.5 ${
                    idx === currentStepIndex ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className={`line-clamp-2 leading-snug ${
                    idx === currentStepIndex ? 'text-white' : 'text-slate-600'
                  }`}>
                    {step.instruction?.trim() || `Step ${idx + 1}`}
                  </span>
                </button>
                {/* File count badge */}
                {step.files?.length > 1 && (
                  <span className={`shrink-0 self-center mr-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    idx === currentStepIndex ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {step.files.length}f
                  </span>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteStep(idx) }}
                  title="Delete step"
                  className={`shrink-0 pt-2.5 pr-2 opacity-0 group-hover:opacity-100 transition-opacity ${
                    idx === currentStepIndex ? 'text-white/60 hover:text-white' : 'text-red-400 hover:text-red-600'
                  }`}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
            {steps.length === 0 && (
              <p className="text-center text-xs text-slate-400 py-3">Click "Add Step" to begin.</p>
            )}
          </div>
        </div>

        {/* ── Current Step Editor ────────────────────────────────────── */}
        <div className="px-4 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wide">
              Step {currentStepIndex + 1} — Content
            </h3>
            {/* Show how many files this step has */}
            {steps[currentStepIndex]?.files?.length > 0 && (
              <span className="text-[10px] text-slate-400 font-semibold">
                {steps[currentStepIndex].files.length} file{steps[currentStepIndex].files.length !== 1 ? 's' : ''} in this step
              </span>
            )}
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Instruction *</label>
            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="Tell students what to do in this step…"
              rows={5}
              className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blockly-blue bg-white resize-none leading-relaxed"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
              <Lightbulb size={11} /> Hint (optional)
            </label>
            <input
              type="text"
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              placeholder="Give a helpful nudge…"
              className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blockly-blue bg-white"
            />
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={requireBlocks}
                onChange={(e) => setRequireBlocks(e.target.checked)}
                className="rounded border-slate-300 accent-indigo-600 w-4 h-4"
              />
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Zap size={13} className="text-amber-500" />
                Require expected blocks
              </span>
            </label>
            {requireBlocks && (
              <div className="space-y-2 pt-1">
                <p className="text-[11px] text-slate-500">
                  Build the solution in the active file, then capture it as the expected answer.
                </p>
                {capturedBlocks ? (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                    <Check size={13} className="text-emerald-600 shrink-0" />
                    <span className="text-xs text-emerald-700 font-semibold flex-1">Workspace captured</span>
                    <button onClick={onClearBlocks} className="text-[11px] text-red-400 hover:text-red-600 font-semibold">Clear</button>
                  </div>
                ) : (
                  <button
                    onClick={onCaptureBlocks}
                    className="w-full py-2 text-xs font-bold border-2 border-dashed border-indigo-300 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    📸 Capture active file's workspace
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <div className="shrink-0  flex  gap-4 border-t border-slate-200 p-3 bg-slate-50">
        <button
          onClick={onOpenBadge}
          className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold border border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors"
        >
          <Award size={13} />
          {hasBadge ? 'Edit Badge' : 'Attach Badge'}
        </button>
        <button
          onClick={onSaveTutorial}
          disabled={saving}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold btn btn-primary disabled:opacity-50 rounded-xl"
        >
          <Save size={13} />
          {saving ? 'Saving…' : 'Save Tutorial'}
        </button>
        <button
          onClick={onPublish}
          disabled={saving || isPublished}
          className="w-2/5 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold btn btn-secondary disabled:opacity-50 rounded-xl"
        >
          <Check size={13} />
          {isPublished ? 'Published' : 'Publish'}
        </button>
      </div>
    </div>
  )
}

// ─── Main Builder ─────────────────────────────────────────────────────────────
export default function TutorialBuilderPage() {
  const { user }    = useAuth()
  const navigate    = useNavigate()
  const { id }      = useParams()
  const isEdit      = Boolean(id)
  const addToast    = useUIStore((s) => s.addToast)

  // ── Tutorial meta ──────────────────────────────────────────────────────────
  const [savedId, setSavedId]                         = useState(id || null)
  const [tutorialTitle, setTutorialTitle]             = useState('')
  const [tutorialDescription, setTutorialDescription] = useState('')
  const [difficulty, setDifficulty]                   = useState('beginner')
  const [estimatedTime, setEstimatedTime]             = useState('')
  const [isPublished, setIsPublished]                 = useState(false)
  const [loading, setLoading]                         = useState(isEdit)
  const [saving, setSaving]                           = useState(false)
  const [saveMsg, setSaveMsg]                         = useState('')
  const [badge, setBadge]                             = useState(null)
  const [showBadgeModal, setShowBadgeModal]           = useState(false)

  // ── Steps ──────────────────────────────────────────────────────────────────
  // Each step: { id, instruction, hint, requireBlocks, capturedBlocks,
  //              files: [{ _key, id, filename, blocks_json }],
  //              activeFileKey: string }
  const [steps, setSteps]                   = useState([makeBlankStep()])
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  // Live edit fields for the currently selected step
  const [instruction, setInstruction]       = useState('')
  const [hint, setHint]                     = useState('')
  const [requireBlocks, setRequireBlocks]   = useState(false)
  const [capturedBlocks, setCapturedBlocks] = useState(null)

  // ── Refs to latest values (avoid stale closures in callbacks) ─────────────
  const stepsRef         = useRef(steps)
  const currentIdxRef    = useRef(currentStepIndex)
  const instructionRef   = useRef(instruction)
  const hintRef          = useRef(hint)
  const requireBlocksRef = useRef(requireBlocks)
  const capturedRef      = useRef(capturedBlocks)
  const isLoadingWsRef         = useRef(false)
  // Holds blocks_json queued during fetch; useState so the drain effect below
  // re-fires whether isInitialized or pendingFirstStep changes last.
  const [pendingFirstStep, setPendingFirstStep] = useState(null)

  useEffect(() => { stepsRef.current = steps },                 [steps])
  useEffect(() => { currentIdxRef.current = currentStepIndex }, [currentStepIndex])
  useEffect(() => { instructionRef.current = instruction },      [instruction])
  useEffect(() => { hintRef.current = hint },                   [hint])
  useEffect(() => { requireBlocksRef.current = requireBlocks },  [requireBlocks])
  useEffect(() => { capturedRef.current = capturedBlocks },      [capturedBlocks])

  // ── Preview state ──────────────────────────────────────────────────────────
  const [filesWithCode, setFilesWithCode]         = useState([]) // { _key, filename, generatedCode }
  const [generatedCode, setGeneratedCode]         = useState('')
  const [activePreviewKey, setActivePreviewKey]   = useState(null)
  const [responsive, setResponsive]               = useState(true)
  const [selectedDevice, setSelectedDevice]       = useState('desktop')

  // ── Blockly workspace ─────────────────────────────────────────────────────
  // NOTE: BlocklyWorkspace is a CUSTOM HOOK, NOT a component.
  // The blocklyDiv ref must ALWAYS be in the DOM — we never early-return before
  // attaching it. Instead we use a loading overlay (see return below).
  const workspace = BlocklyWorkspace({
    onWorkspaceChange: (wsRef) => {
      if (isLoadingWsRef.current) return
      const step    = stepsRef.current[currentIdxRef.current]
      const file    = step?.files.find((f) => f._key === step.activeFileKey)
      if (!file) return
      const code = codeGeneratorService.generateCode(wsRef, file.filename)
      setFilesWithCode((prev) => {
        const exists = prev.find((f) => f._key === file._key)
        if (exists) return prev.map((f) => f._key === file._key ? { ...f, generatedCode: code } : f)
        return [...prev, { _key: file._key, filename: file.filename, generatedCode: code }]
      })
    },
    onWorkspaceLoad: () => {
      const step = stepsRef.current[currentIdxRef.current]
      if (step) defineFileReferenceBlocks(step.files.map((f) => ({ id: f._key, filename: f.filename })))
    },
  })

  // ── Recompute generatedCode whenever filesWithCode or preview file changes ─
  useEffect(() => {
    const step = steps[currentStepIndex]
    if (!step) return
    const previewFile = step.files.find((f) => f._key === activePreviewKey) ?? step.files[0]
    const combined = codeGeneratorService.combineFilesForPreview(
      filesWithCode.map((f) => ({ filename: f.filename, generatedCode: f.generatedCode })),
      previewFile?.filename
    )
    setGeneratedCode(combined)
  }, [filesWithCode, activePreviewKey, currentStepIndex])

  // ── Load existing tutorial for edit mode ──────────────────────────────────
  useEffect(() => {
    if (!isEdit) return
    ;(async () => {
      setLoading(true)
      try {
        const tut = await fetchTutorialById(id)
        setTutorialTitle(tut.title || '')
        setTutorialDescription(tut.description || '')
        setDifficulty(tut.difficulty_level || 'beginner')
        setEstimatedTime(tut.estimated_time_minutes?.toString() || '')
        setIsPublished(tut.is_published || false)
        setSavedId(tut.id)
        if (tut.badges?.length > 0) setBadge(tut.badges[0])

        const loaded = (tut.tutorial_steps || []).map((s) => {
          const stepFiles =
            s.tutorial_step_files?.length > 0
              ? s.tutorial_step_files.map((f) => ({
                  _key:        uid(),
                  id:          f.id,
                  filename:    f.filename,
                  blocks_json: f.blocks_json ?? null,
                }))
              : [makeFile()]

          return {
            id:            s.id,
            instruction:   s.instruction_text || '',
            hint:          s.hint || '',
            requireBlocks: !!s.expected_blocks_exact,
            capturedBlocks: s.expected_blocks_exact || null,
            files:         stepFiles,
            activeFileKey: stepFiles[0]._key,
          }
        })

        const initial = loaded.length > 0 ? loaded : [makeBlankStep()]
        setSteps(initial)
        syncFields(initial[0])
        initPreviewForStep(initial[0])

        // Queue the first step's blocks for loading.
        // The useEffect below watches workspace.isInitialized and drains this ref
        // once Blockly is ready — avoids the stale-closure problem of polling here.
        const firstFile = initial[0]?.files.find((f) => f._key === initial[0].activeFileKey)
        if (firstFile?.blocks_json) {
          setPendingFirstStep(firstFile.blocks_json)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    })()
  }, [id, isEdit])

  // ── Drain pending first-step load once Blockly is ready ──────────────────
  // workspace.isInitialized is React state inside BlocklyWorkspace, so changes
  // to it cause a re-render and this effect fires with the fresh true value —
  // unlike a setTimeout closure that captures the stale false forever.
  useEffect(() => {
    if (!workspace.isInitialized || !pendingFirstStep) return
    isLoadingWsRef.current = true
    workspace.loadWorkspaceState?.(pendingFirstStep)
    setPendingFirstStep(null)
    setTimeout(() => { isLoadingWsRef.current = false }, 200)
  }, [workspace.isInitialized, pendingFirstStep])

  // ── Helpers ────────────────────────────────────────────────────────────────
  const syncFields = (step) => {
    setInstruction(step?.instruction || '')
    setHint(step?.hint || '')
    setRequireBlocks(step?.requireBlocks || false)
    setCapturedBlocks(step?.capturedBlocks || null)
  }

  const initPreviewForStep = (step) => {
    if (!step) return
    setFilesWithCode(step.files.map((f) => ({ _key: f._key, filename: f.filename, generatedCode: '' })))
    const firstHtml = step.files.find((f) => f.filename.endsWith('.html')) ?? step.files[0]
    setActivePreviewKey(firstHtml?._key ?? null)
  }

  /**
   * Build a flushed version of the current step synchronously from refs.
   * Captures the current workspace state into the active file.
   */
  const buildFlushedStep = (wsState) => {
    const idx  = currentIdxRef.current
    const step = stepsRef.current[idx]
    return {
      ...step,
      instruction:   instructionRef.current,
      hint:          hintRef.current,
      requireBlocks: requireBlocksRef.current,
      capturedBlocks: capturedRef.current,
      files: step.files.map((f) =>
        f._key === step.activeFileKey ? { ...f, blocks_json: wsState } : f
      ),
    }
  }

  /** Replace current step in the array with flushed version, update ref + state */
  const commitFlushedStep = (flushedStep) => {
    const idx = currentIdxRef.current
    const newSteps = stepsRef.current.map((s, i) => (i === idx ? flushedStep : s))
    stepsRef.current = newSteps
    setSteps(newSteps)
    return newSteps
  }

  // ── Switch step ────────────────────────────────────────────────────────────
  const handleGoToStep = useCallback((idx) => {
    if (idx === currentIdxRef.current) return

    // 1. Flush current
    const ws      = workspace.getWorkspaceState?.() ?? null
    const flushed = buildFlushedStep(ws)
    commitFlushedStep(flushed)

    // 2. Switch
    currentIdxRef.current = idx
    setCurrentStepIndex(idx)

    const target = stepsRef.current[idx]
    syncFields(target)
    initPreviewForStep(target)

    // 3. Load target file's workspace (or keep current if null = inherited)
    const activeFile = target.files.find((f) => f._key === target.activeFileKey)
    if (activeFile?.blocks_json) {
      isLoadingWsRef.current = true
      workspace.loadWorkspaceState?.(activeFile.blocks_json)
      setTimeout(() => { isLoadingWsRef.current = false }, 150)
    }
    // If null → workspace stays as-is (inherited from previous step)

    // Update file-reference blocks for the new step
    defineFileReferenceBlocks(target.files.map((f) => ({ id: f._key, filename: f.filename })))
  }, [workspace])

  // ── Add step — inherits current files & workspace ─────────────────────────
  const handleAddStep = useCallback(() => {
    const ws      = workspace.getWorkspaceState?.() ?? null
    const flushed = buildFlushedStep(ws)
    const newSteps = [...commitFlushedStep(flushed), makeBlankStep(flushed.files)]
    stepsRef.current = newSteps
    setSteps(newSteps)

    const newIdx = newSteps.length - 1
    currentIdxRef.current = newIdx
    setCurrentStepIndex(newIdx)
    syncFields(newSteps[newIdx])
    initPreviewForStep(newSteps[newIdx])
    // Workspace stays as-is — inherited from the last step
  }, [workspace])

  // ── Delete step ────────────────────────────────────────────────────────────
  const handleDeleteStep = async (idx) => {
    const step = stepsRef.current[idx]
    if (step?.id) {
      try { await deleteTutorialStep(step.id) } catch (e) { console.error(e) }
    }
    setSteps((prev) => {
      const updated  = prev.filter((_, i) => i !== idx)
      const fallback = updated.length > 0 ? updated : [makeBlankStep()]
      const safeIdx  = Math.min(
        currentIdxRef.current >= idx ? currentIdxRef.current - 1 : currentIdxRef.current,
        fallback.length - 1
      )
      const clampedIdx = Math.max(0, safeIdx)

      setTimeout(() => {
        currentIdxRef.current = clampedIdx
        setCurrentStepIndex(clampedIdx)
        syncFields(fallback[clampedIdx])
        initPreviewForStep(fallback[clampedIdx])
        const af = fallback[clampedIdx]?.files.find((f) => f._key === fallback[clampedIdx].activeFileKey)
        if (af?.blocks_json) {
          isLoadingWsRef.current = true
          workspace.loadWorkspaceState?.(af.blocks_json)
          setTimeout(() => { isLoadingWsRef.current = false }, 150)
        }
      }, 0)

      return fallback
    })
  }

  // ── Drag reorder ───────────────────────────────────────────────────────────
  const handleDragReorder = (from, to) => {
    setSteps((prev) => {
      const arr = [...prev]
      const [moved] = arr.splice(from, 1)
      arr.splice(to, 0, moved)
      return arr
    })
    setCurrentStepIndex((prev) => {
      if (prev === from) return to
      if (from < to && prev > from && prev <= to) return prev - 1
      if (from > to && prev >= to && prev < from) return prev + 1
      return prev
    })
  }

  // ── File operations (within current step) ─────────────────────────────────
  /** Switch active file within the current step */
  const handleFileChange = useCallback((_key) => {
    const step = stepsRef.current[currentIdxRef.current]
    if (!step || _key === step.activeFileKey) return

    // Save current file's workspace state
    const ws      = workspace.getWorkspaceState?.() ?? null
    const newFiles = step.files.map((f) =>
      f._key === step.activeFileKey ? { ...f, blocks_json: ws } : f
    )
    const newStep = { ...step, files: newFiles, activeFileKey: _key }
    const newSteps = stepsRef.current.map((s, i) => (i === currentIdxRef.current ? newStep : s))
    stepsRef.current = newSteps
    setSteps(newSteps)

    // Load new file's workspace
    const targetFile = newFiles.find((f) => f._key === _key)
    isLoadingWsRef.current = true
    if (targetFile?.blocks_json) {
      workspace.loadWorkspaceState?.(targetFile.blocks_json)
    } else {
      workspace.clearWorkspace?.()
    }
    setTimeout(() => { isLoadingWsRef.current = false }, 150)

    // Auto-set preview to this file if it's HTML
    if (targetFile?.filename.endsWith('.html')) setActivePreviewKey(_key)
  }, [workspace])

  /** Create a new file in the current step */
  const handleCreateFile = useCallback((filename) => {
    const step    = stepsRef.current[currentIdxRef.current]
    if (!step) return
    // Save current file's workspace
    const ws      = workspace.getWorkspaceState?.() ?? null
    const newFile = makeFile(filename)
    const newFiles = [
      ...step.files.map((f) => f._key === step.activeFileKey ? { ...f, blocks_json: ws } : f),
      newFile,
    ]
    const newStep  = { ...step, files: newFiles, activeFileKey: newFile._key }
    const newSteps = stepsRef.current.map((s, i) => (i === currentIdxRef.current ? newStep : s))
    stepsRef.current = newSteps
    setSteps(newSteps)

    // Clear workspace for blank new file
    isLoadingWsRef.current = true
    workspace.clearWorkspace?.()
    setTimeout(() => { isLoadingWsRef.current = false }, 150)

    // Update preview list
    setFilesWithCode((prev) => [...prev, { _key: newFile._key, filename, generatedCode: '' }])
    if (filename.endsWith('.html')) setActivePreviewKey(newFile._key)

    defineFileReferenceBlocks(newFiles.map((f) => ({ id: f._key, filename: f.filename })))
    addToast(`Created ${filename}`, 'success')
  }, [workspace, addToast])

  /** Delete a file from the current step */
  const handleDeleteFile = useCallback((_key) => {
    const step = stepsRef.current[currentIdxRef.current]
    if (!step || step.files.length <= 1) return // can't delete the last file

    const remaining   = step.files.filter((f) => f._key !== _key)
    const wasActive   = step.activeFileKey === _key
    const newActiveKey = wasActive ? remaining[0]._key : step.activeFileKey
    const newStep     = { ...step, files: remaining, activeFileKey: newActiveKey }
    const newSteps    = stepsRef.current.map((s, i) => (i === currentIdxRef.current ? newStep : s))
    stepsRef.current  = newSteps
    setSteps(newSteps)
    setFilesWithCode((prev) => prev.filter((f) => f._key !== _key))

    if (wasActive) {
      const af = remaining[0]
      isLoadingWsRef.current = true
      if (af?.blocks_json) {
        workspace.loadWorkspaceState?.(af.blocks_json)
      } else {
        workspace.clearWorkspace?.()
      }
      setTimeout(() => { isLoadingWsRef.current = false }, 150)
    }

    defineFileReferenceBlocks(remaining.map((f) => ({ id: f._key, filename: f.filename })))
  }, [workspace])

  // ── Capture / clear expected blocks ───────────────────────────────────────
  const handleCaptureBlocks = () => {
    setCapturedBlocks(workspace.getWorkspaceState?.())
    addToast('Workspace captured!', 'success')
  }
  const handleClearBlocks = () => setCapturedBlocks(null)

  // ── Ensure tutorial exists in DB ──────────────────────────────────────────
  const ensureTutorial = async () => {
    const meta = {
      title:                   tutorialTitle.trim() || 'Untitled Tutorial',
      description:             tutorialDescription.trim(),
      difficulty_level:        difficulty,
      estimated_time_minutes:  estimatedTime ? parseInt(estimatedTime) : null,
    }
    if (savedId) { await updateTutorial(savedId, meta); return savedId }
    const tut = await createTutorial({ ...meta, teacher_id: user.id, is_published: false })
    setSavedId(tut.id)
    return tut.id
  }

  // ── Save all steps + their files ──────────────────────────────────────────
  const handleSaveTutorial = async (silent = false) => {
    if (!tutorialTitle.trim()) { addToast('Add a tutorial title first', 'error'); return null }
    setSaving(true)
    setSaveMsg('')
    try {
      // Build latest snapshot synchronously from refs
      const ws       = workspace.getWorkspaceState?.() ?? null
      const flushed  = buildFlushedStep(ws)
      const toSave   = stepsRef.current.map((s, i) => (i === currentIdxRef.current ? flushed : s))
      // Commit to state + ref
      stepsRef.current = toSave
      setSteps(toSave)

      // Validate
      const badIdx = toSave.findIndex((s) => !s.instruction.trim())
      if (badIdx !== -1) { addToast(`Step ${badIdx + 1} needs an instruction`, 'error'); setSaving(false); return null }

      const tutId = await ensureTutorial()

      // Upsert all steps + their files
      const savedSteps = await Promise.all(
        toSave.map(async (step, idx) => {
          const stepPayload = {
            tutorial_id:          tutId,
            instruction_text:     step.instruction.trim(),
            hint:                 step.hint?.trim() || null,
            expected_blocks_exact: step.requireBlocks && step.capturedBlocks ? step.capturedBlocks : null,
            order_index:          idx,
          }
          const savedStep = step.id
            ? await updateTutorialStep(step.id, stepPayload)
            : await createTutorialStep(stepPayload)

          // Save this step's files as template files
          await saveStepFiles(savedStep.id, step.files)

          return { ...savedStep, _localStep: step }
        })
      )

      // Sync DB ids back into state
      const withIds = toSave.map((s, i) => ({ ...s, id: savedSteps[i].id }))
      stepsRef.current = withIds
      setSteps(withIds)

      await reorderTutorialSteps(savedSteps.map((s) => s.id))

      if (!isEdit) navigate(`/teacher/tutorials/${tutId}/edit`, { replace: true })

      if (!silent) {
        setSaveMsg('Saved!')
        setTimeout(() => setSaveMsg(''), 3000)
        addToast('Tutorial saved!', 'success')
      }
      return tutId
    } catch (err) {
      addToast('Save failed: ' + err.message, 'error')
      return null
    } finally {
      setSaving(false)
    }
  }

  // ── Open badge modal (save first if new) ──────────────────────────────────
  const handleOpenBadge = async () => {
    if (!savedId) {
      const tutId = await handleSaveTutorial(true)
      if (!tutId) return
    }
    setShowBadgeModal(true)
  }

  // ── Publish ────────────────────────────────────────────────────────────────
  const handlePublish = async () => {
    const tutId = await handleSaveTutorial(true)
    if (!tutId) return
    setSaving(true)
    try {
      await updateTutorial(tutId, { is_published: true })
      setIsPublished(true)
      addToast('Tutorial published!', 'success')
    } catch (err) {
      addToast('Publish failed: ' + err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  // ── Derive current step's files for FileTabs ───────────────────────────────
  const currentStep    = steps[currentStepIndex]
  const currentFiles   = currentStep?.files ?? []
  const activeFileKey  = currentStep?.activeFileKey ?? null
  const activeFileObj  = currentFiles.find((f) => f._key === activeFileKey)
  const htmlFiles      = currentFiles
    .filter((f) => f.filename.endsWith('.html'))
    .map((f) => ({ id: f._key, filename: f.filename }))

  // ── Navigate to a file in the preview (Pages tab) ─────────────────────────
  const handleNavigateToFile = (filename) => {
    const file = currentFiles.find((f) => f.filename === filename)
    if (file) setActivePreviewKey(file._key)
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // IMPORTANT: We NEVER do an early return before the JSX that contains
  // `workspace.blocklyDiv` — if the div is not in the DOM when Blockly's
  // useEffect fires, injection silently fails and the workspace disappears.
  // We use a loading OVERLAY instead.
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="relative flex flex-col h-screen bg-slate-100">

      {/* Loading overlay — sits on top, never unmounts the Blockly div */}
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
            <p className="text-sm text-slate-500 font-medium">Loading tutorial…</p>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-2.5 bg-white border-b border-slate-200 shadow-sm">
        <button
          onClick={() => navigate('/teacher/tutorials')}
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={16} /> Tutorials
        </button>
        <span className="text-slate-300">/</span>
        <span className="text-sm font-black text-slate-700 truncate max-w-xs">
          {tutorialTitle || 'New Tutorial'}
        </span>
        <div className="ml-auto flex items-center gap-3">
          {badge && (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-50 border border-amber-200 rounded-full text-[11px] font-bold text-amber-700">
              <Award size={11} /> {badge.title}
            </span>
          )}
          <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full ${
            isPublished ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
          }`}>
            {isPublished ? 'Published' : 'Draft'}
          </span>
          <span className="text-xs text-slate-400 tabular-nums">
            Step {currentStepIndex + 1} / {steps.length}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left panel */}
        <div className="w-1/3 min-w-70 max-w-sm shrink-0 h-full overflow-hidden">
          <StepPanel
            tutorialTitle={tutorialTitle}             setTutorialTitle={setTutorialTitle}
            tutorialDescription={tutorialDescription} setTutorialDescription={setTutorialDescription}
            difficulty={difficulty}                   setDifficulty={setDifficulty}
            estimatedTime={estimatedTime}             setEstimatedTime={setEstimatedTime}
            isPublished={isPublished}
            steps={steps}
            currentStepIndex={currentStepIndex}
            onGoToStep={handleGoToStep}
            onAddStep={handleAddStep}
            onDeleteStep={handleDeleteStep}
            onDragReorder={handleDragReorder}
            instruction={instruction}                 setInstruction={setInstruction}
            hint={hint}                               setHint={setHint}
            requireBlocks={requireBlocks}             setRequireBlocks={setRequireBlocks}
            capturedBlocks={capturedBlocks}
            onCaptureBlocks={handleCaptureBlocks}
            onClearBlocks={handleClearBlocks}
            onSaveTutorial={handleSaveTutorial}
            onOpenBadge={handleOpenBadge}
            onPublish={handlePublish}
            saving={saving}
            saveMsg={saveMsg}
            hasBadge={!!badge}
          />
        </div>

        {/* Blockly — always in the DOM */}
        <div className="flex flex-col flex-1 h-full border-r border-gray-600 bg-white overflow-hidden">
          <FileTabs
            files={currentFiles.map((f) => ({ id: f._key, filename: f.filename }))}
            activeFile={activeFileKey}
            isLocal={true}
            onFileChange={handleFileChange}
            onFileCreate={handleCreateFile}
            onFileDelete={handleDeleteFile}
          />
          {/* THIS DIV MUST ALWAYS RENDER — Blockly injects into it on mount */}
          <div ref={workspace.blocklyDiv} className="blocklyDiv flex-1" />
        </div>

        {/* Preview */}
        <div className="w-1/4 h-full overflow-hidden">
          <PreviewPane
            generatedCode={generatedCode}
            currentFileCode={filesWithCode.find((f) => f._key === activeFileKey)?.generatedCode || ''}
            currentFileName={activeFileObj?.filename || ''}
            previewFileName={currentFiles.find((f) => f._key === activePreviewKey)?.filename || ''}
            htmlFiles={htmlFiles}
            onRunCode={() => {
              if (!workspace.getWorkspace() || !activeFileObj) return
              const code = codeGeneratorService.generateCode(workspace.getWorkspace(), activeFileObj.filename)
              setFilesWithCode((prev) => prev.map((f) => f._key === activeFileKey ? { ...f, generatedCode: code } : f))
            }}
            onNavigateToFile={handleNavigateToFile}
            responsive={responsive}
            selectedDevice={selectedDevice}
            onToggleResponsive={() => setResponsive((r) => !r)}
            onSelectDevice={setSelectedDevice}
          />
        </div>
      </div>

      {/* Badge modal */}
      {showBadgeModal && savedId && (
        <BadgeModal
          tutorialId={savedId}
          existingBadge={badge}
          onClose={() => setShowBadgeModal(false)}
          onSaved={(saved) => {
            setBadge(saved)
            addToast(saved ? 'Badge saved!' : 'Badge removed', 'success')
          }}
        />
      )}
    </div>
  )
}