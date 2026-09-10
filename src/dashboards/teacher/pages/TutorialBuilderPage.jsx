import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useAuth } from '../../../hooks/useAuth'
import { useTutorialBuilder } from '../../../hooks/useTutorialBuilder'
import { fetchTopicGroupsForAuthoring } from '../../../services/contentCreationService'
import BlocklyWorkspace from '../../../components/editor/BlocklyWorkspace'
import PreviewPane from '../../../components/editor/PreviewPane'
import FileTabs from '../../../components/editor/FileTabs'
import { codeGeneratorService } from '../../../services/codeGenerator.service'
import { defineFileReferenceBlocks } from '../../../blockly/fileReferenceBlocks'
import {
  BookOpen, Check, ChevronDown, ChevronLeft, ChevronRight,
  CircleDot, Lightbulb, ListOrdered, PlusCircle, Sun, Trash2,
} from 'lucide-react'
import BackButton from '#components/common/BackButton'
import { Button } from '#components/ui/button'
import { toast } from 'sonner'
import { getToolboxCategoryOptions } from '@/blockly/toolboxCategoryTree'
import RemiGuide from '#components/tutorial/RemiGuide'
import { useRemiHighlight } from '#hooks/useRemiHighlights'

const CATEGORY_OPTIONS = getToolboxCategoryOptions()
const STATUS_STYLES = {
  captured:  { label: 'Captured',  cls: 'bg-emerald-100 text-emerald-700' },
  inherited: { label: 'Inherited', cls: 'bg-sky-100 text-sky-700' },
  initial:   { label: 'Initial content', cls: 'bg-slate-100 text-slate-500' },
  empty:     { label: 'Empty', cls: 'bg-slate-50 text-slate-400' },
}

// ─── Step Panel ─────────────────────────────────────────────────────────────
function StepPanel({
  meta, setMeta, courseTopics, loadingTopics,
  files, activeFilename, getFileStatusForStep, currentStepIndex,
  steps, onGoToStep, onAddStep, onDeleteStep,
  currentStep, onUpdateCurrentStep,
  onCapture, onClearCapture,
  panelOpen, setPanelOpen,
}) {
  const [metaOpen, setMetaOpen] = useState(true)
  const activeExpected = currentStep?.expectedByFile[activeFilename]
  const selectedCategory = CATEGORY_OPTIONS.find(
    (c) => JSON.stringify(c.path) === JSON.stringify(currentStep?.highlightCategoryPath ?? [])
  )

  return (
    <div className="flex flex-col h-full bg-white border border-border overflow-hidden rounded">
      <div className={`shrink-0 flex justify-between py-1 ${panelOpen ? 'bg-slate-200' : ''}`}>
        {panelOpen && (
          <div className="flex items-center gap-2 mb-1 px-4">
            <BookOpen size={16} />
            <span className="font-bold tracking-wider">Tutorial Builder</span>
          </div>
        )}
        <button onClick={() => setPanelOpen(!panelOpen)} className={`p-2 rounded hover:bg-slate-300 transition-colors! ${panelOpen ? 'mr-2' : 'mx-auto'}`}>
          {panelOpen ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
        </button>
      </div>

      {panelOpen && (
      <div className="flex-1 overflow-y-auto">
        {/* Tutorial meta */}
        <div className="border-b border-border">
          <button
            onClick={() => setMetaOpen((o) => !o)}
            className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors!"
          >
            <span className="flex items-center gap-1.5"><ListOrdered size={13} /> Tutorial Info</span>
            {metaOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          {metaOpen && (
            <div className="px-4 pb-4 flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                  Tutorial Title <span className="text-red-600 text-sm">*</span>
                </label>
                <input
                  type="text"
                  value={meta.title}
                  onChange={(e) => setMeta({ title: e.target.value })}
                  placeholder="e.g. Build a webpage from scratch"
                  className="w-full px-3 py-2 text-sm border border-border rounded focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                  Topic <span className="text-red-600 text-sm">*</span>
                </label>
                <select
                  value={meta.topicId}
                  onChange={(e) => setMeta({ topicId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-border rounded focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white"
                >
                  <option value="">{loadingTopics ? 'Loading topics...' : 'Select a topic'}</option>
                  {courseTopics.map((group) => (
                    <optgroup key={group.course} label={group.course}>
                      {group.topics.map((topic) => (
                        <option key={topic.id} value={topic.id}>{topic.title}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                  Base XP <span className="text-red-600 text-sm">*</span>
                </label>
                <input
                  type="number" min={1} step={1}
                  value={meta.baseXp}
                  onChange={(e) => setMeta({ baseXp: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-border rounded focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Steps list — append-only, no reorder */}
        <div className="border-b border-border">
          <div className="flex items-center justify-between px-4 py-1">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <CircleDot size={13} /> Steps<span className="text-indigo-600">({steps.length})</span>
            </span>
            <button
              onClick={onAddStep}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-slate-200 p-1 transition-colors"
            >
              <PlusCircle size={14} /> Add Step
            </button>
          </div>

          <div className="px-3 pb-3 space-y-1">
            {steps.map((step, idx) => (
              <div
                key={step.id ?? `new-${idx}`}
                className={`group flex items-start gap-1.5 rounded-xl transition-all ${
                  idx === currentStepIndex ? 'bg-indigo-600 shadow-sm' : 'hover:bg-slate-100'
                }`}
              >
                <button
                  onClick={() => onGoToStep(idx)}
                  className="flex-1 text-left px-2 py-2.5 text-xs font-semibold flex items-start gap-2"
                >
                  <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black mt-0.5 ${
                    idx === currentStepIndex ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className={`line-clamp-2 leading-snug ${idx === currentStepIndex ? 'text-white' : 'text-slate-600'}`}>
                    {step.instruction?.trim() || `Step ${idx + 1}`}
                  </span>
                </button>
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

        {/* Current step editor */}
        <div className="px-4 py-4 flex flex-col gap-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase">
            Step <span className="bg-indigo-50 text-indigo-600 px-1 rounded">{currentStepIndex + 1}</span> Content
          </h3>

          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
              Instruction <span className="text-red-600 text-sm">*</span>
            </label>
            <textarea
              value={currentStep?.instruction ?? ''}
              onChange={(e) => onUpdateCurrentStep({ instruction: e.target.value })}
              placeholder="Tell students what to do in this step…"
              rows={5}
              className="w-full px-3 py-2 text-sm border border-border rounded focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white resize-none leading-relaxed"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1">
              <Lightbulb size={11} /> Hint <span className="text-slate-400 lowercase font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={currentStep?.hint ?? ''}
              onChange={(e) => onUpdateCurrentStep({ hint: e.target.value })}
              placeholder="Give a helpful nudge…"
              className="w-full px-3 py-2 text-sm border border-border rounded focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white"
            />
          </div>
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2">
            <p className="text-xs font-bold text-slate-700">Remi's pointer for this step</p>
            <select
              value={currentStep?.highlightCategoryPath ? JSON.stringify(currentStep.highlightCategoryPath) : ''}
              onChange={(e) => {
                const path = e.target.value ? JSON.parse(e.target.value) : null
                onUpdateCurrentStep({ highlightCategoryPath: path, highlightBlockType: null })
              }}
              className="w-full px-3 py-2 text-sm border border-border rounded bg-white"
            >
              <option value="">No highlight</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.label} value={JSON.stringify(c.path)}>{c.label}</option>
              ))}
            </select>

            {selectedCategory?.blockTypes.length > 0 && (
              <select
                value={currentStep?.highlightBlockType ?? ''}
                onChange={(e) => onUpdateCurrentStep({ highlightBlockType: e.target.value || null })}
                className="w-full px-3 py-2 text-sm border border-border rounded bg-white"
              >
                <option value="">Just highlight the category</option>
                {selectedCategory.blockTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            )}
          </div>

          {/* Capture the active file's solution for this step */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2">
            <p className="text-xs font-bold text-slate-700">
              Solution for <span className="text-indigo-600">{activeFilename}</span>
            </p>
            {activeExpected ? (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                <Check size={13} className="text-emerald-600 shrink-0" />
                <span className="text-xs text-emerald-700 font-semibold flex-1">Captured for this step</span>
                <button onClick={() => onClearCapture(activeFilename)} className="text-[11px] text-red-400 hover:text-red-600 font-semibold">
                  Clear
                </button>
              </div>
            ) : (
              <button
                onClick={() => onCapture(activeFilename)}
                className="w-full py-2 text-xs font-bold border-2 border-dashed border-indigo-300 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                📸 Capture this file as the step's solution
              </button>
            )}
            <p className="text-[11px] text-slate-400">
              Uncaptured files here inherit content from the nearest earlier step (or the file's starting content).
            </p>
          </div>

          {/* Status checklist across all files */}
          {files.length > 1 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Files in this step</p>
              {files.map((f) => {
                const status = getFileStatusForStep(f.filename, currentStepIndex)
                const s = STATUS_STYLES[status]
                return (
                  <div key={f.filename} className="flex items-center justify-between text-xs px-2 py-1.5 rounded-lg border border-slate-100">
                    <span className={`truncate font-semibold ${f.filename === activeFilename ? 'text-indigo-600' : 'text-slate-600'}`}>
                      {f.filename}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${s.cls}`}>{s.label}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  )
}

// ─── Main Builder ───────────────────────────────────────────────────────────
export default function TutorialBuilderPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [courseTopics, setCourseTopics] = useState([])
  const [loadingTopics, setLoadingTopics] = useState(true)
  const [activeFilename, setActiveFilename] = useState(null)
  const [previewFilename, setPreviewFilename] = useState(null)
  const [filesWithCode, setFilesWithCode] = useState([])
  const [generatedCode, setGeneratedCode] = useState('')
  const [responsive, setResponsive] = useState(true)
  const [selectedDevice, setSelectedDevice] = useState()
  const [panelOpen, setPanelOpen] = useState(true)
  const [remiMinimized, setRemiMinimized] = useState(false)

  const workspace = BlocklyWorkspace({
    onWorkspaceChange: () => {
      if (builder.isLoadingWsRef.current || !activeFilename) return
      builder.recordWorkingEdit(activeFilename)
      const wsObj = workspace.getWorkspace()
      const code = codeGeneratorService.generateCode(wsObj, activeFilename)
      setFilesWithCode((prev) => prev.map((f) => f.filename === activeFilename ? { ...f, generatedCode: code } : f))
    },
    onWorkspaceLoad: () => {
      defineFileReferenceBlocks(builder.files.map((f) => ({ id: f.filename, filename: f.filename })))
    },
  })

  const builder = useTutorialBuilder({ lessonId: id, authorId: user?.id, workspace })

  // Load topics for the dropdown
  useEffect(() => {
    ;(async () => {
      setLoadingTopics(true)
      try { setCourseTopics(await fetchTopicGroupsForAuthoring()) }
      catch (err) { toast.error(err.message || 'Failed to load topics.') }
      finally { setLoadingTopics(false) }
    })()
  }, [])

  // Pick a sane default active file once data is loaded
  useEffect(() => {
    if (builder.loading || builder.files.length === 0) return
    setActiveFilename((prev) => (prev && builder.files.some((f) => f.filename === prev)) ? prev : builder.files[0].filename)
  }, [builder.loading, builder.files])

  // Reload workspace + recompute preview code whenever step or active file changes
  useEffect(() => {
    if (builder.loading || !activeFilename) return
    builder.loadFileIntoWorkspace(activeFilename, builder.currentStepIndex)
    setFilesWithCode(builder.getFilesWithCodeForStep(builder.currentStepIndex))
    defineFileReferenceBlocks(builder.files.map((f) => ({ id: f.filename, filename: f.filename })))
  }, [builder.currentStepIndex, activeFilename, builder.loading])

  // Default preview file to first html file
  useEffect(() => {
    if (previewFilename && builder.files.some((f) => f.filename === previewFilename)) return
    const firstHtml = builder.files.find((f) => f.filename.endsWith('.html'))
    setPreviewFilename(firstHtml?.filename ?? builder.files[0]?.filename ?? null)
  }, [builder.files, previewFilename])

  // Combine files into the previewable HTML
  useEffect(() => {
    setGeneratedCode(codeGeneratorService.combineFilesForPreview(filesWithCode, previewFilename))
  }, [filesWithCode, previewFilename])

  // ── File tab handlers ──────────────────────────────────────────────────
  const handleFileChange = useCallback((filename) => {
    setActiveFilename(filename)
    if (filename.endsWith('.html')) setPreviewFilename(filename)
  }, [])

  const handleCreateFile = useCallback((filename) => {
    builder.addFile(filename)
    setActiveFilename(filename)
    toast.success(`Created ${filename}`)
  }, [builder])

  const handleDeleteFile = useCallback(async (filename) => {
    const remaining = builder.files.filter((f) => f.filename !== filename)
    await builder.removeFile(filename)
    if (activeFilename === filename) setActiveFilename(remaining[0]?.filename ?? null)
  }, [builder, activeFilename])

  // ── Capture / clear ─────────────────────────────────────────────────────
  const handleCapture = useCallback((filename) => {
    builder.captureActiveFile(filename)
    toast.success(`Captured ${filename} for this step`)
  }, [builder])

  const handleClearCapture = useCallback((filename) => {
    builder.clearCapture(filename)
    if (filename === activeFilename) builder.loadFileIntoWorkspace(filename, builder.currentStepIndex)
    setFilesWithCode(builder.getFilesWithCodeForStep(builder.currentStepIndex))
  }, [builder, activeFilename])

  // ── Step nav ────────────────────────────────────────────────────────────
  const handleDeleteStep = useCallback((idx) => {
    if (!window.confirm('Delete this step? This cannot be undone.')) return
    builder.deleteStepAt(idx)
  }, [builder])

  // ── Save / Publish ──────────────────────────────────────────────────────
  const handleSave = async () => {
    try {
      const lessonId = await builder.saveAll()
      if (!isEdit) navigate(`/teacher/tutorial/edit/${lessonId}`, { replace: true })
      toast.success('Tutorial saved!')
    } catch (err) {
      toast.error(err.message || 'Save failed')
    }
  }

  const handlePublish = async () => {
    try {
      const lessonId = await builder.publish()
      if (!isEdit) navigate(`/teacher/tutorial/edit/${lessonId}`, { replace: true })
      toast.success('Tutorial published!')
    } catch (err) {
      toast.error(err.message || 'Publish failed')
    }
  }

  const handleRunCode = () => {
    const wsObj = workspace.getWorkspace()
    if (!wsObj || !activeFilename) return
    const code = codeGeneratorService.generateCode(wsObj, activeFilename)
    setFilesWithCode((prev) => prev.map((f) => f.filename === activeFilename ? { ...f, generatedCode: code } : f))
  }

  const htmlFiles = builder.files
    .filter((f) => f.filename.endsWith('.html'))
    .map((f) => ({ id: f.filename, filename: f.filename }))

  const currentFileCode = filesWithCode.find((f) => f.filename === activeFilename)?.generatedCode || ''

  
  useRemiHighlight(
    workspace.getWorkspace,
    builder.currentStep?.highlightCategoryPath,
    builder.currentStep?.highlightBlockType
  )

  return (
    <div className="relative flex flex-col h-screen bg-gray-100">
      {builder.loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
            <p className="text-sm text-slate-500 font-medium">Loading tutorial…</p>
          </div>
        </div>
      )}

      <div className="shrink-0 flex items-center gap-3 px-4 py-2.5">
        <Link to="/"><img src="/icon.png" alt="icon" className="w-8 h-8" /></Link>
        <BackButton />
        <span className="text-slate-500">/</span>
        <span className="font-bold text-slate-700 truncate max-w-xs">
          {builder.meta.title || 'New Tutorial'}
        </span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          builder.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
        }`}>
          {builder.isPublished ? 'Published' : 'Draft'}
        </span>
        {builder.dirty && <span className="text-[10px] text-amber-600 font-semibold">Unsaved changes</span>}

        <div className="ml-auto flex gap-1.5">
          <Button variant="ghost"><Sun size={20} />Light Mode</Button>
          <Button variant="secondary" onClick={handleSave} disabled={builder.saving}>
            {builder.saving ? 'Saving…' : 'Save Tutorial'}
          </Button>
          <Button variant="primary" onClick={handlePublish} disabled={builder.saving}>
            Publish
          </Button>
        </div>
      </div>

      <div className="relative flex flex-1 overflow-hidden px-3 gap-1.5 mb-4">
        <div className={`${panelOpen ? 'w-1/3 min-w-70' : 'w-10'} max-w-sm shrink-0 h-full overflow-hidden`}>
          <StepPanel
            meta={builder.meta} setMeta={builder.setMeta}
            courseTopics={courseTopics} loadingTopics={loadingTopics}
            files={builder.files} activeFilename={activeFilename}
            getFileStatusForStep={builder.getFileStatusForStep}
            currentStepIndex={builder.currentStepIndex}
            steps={builder.steps}
            onGoToStep={builder.goToStep}
            onAddStep={builder.addStep}
            onDeleteStep={handleDeleteStep}
            currentStep={builder.currentStep}
            onUpdateCurrentStep={builder.updateCurrentStep}
            onCapture={handleCapture}
            onClearCapture={handleClearCapture}
            panelOpen={panelOpen} setPanelOpen={setPanelOpen}
          />
        </div>

        <div className="flex flex-col flex-1 h-full border border-border rounded bg-white overflow-hidden">
          <FileTabs
            files={builder.files.map((f) => ({ id: f.filename, filename: f.filename }))}
            activeFile={activeFilename}
            isLocal
            onFileChange={handleFileChange}
            onFileCreate={handleCreateFile}
            onFileDelete={handleDeleteFile}
          />
          <div ref={workspace.blocklyDiv} className="blocklyDiv flex-1 relative" />
        </div>

        <div className="w-1/4 h-full overflow-hidden">
          <PreviewPane
            generatedCode={generatedCode}
            currentFileCode={currentFileCode}
            currentFileName={activeFilename || ''}
            previewFileName={previewFilename || ''}
            htmlFiles={htmlFiles}
            onRunCode={handleRunCode}
            onNavigateToFile={(filename) => setPreviewFilename(filename)}
            responsive={responsive}
            selectedDevice={selectedDevice}
            onToggleResponsive={() => setResponsive((r) => !r)}
            onSelectDevice={setSelectedDevice}
          />
        </div>
        <RemiGuide
          instruction={builder.currentStep?.instruction || 'Add an instruction for this step.'}
          hint={builder.currentStep?.hint}
          stepLabel={`Step ${builder.currentStepIndex + 1} of ${builder.steps.length}`}
          minimized={remiMinimized}
          onToggleMinimize={() => setRemiMinimized((m) => !m)}
          onPrev={() => builder.goToStep(builder.currentStepIndex - 1)}
          onNext={() => builder.goToStep(builder.currentStepIndex + 1)}
          isFirst={builder.currentStepIndex === 0}
          isLast={builder.currentStepIndex === builder.steps.length - 1}
        />
      </div>
    </div>
  )
}