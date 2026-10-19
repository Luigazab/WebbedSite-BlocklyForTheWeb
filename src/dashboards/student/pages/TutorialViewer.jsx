import { lessonBlockTypes } from '@/blockly/learningToolbox'
import WorkspaceTools from '@/components/editor/WorkspaceTools'
import { validateTutorialStep } from '../../../utils/validation/tutorialStepValidation'
import { resolveStudentStepFiles } from '../../../utils/tutorialSteps'
import { useRemiHighlight } from '../../../hooks/useRemiHighlights'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import BlocklyWorkspace from '../../../components/editor/BlocklyWorkspace'
import PreviewPane from '../../../components/editor/PreviewPane'
import FileTabs from '../../../components/editor/FileTabs'
import TutorialCharacterGuide from '../components/TutorialCharacterGuide'
import { codeGeneratorService } from '../../../services/codeGenerator.service'
import { fetchTutorialById } from '../../../services/tutorial.service'
import { defineFileReferenceBlocks } from '../../../blockly/fileReferenceBlocks'
import { useAuthStore } from '../../../store/authStore'
import { useUIStore } from '../../../store/uiStore'
import { getOwnSubmissions } from '../../../services/studentReviewService'
import { saveTutorialSubmission, tutorialAction } from '../../../services/tutorialSubmissionService'
import { useActivityTiming } from '../../../hooks/useActivityTiming'
import { ArrowLeft, Trophy, Loader2, AlertCircle, Clock } from 'lucide-react'
import BackButton from '#components/common/BackButton'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const dbFileToTab = (f) => ({
  id:          f.id,
  filename:    f.filename,
  blocks_json: f.blocks_json ?? null,
  code:        f.blocks_json ? codeGeneratorService.generateCodeFromState(f.blocks_json, f.filename) : f.code ?? '',
})

const DIFFICULTY_META = {
  beginner:     { label: 'Beginner',     color: 'bg-emerald-100 text-emerald-700' },
  intermediate: { label: 'Intermediate', color: 'bg-amber-100  text-amber-700'   },
  advanced:     { label: 'Advanced',     color: 'bg-red-100    text-red-700'      },
}

// ─── Confetti ─────────────────────────────────────────────────────────────────
const CONFETTI_COLORS = ['#7c3aed','#a78bfa','#fbbf24','#34d399','#60a5fa','#f472b6']

function Confetti() {
  const [pieces] = useState(() => Array.from({ length: 60 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 1.2}s`,
    duration: `${2 + Math.random() * 1.5}s`,
    size: `${6 + Math.random() * 8}px`,
  })))
  return (
    <div className="fixed inset-0 pointer-events-none z-[10002] overflow-hidden">
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) rotate(0deg);   opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateY(105vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {pieces.map((p) => (
        <div key={p.id} style={{
          position: 'absolute', top: '-10px', left: p.left,
          width: p.size, height: p.size, backgroundColor: p.color,
          borderRadius: p.id % 3 === 0 ? '50%' : '2px',
          animation: `confettiFall ${p.duration} ${p.delay} ease-in forwards`,
        }} />
      ))}
    </div>
  )
}

// ─── Completion Popup ─────────────────────────────────────────────────────────
function CompletionPopup({ tutorial, badge, onContinue, onBack }) {
  return (
    <>
      <Confetti />
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10001]" onClick={onContinue} />
      <div className="fixed inset-0 flex items-center justify-center z-[10001] p-6 pointer-events-none">
        <div
          className="card pointer-events-auto bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center gap-5 max-w-xs w-full text-center"
          style={{ animation: 'tutCompletePop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards' }}
        >
          <style>{`
            @keyframes tutCompletePop {
              from { transform: scale(0.4); opacity: 0; }
              to   { transform: scale(1);   opacity: 1; }
            }
            @keyframes tutorialFloat {
              0%, 100% { transform: translateY(0);    }
              50%       { transform: translateY(-8px); }
            }
          `}</style>

          {badge?.icon_url ? (
            <div style={{ animation: 'tutorialFloat 2.5s ease-in-out infinite' }}>
              <img src={badge.icon_url} alt={badge.title} className="w-24 h-24 object-contain drop-shadow-lg" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center">
              <Trophy className="w-10 h-10 text-yellow-500" />
            </div>
          )}

          <div className="flex flex-col items-center gap-1.5">
            <p className="text-xs font-bold text-blockly-purple uppercase tracking-widest">
              Tutorial Complete! 🎉
            </p>
            <h2 className="text-xl font-black text-gray-900">{tutorial?.title}</h2>
            {badge && (
              <p className="text-sm text-gray-500">
                You earned the <span className="font-semibold text-yellow-600">"{badge.title}"</span> badge!
              </p>
            )}
            {tutorial?.description && (
              <p className="text-xs text-slate-400 leading-relaxed">"{tutorial.description}"</p>
            )}
          </div>

          <div className="flex flex-col gap-2 w-full mt-1">
            <button
              onClick={onContinue}
              className="w-full btn py-2.5 text-sm font-semibold text-gray-600 bg-gray-200 hover:bg-gray-300 transition-colors"
            >
              Keep Exploring
            </button>
            <button
              onClick={onBack}
              className="w-full btn py-2.5 text-sm font-semibold text-white bg-blockly-purple hover:bg-blockly-purple/90 transition-colors"
            >
              Back to Lesson
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function TutorialViewer({ tutorialIdOverride = null, preview = false, onBack }) {
  const getTiming = useActivityTiming()
  const { tutorialId: routeTutorialId } = useParams()
  const tutorialId = tutorialIdOverride ?? routeTutorialId
  const navigate       = useNavigate()
  const handleBack     = onBack ?? (() => navigate(-1))
  const profile        = useAuthStore((s) => s.profile)
  const addToast       = useUIStore((s) => s.addToast)

  const [tutorial,       setTutorial]       = useState(null)
  const [steps,          setSteps]          = useState([])
  const stepsRef = useRef([])
  const [loading,        setLoading]        = useState(true)
  const [loadError,      setLoadError]      = useState(false)

  const [currentStep,    setCurrentStep]    = useState(0)
  const [showComplete,   setShowComplete]   = useState(false)
  const savedSubmissions = useRef([])
  const stepDrafts = useRef(new Map())
  const savingSubmission = useRef(false)

  const [stepFiles,      setStepFiles]      = useState([])
  const [activeFileId,   setActiveFileId]   = useState(null)

  const [filesWithCode,  setFilesWithCode]  = useState([])
  const [generatedCode,  setGeneratedCode]  = useState('')
  const [previewFileId,  setPreviewFileId]  = useState(null)
  const [responsive,     setResponsive]     = useState(true)
  const [selectedDevice, setSelectedDevice] = useState('desktop')

  // pendingLoad: undefined = nothing queued, null = clear ws, object = load state
  const [pendingLoad, setPendingLoad] = useState(undefined)
  const isLoadingRef = useRef(false)

  // ── Workspace hook — ALWAYS called, never conditionally ───────────────────
  const workspace = BlocklyWorkspace({
    filename: stepFiles.find(f => f.id === activeFileId)?.filename || 'index.html',
    initialPalette: 'lesson',
    lessonBlocks: lessonBlockTypes(steps[currentStep]),
    onWorkspaceChange: (wsRef) => {
      if (isLoadingRef.current) return
      const file = stepFiles.find((f) => f.id === activeFileId)
      if (!file) return
      const code = codeGeneratorService.generateCode(wsRef, file.filename)
      setFilesWithCode((prev) => {
        const exists = prev.find((f) => f.id === file.id)
        if (exists) return prev.map((f) => f.id === file.id ? { ...f, generatedCode: code } : f)
        return [...prev, { id: file.id, filename: file.filename, generatedCode: code }]
      })
    },
    onWorkspaceLoad: () => {
      if (stepFiles.length > 0) defineFileReferenceBlocks(stepFiles)
    },
  })

  // ── Drain pending workspace load once Blockly is initialised ──────────────
  // This effect is the KEY fix: workspace.isInitialized is React state, so
  // when it flips from false → true this effect re-fires with the latest
  // pendingLoad value, even if data arrived before Blockly was ready.
  useEffect(() => {
    if (!workspace.isInitialized || pendingLoad === undefined) return
    isLoadingRef.current = true
    if (pendingLoad) {
      workspace.loadWorkspaceState(pendingLoad)
    } else {
      workspace.clearWorkspace()
    }
    setPendingLoad(undefined)
    setTimeout(() => { isLoadingRef.current = false }, 200)
  }, [workspace.isInitialized, pendingLoad])

  // ── Load tutorial data ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!tutorialId) return
    ;(async () => {
      setLoading(true)
      setLoadError(false)
      try {
        const tut = await fetchTutorialById(tutorialId)
        savedSubmissions.current = []
        stepDrafts.current.clear()
        setTutorial(tut)

        const sorted = (tut.tutorial_steps || []).sort(
          (a, b) => (a.order_index ?? a.step_order ?? 0) - (b.order_index ?? b.step_order ?? 0)
        )
        setSteps(sorted)
        stepsRef.current = sorted

        let startStep = 0
        if (!preview && profile?.id) {
          savedSubmissions.current = await getOwnSubmissions(tut.lesson_id)
          if (!savedSubmissions.current.some(submission => submission.is_final)) {
            // Resume at the first unsaved step, independent of resubmission timestamps.
            const nextIndex = sorted.findIndex(step => !savedSubmissions.current.some(item => item.step_key === step.id && item.validation_digest === step.validation_revision))
            startStep = nextIndex < 0 ? Math.max(0, sorted.length - 1) : nextIndex
          }
        }

        setCurrentStep(startStep)
        if (sorted.length > 0) {
          applyStepFiles(sorted[startStep] ?? sorted[0])
        }
      } catch (err) {
        console.error(err)
        setLoadError(true)
        addToast('Failed to load tutorial', 'error')
      } finally {
        setLoading(false)
      }
    })()
  }, [tutorialId, profile?.id])

  // ── Re-register file reference blocks when stepFiles change ───────────────
  useEffect(() => {
    if (workspace.isInitialized && stepFiles.length > 0) {
      defineFileReferenceBlocks(stepFiles)
    }
  }, [stepFiles, workspace.isInitialized])

  // ── Recompute combined preview code ───────────────────────────────────────
  useEffect(() => {
    if (filesWithCode.length === 0 || stepFiles.length === 0) return
    const previewFile = stepFiles.find((f) => f.id === previewFileId) ?? stepFiles[0]
    const combined = codeGeneratorService.combineFilesForPreview(
      filesWithCode,
      previewFile?.filename
    )
    setGeneratedCode(combined)
  }, [filesWithCode, previewFileId, stepFiles])

  // ── Set up files for a step, queue workspace load ─────────────────────────
  const applyStepFiles = useCallback((step) => {
    if (!step) return

    const rawFiles = resolveStudentStepFiles(step, stepsRef.current, savedSubmissions.current, stepDrafts.current)
    defineFileReferenceBlocks(rawFiles)
    const files = rawFiles
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
      .map(file => dbFileToTab({ ...file, id: file.id ?? `${step.id}-${file.filename}` }))

    if (files.length === 0) {
      files.push({ id: `empty-${step.id}`, filename: 'index.html', blocks_json: null })
    }

    setStepFiles(files)
    setFilesWithCode(files.map((f) => ({ id: f.id, filename: f.filename, generatedCode: f.code ?? '' })))

    const firstHtml = files.find((f) => f.filename.endsWith('.html')) ?? files[0]
    setActiveFileId(firstHtml?.id ?? null)
    setPreviewFileId(firstHtml?.id ?? null)

    // Queue the workspace state — the drain effect handles it once Blockly is ready
    setPendingLoad(firstHtml?.blocks_json ?? null)
  }, [])

  // ── File tab switch ────────────────────────────────────────────────────────
  const snapshotFiles = () => stepFiles.map(file => ({
    ...file,
    blocks_json: tutorial?.type === 'text' ? null : file.id === activeFileId ? workspace.getWorkspaceState?.() ?? null : file.blocks_json ?? { blocks: { blocks: [] } },
    code: tutorial?.type === 'text' ? file.code ?? '' : file.id === activeFileId && workspace.getWorkspace() ? codeGeneratorService.generateCode(workspace.getWorkspace(), file.filename) : file.blocks_json ? codeGeneratorService.generateCodeFromState(file.blocks_json, file.filename) : '',
  }))

  const rememberDraft = () => {
    if (steps[currentStep]) stepDrafts.current.set(steps[currentStep].id, snapshotFiles())
  }

  const handleFileChange = (fileId) => {
    if (fileId === activeFileId) return
    const flushed = snapshotFiles()
    setStepFiles(flushed)
    setActiveFileId(fileId)
    const file = flushed.find((f) => f.id === fileId)
    if (!file) return
    isLoadingRef.current = true
    if (file.blocks_json) {
      workspace.loadWorkspaceState(file.blocks_json)
    } else {
      workspace.clearWorkspace()
    }
    setTimeout(() => { isLoadingRef.current = false }, 150)
    if (file.filename.endsWith('.html')) setPreviewFileId(fileId)
  }

  // ── Progress persistence ───────────────────────────────────────────────────
  const saveProgress = async (isCompleted = false) => {
    rememberDraft()
    if (preview) {
      await tutorialAction({ action: 'check', lessonId: tutorial.lesson_id, stepId: steps[currentStep].id, files: snapshotFiles() })
      return
    }
    if (!profile?.id) throw new Error('Sign in to submit your tutorial.')
    const snapshot = snapshotFiles().map(({ filename, code, blocks_json }) => ({ filename, code, blocks_json }))
    const saved = await saveTutorialSubmission({ lessonId: tutorial.lesson_id, stepId: steps[currentStep].id, files: snapshot, finish: isCompleted, ...getTiming() })
    savedSubmissions.current = [...savedSubmissions.current.filter(item => item.id !== saved.id), saved]
    stepDrafts.current.set(steps[currentStep].id, saved.files)
  }
  // ── Step navigation ────────────────────────────────────────────────────────
  const validateCurrentStep = () => {
    try {
      const expected = (steps[currentStep]?.expected ?? []).map(solution => tutorial?.type !== 'block' || solution.expected_blocks_json == null ? solution : {
        ...solution, expected_code: codeGeneratorService.generateCodeFromState(solution.expected_blocks_json, solution.filename),
      })
      const result = validateTutorialStep({ files: snapshotFiles(), expected, mode: tutorial?.type, fileDefinitions: tutorial?.type === 'text' ? tutorial.text_tutorial_step_files ?? [] : tutorial?.block_tutorial_step_files ?? [] })
      if (!result.passed) addToast(result.failures.join(' • '), 'error')
      return result.passed
    } catch (error) {
      addToast(error.message || 'Could not read the current workspace.', 'error')
      return false
    }
  }

  const handleNext = async () => {
    if (savingSubmission.current || !validateCurrentStep()) return
    const next = currentStep + 1
    if (next >= steps.length) return
    savingSubmission.current = true
    try {
      await saveProgress()
      setCurrentStep(next)
      applyStepFiles(steps[next])
    } catch (error) { addToast(error.message || 'Could not save your work.', 'error') }
    finally { savingSubmission.current = false }
  }

  const handlePrev = () => {
    if (savingSubmission.current) return
    const prev = currentStep - 1
    if (prev < 0) return
    rememberDraft()
    setCurrentStep(prev)
    applyStepFiles(steps[prev])
  }

  const handleFinish = async () => {
    if (savingSubmission.current || !validateCurrentStep()) return
    savingSubmission.current = true
    try {
      await saveProgress(true)
      setShowComplete(true)
    } catch (error) { addToast(error.message || 'Could not submit your tutorial.', 'error') }
    finally { savingSubmission.current = false }
  }
  // ── Preview helpers ────────────────────────────────────────────────────────
  const runCode = () => {
    if (tutorial?.type === 'text') return
    const file = stepFiles.find((f) => f.id === activeFileId)
    if (file && workspace.getWorkspace()) {
      const code = codeGeneratorService.generateCode(workspace.getWorkspace(), file.filename)
      setFilesWithCode((prev) =>
        prev.map((f) => f.id === activeFileId ? { ...f, generatedCode: code } : f)
      )
    }
  }

  const getHtmlFilesList   = () => stepFiles.filter((f) => f.filename.endsWith('.html')).map((f) => ({ id: f.id, filename: f.filename }))
  const getCurrentFileName = () => stepFiles.find((f) => f.id === activeFileId)?.filename || ''
  const getCurrentFileCode = () => filesWithCode.find((f) => f.id === activeFileId)?.generatedCode || ''
  const getPreviewFileName = () => stepFiles.find((f) => f.id === previewFileId)?.filename || ''

  useRemiHighlight(workspace.getWorkspace, steps[currentStep]?.highlight_category_path, steps[currentStep]?.highlight_block_type, workspace.isInitialized)

  const badge          = tutorial?.badges?.[0] ?? null
  const difficultyMeta = DIFFICULTY_META[tutorial?.difficulty_level] ?? DIFFICULTY_META.beginner

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  //
  // Keep the workspace div mounted while lesson data loads.
  //     Blockly.inject() fires once on mount into that div. If the div is not
  //     in the DOM at that point, the workspace never initialises.
  //     Use position:absolute overlays for loading / error states instead.
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="relative flex flex-col h-screen bg-gray-100 overflow-hidden">

      {/* ── Loading overlay (sits on top, never unmounts the editor) ─── */}
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blockly-purple" />
            <p className="text-sm text-gray-400 font-medium">Loading tutorial…</p>
          </div>
        </div>
      )}

      {/* ── Error overlay ────────────────────────────────────────────── */}
      {!loading && loadError && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-white/95">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <p className="text-gray-600 font-semibold">Tutorial not found.</p>
          <button
            onClick={handleBack}
            className="text-sm text-blockly-purple hover:underline font-medium"
          >
            Go back
          </button>
        </div>
      )}

      {/* ── Top bar ──────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-2.5 ">
        <Link to="/"><img src="/icon.png" alt="icon" className="w-8 h-8" /></Link>
        <BackButton />

        <span className="text-gray-300 select-none">|</span>
        {preview && <span className="text-xs text-amber-700">Preview · Progress is not saved</span>}

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-sm font-black text-gray-800 truncate">
            {tutorial?.title ?? '…'}
          </span>
          {tutorial && (
            <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${difficultyMeta.color}`}>
              {difficultyMeta.label}
            </span>
          )}
          {tutorial?.estimated_time_minutes && (
            <span className="shrink-0 flex items-center gap-1 text-[10px] text-gray-400 font-semibold">
              <Clock size={11} /> {tutorial.estimated_time_minutes}m
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-gray-400 font-semibold tabular-nums">
            {currentStep + 1} / {Math.max(steps.length, 1)}
          </span>
          <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blockly-purple rounded-full transition-all duration-500"
              style={{ width: `${steps.length ? ((currentStep + 1) / steps.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Editor body ──────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden px-3 gap-1.5 mb-4">

        {/* Blockly workspace — blocklyDiv MUST always be in the DOM */}
        <div className="flex flex-col md:w-2/3 h-full overflow-hidden bg-white rounded shadow border border-border">
          <FileTabs
            files={stepFiles}
            activeFile={activeFileId}
            isLocal={false}
            onFileChange={handleFileChange}
            onFileCreate={() => {}}
            onFileDelete={() => {}}
          />
          {/* ⚠️ This div is what Blockly injects into. Always render it. */}
          {tutorial?.type !== 'text' && <WorkspaceTools workspace={workspace} />}
          <div ref={workspace.blocklyDiv} className={`blocklyDiv flex-1 ${tutorial?.type === 'text' ? 'hidden' : ''}`} />
          {tutorial?.type === 'text' && <textarea aria-label={`Code for ${getCurrentFileName()}`} spellCheck={false} className="flex-1 resize-none p-4 font-mono text-sm" value={stepFiles.find(file => file.id === activeFileId)?.code ?? ''} onChange={event => {
            const code = event.target.value
            setStepFiles(files => files.map(file => file.id === activeFileId ? { ...file, code } : file))
            setFilesWithCode(files => files.map(file => file.id === activeFileId ? { ...file, generatedCode: code } : file))
          }} />}
        </div>

        {/* Preview pane */}
        <div className="flex-1 h-full overflow-hidden">
          <PreviewPane
            storageScope={`tutorial:${tutorial?.id || 'preview'}`}
            generatedCode={generatedCode}
            currentFileCode={getCurrentFileCode()}
            currentFileName={getCurrentFileName()}
            previewFileName={getPreviewFileName()}
            htmlFiles={getHtmlFilesList()}
            onRunCode={runCode}
            onNavigateToFile={(filename) => {
              const f = stepFiles.find((f) => f.filename === filename)
              if (f) setPreviewFileId(f.id)
            }}
            responsive={responsive}
            selectedDevice={selectedDevice}
            onToggleResponsive={() => setResponsive((r) => !r)}
            onSelectDevice={setSelectedDevice}
          />
        </div>
      </div>

      {/* ── Floating character guide ──────────────────────────────────── */}
      {!loading && !loadError && !showComplete && steps.length > 0 && (
        <TutorialCharacterGuide
          steps={steps}
          currentStep={currentStep}
          tutorialTitle={tutorial?.title ?? ''}
          onNext={handleNext}
          onPrev={handlePrev}
          onFinish={handleFinish}
        />
      )}

      {/* ── Completion popup ─────────────────────────────────────────── */}
      {showComplete && (
        <CompletionPopup
          tutorial={tutorial}
          badge={badge}
          onContinue={() => setShowComplete(false)}
          onBack={handleBack}
        />
      )}
    </div>
  )
}
