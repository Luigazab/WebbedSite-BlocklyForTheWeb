import { supabase } from '../../supabaseClient'
import WorkspaceTools from '@/components/editor/WorkspaceTools'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router'
import BlocklyWorkspace from '../editor/BlocklyWorkspace'
import PreviewPane from '../editor/PreviewPane'
import FileTabs from '../editor/FileTabs'
import { useProject } from '#hooks/useProject'
import { useProjectFiles } from '../../hooks/useProjectFiles'
import { codeGeneratorService } from '../../services/codeGenerator.service'
import { zipExportService } from '../../services/zipExport.service'
import { defineFileReferenceBlocks } from '../../blockly/fileReferenceBlocks'
import { localProjectFilesService } from '../../services/localProjectFiles.service'
import SaveModal from '../editor/SaveModal'
import LoadModal from '../editor/LoadModal'
import EditorHeader from '../layout/EditorHeader'
import { useAuthStore } from '../../store/authStore'
import { useWebsiteThumbnail } from '../../hooks/useWebsiteThumbnail'
import EditorTour, { useAutoStartEditorTour } from '../tour/EditorTour'
import { toast } from 'sonner'
import * as Blockly from 'blockly/core'
import { Play, GripVertical } from 'lucide-react'

const BlockEditor = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const location = useLocation()
  const fileInputRef = useRef(null)
  const pendingProjectRef = useRef(null)
  const savingProjectRef = useRef(false)

  const [mobileTab, setMobileTab] = useState('editor') // 'instructions' | 'editor' | 'preview'

  const containerRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [workspaceWidth, setWorkspaceWidth] = useState(() => {
    const saved = localStorage.getItem('editor_split_percent')
    return saved ? parseFloat(saved) : 60 // Default 60%
  })

  const [projectTitle, setProjectTitle] = useState(location.state?.projectTitle ?? 'Untitled')
  const [generatedCode, setGeneratedCode] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [currentProjectId, setCurrentProjectId] = useState(null)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showLoadModal, setShowLoadModal] = useState(false)
  const [responsive, setResponsive] = useState(true)
  const [selectedDevice, setSelectedDevice] = useState('desktop')
  const [initialWorkspaceState, setInitialWorkspaceState] = useState(null)
  const [filesWithCode, setFilesWithCode] = useState([])
  const [textDrafts, setTextDrafts] = useState({})
  const [activePreviewFile, setActivePreviewFile] = useState(null)
  
  const isLoadingRef = useRef(false)
  const { saveThumbnail } = useWebsiteThumbnail()
  
  const { projects, fetchProjects, fetchProject, handleCreateProject, handleUpdateProject, handleDeleteProject: removeProjectFromDb } = useProject()
  const { files, activeFile, isLocal, saveFile, deleteFile, setActiveFile, createFile, migrateLocalFilesToDb } = useProjectFiles(id || currentProjectId)

  const workspace = BlocklyWorkspace({
    filename: files.find(f => f.id === activeFile)?.filename || 'index.html',
    initialWorkspaceState,
    onWorkspaceChange: (workspaceRef) => {
      if (isLoadingRef.current) return
      
      const file = files.find(f => f.id === activeFile)
      if (!file || (file.blocks_json == null && file.code != null)) return
      
      const code = codeGeneratorService.generateCode(workspaceRef, file.filename)
      updateFileCode(activeFile, code)
    },
    onWorkspaceLoad: () => {
      defineFileReferenceBlocks(files)
    }
  })

  // ── Drag & Resize Handlers ─────────────────────────────────────────────
  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const newPercent = ((e.clientX - rect.left) / rect.width) * 100
    
    // Clamp width between 20% and 80%
    const clamped = Math.min(Math.max(newPercent, 20), 80)
    setWorkspaceWidth(clamped)

    const ws = workspace.getWorkspace()
    if (ws) {
      Blockly.svgResize(ws)
    }
  }, [isDragging, workspace])

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      localStorage.setItem('editor_split_percent', workspaceWidth.toString())
      const ws = workspace.getWorkspace()
      if (ws) {
        Blockly.svgResize(ws)
      }
    }
  }, [isDragging, workspaceWidth, workspace])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  // Resize Blockly whenever switching tabs or window size changes
  const handleTabSwitch = useCallback((tab) => {
    setMobileTab(tab)
    if (tab === 'editor' && workspace.getWorkspace()) {
      setTimeout(() => {
        const ws = workspace.getWorkspace()
        if (ws) Blockly.svgResize(ws)
      }, 50)
    }
  }, [workspace])

  useEffect(() => {
    const handleResize = () => {
      const ws = workspace.getWorkspace()
      if (ws) Blockly.svgResize(ws)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [workspace])

  useEffect(() => {
    if (id && id !== currentProjectId) setCurrentProjectId(id)
  }, [id])

  useEffect(() => {
    if (!id) return
    fetchProject(id).then((project) => {
      if (project) {
        setProjectTitle(project.title)
        setProjectDescription(project.description || '')
      }
    })
  }, [id])

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    if (workspace.isInitialized && files.length > 0) {
      defineFileReferenceBlocks(files)
    }
  }, [files, workspace.isInitialized])

  useEffect(() => {
    if (activeFile && files.length > 0) {
      const file = files.find(f => f.id === activeFile)
      if (file) {
        if (file.filename.endsWith('.html')) {
          setActivePreviewFile(activeFile)
        } else if (!activePreviewFile) {
          const indexFile = files.find(f => f.filename === 'index.html')
          const firstHtmlFile = files.find(f => f.filename.endsWith('.html'))
          setActivePreviewFile(indexFile?.id || firstHtmlFile?.id || null)
        }
      }
    }
  }, [activeFile, files])

  useEffect(() => {
    if (!activeFile || !workspace.isInitialized || files.length === 0) return
    
    const file = files.find(f => f.id === activeFile)
    if (!file) return
    if (file.blocks_json == null && file.code != null) { updateFileCode(file.id, textDrafts[file.id] ?? file.code); return }

    isLoadingRef.current = true

    workspace.clearWorkspace()
    workspace.loadWorkspaceState(file.blocks_json)
    
    const code = codeGeneratorService.generateCode(workspace.getWorkspace(), file.filename)
    updateFileCode(activeFile, code)

    setTimeout(() => {
      isLoadingRef.current = false
    }, 100)
  }, [activeFile, workspace.isInitialized])

  useEffect(() => {
    if (filesWithCode.length > 0 && activePreviewFile) {
      const previewFile = files.find(f => f.id === activePreviewFile)
      const combined = codeGeneratorService.combineFilesForPreview(filesWithCode, previewFile?.filename)
      setGeneratedCode(combined)
    }
  }, [filesWithCode, activePreviewFile, files])

  useEffect(() => {
    setFilesWithCode(prev => {
      const updated = files.map(file => ({
        id: file.id,
        filename: file.filename,
        generatedCode: prev.find(f => f.id === file.id)?.generatedCode ?? (file.blocks_json ? codeGeneratorService.generateCodeFromState(file.blocks_json, file.filename) : file.code ?? '')
      }))
      return updated
    })
  }, [files])

  const updateFileCode = (fileId, code) => {
    setFilesWithCode(prev => {
      const existing = prev.find(f => f.id === fileId)
      const file = files.find(f => f.id === fileId)
      
      if (existing) {
        return prev.map(f => f.id === fileId ? { ...f, generatedCode: code } : f)
      } else if (file) {
        return [...prev, { id: fileId, filename: file.filename, generatedCode: code }]
      }
      return prev
    })
  }

  const saveActiveFile = async () => {
    const file = files.find(f => f.id === activeFile)
    if (!file) return
    if (file.blocks_json == null && file.code != null) {
      const { error } = await supabase.from('project_files').update({ code: textDrafts[file.id] ?? file.code }).eq('id', file.id)
      if (error) throw error
    } else await saveFile(currentProjectId, activeFile, workspace.getWorkspaceState())
  }

  const runCode = () => {
    const file = files.find(f => f.id === activeFile)
    if (file && file.blocks_json == null && file.code != null) { updateFileCode(file.id, textDrafts[file.id] ?? file.code); return }
    if (file && workspace.getWorkspace()) {
      const code = codeGeneratorService.generateCode(workspace.getWorkspace(), file.filename)
      updateFileCode(activeFile, code)
    }
  }

  const handleMobileRunAndPreview = () => {
    runCode()
    handleTabSwitch('preview')
  }

  const handleFileChange = async (fileId) => {
    if (!activeFile || fileId === activeFile) return
    try {
      await saveActiveFile()
      setActiveFile(fileId)
    } catch (error) {
      console.error('Error switching files:', error)
      toast.error('Error switching files')
    }
  }

  const handleCreateFile = async (filename) => {
    try {
      if (activeFile) await saveActiveFile()
      await createFile(currentProjectId, filename)
      toast.success(`Created ${filename}`)
    } catch (error) {
      toast.error(error.message || 'Error creating file')
    }
  }

  const handleDeleteFile = async (fileId) => {
    try {
      await deleteFile(fileId, currentProjectId)
      setFilesWithCode(prev => prev.filter(f => f.id !== fileId))
      toast.info('File deleted')
    } catch (error) {
      toast.error(error.message || 'Error deleting file')
    }
  }

  const handleSaveToAccount = async ({ title, description }) => {
    if (savingProjectRef.current) return
    savingProjectRef.current = true
    const savingToast = toast.loading('Saving project and website screenshot…')
    try {
      const snapshotFiles = files.map(file => ({
        ...file,
        generatedCode: file.blocks_json == null && file.code != null
          ? (textDrafts[file.id] ?? file.code)
          : file.id === activeFile
            ? codeGeneratorService.generateCode(workspace.getWorkspace(), file.filename)
            : codeGeneratorService.generateCodeFromState(file.blocks_json, file.filename),
      }))
      const websiteHtml = codeGeneratorService.combineFilesForPreview(snapshotFiles, 'index.html')
      if (activeFile) {
        await saveActiveFile()
      }

      let projectIdToUse = currentProjectId

      if (!currentProjectId) {
        const savedProject = pendingProjectRef.current ?? await handleCreateProject({ title, description, type: 'block' })
        pendingProjectRef.current = savedProject
        projectIdToUse = savedProject.id

        if (isLocal) {
          await migrateLocalFilesToDb(savedProject.id)
          toast.success('Local files migrated to your account')
        }

        setCurrentProjectId(savedProject.id)
        setProjectTitle(title)
        setProjectDescription(description)
        pendingProjectRef.current = null
      } else {
        await handleUpdateProject(currentProjectId, { title, description })
        setProjectTitle(title)
        setProjectDescription(description)
        projectIdToUse = currentProjectId
      }

      setShowSaveModal(false)
      try {
        await saveThumbnail(websiteHtml, projectIdToUse)
        toast.success('Project and website screenshot saved', { id: savingToast })
      } catch (err) {
        console.error('Thumbnail save failed:', err)
        toast.warning(`Project saved, but its screenshot failed: ${err.message}`, { id: savingToast })
      }
      await fetchProjects()
      if (!currentProjectId) navigate(`/${profile?.role}/editor/${projectIdToUse}`, { replace: true })
    } catch (error) {
      console.error('Save error:', error)
      toast.error(error.message || 'Failed to save project', { id: savingToast })
    } finally {
      savingProjectRef.current = false
    }
  }

  const handleExportZip = async () => {
    if (filesWithCode.length === 0) {
      toast.error('No files to export')
      return
    }
    try {
      await zipExportService.exportProjectAsZip(projectTitle, projectDescription, filesWithCode)
      toast.success('Project exported as ZIP!')
    } catch (error) {
      toast.error(error.message || 'Failed to export ZIP')
    }
  }

  const handleExportHTML = () => {
    if (!generatedCode) {
      toast.error('No code to export')
      return
    }
    const blob = new Blob([generatedCode], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${projectTitle || 'website'}.html`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('HTML file downloaded!')
  }

  const handleExportJSON = () => {
    const workspaceState = workspace.getWorkspaceState()
    if (!workspaceState) {
      toast.error('No workspace to export')
      return
    }
    const dataToSave = {
      title: projectTitle,
      description: projectDescription,
      blocks_json: workspaceState,
      timestamp: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${projectTitle || 'blockly-project'}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Blockly project exported!')
  }

  const handleLoadFromDevice = () => fileInputRef.current?.click()

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result)
        if (!data.blocks_json) {
          toast.error('Invalid project file format')
          return
        }
        setProjectTitle(data.title || 'Loaded Project')
        setProjectDescription(data.description || '')
        setCurrentProjectId(null)
        setInitialWorkspaceState(data.blocks_json)
        toast.success(`Loaded "${data.title || 'project'}" from device`)
      } catch (error) {
        toast.error(error.message || 'Failed to parse project file')
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  const handleLoadProject = (project) => {
    setProjectTitle(project.title)
    setProjectDescription(project.description || '')
    setCurrentProjectId(project.id)
    navigate(`/${profile?.role}/editor/${project.id}`)
    toast.success(`Loaded "${project.title}"`)
  }

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return
    try {
      await removeProjectFromDb(projectId)
      if (currentProjectId === projectId) handleCreateNew()
      fetchProjects()
    } catch (error) {
      toast.error(error.message || 'Could not delete project')
    }
  }

  const handleCreateNew = () => {
    if (currentProjectId || files.some(f => f.blocks_json?.blocks?.blocks?.length > 0)) {
      if (window.confirm('Create a new project? Any unsaved changes will be lost.')) {
        workspace.clearWorkspace()
        setProjectTitle('Untitled')
        setProjectDescription('')
        setCurrentProjectId(null)
        setInitialWorkspaceState(null)
        setFilesWithCode([])
        localProjectFilesService.clearLocalFiles()
        navigate(`/${profile?.role}/editor`, { replace: true })
        toast.info('New project started')
      }
    } else {
      workspace.clearWorkspace()
      setProjectTitle('Untitled')
      setProjectDescription('')
      setCurrentProjectId(null)
      setInitialWorkspaceState(null)
      setFilesWithCode([])
      toast.info('Ready for new project')
    }
  }

  const getCurrentFileCode = () => {
    if (!activeFile) return ''
    const fileData = filesWithCode.find(f => f.id === activeFile)
    return fileData?.generatedCode || ''
  }

  const getCurrentFileName = () => {
    if (!activeFile) return ''
    const file = files.find(f => f.id === activeFile)
    return file?.filename || ''
  }

  const getHtmlFilesList = () => {
    return files.filter(f => f.filename.endsWith('.html')).map(f => ({ id: f.id, filename: f.filename }))
  }

  const handleNavigateToFile = (filename) => {
    const targetFile = files.find(f => f.filename === filename)
    if (targetFile) setActivePreviewFile(targetFile.id)
  }

  const getPreviewFileName = () => {
    if (!activePreviewFile) return ''
    const file = files.find(f => f.id === activePreviewFile)
    return file?.filename || ''
  }

  useAutoStartEditorTour()

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden select-none">
      <EditorHeader
        onNew={handleCreateNew}
        onSave={() => setShowSaveModal(true)}
        onLoad={() => setShowLoadModal(true)}
        projectTitle={projectTitle}
      />
      <nav aria-label="Learning panels" role="tablist" className="flex items-center gap-2 border-b border-border bg-card px-3 md:hidden shrink-0">
        <div className="flex min-w-0 flex-1">
          <button
            type="button"
            role="tab"
            aria-selected={mobileTab === 'instructions'}
            onClick={() => handleTabSwitch('instructions')}
            className={`flex-1 border-b-2 px-2 py-3 text-xs font-semibold ${mobileTab === 'instructions' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
          >
            Instructions
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mobileTab === 'editor'}
            onClick={() => handleTabSwitch('editor')}
            className={`flex-1 border-b-2 px-2 py-3 text-xs font-semibold ${mobileTab === 'editor' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
          >
            Editor
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mobileTab === 'preview'}
            onClick={() => handleTabSwitch('preview')}
            className={`flex-1 border-b-2 px-2 py-3 text-xs font-semibold ${mobileTab === 'preview' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
          >
            Preview
          </button>
        </div>

        {mobileTab === 'editor' && (
          <button
            onClick={handleMobileRunAndPreview}
            className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-md bg-emerald-600 text-white shadow active:scale-95 transition-transform"
          >
            <Play className="size-3 fill-current" />
            Run & View
          </button>
        )}
      </nav>

      <div
        ref={containerRef}
        style={{ '--workspace-width': `${workspaceWidth}%` }}
        className="flex flex-col px-1 pb-1.5 gap-0 md:px-3 md:flex-row flex-1 min-h-0 overflow-hidden relative"
      >
        <section className={`${mobileTab === 'instructions' ? 'flex' : 'hidden'} flex-1 flex-col overflow-y-auto rounded border border-border bg-card p-4 md:hidden`} aria-label="Project instructions">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Project instructions</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{projectDescription || 'No instructions were added for this project.'}</p>
          <button type="button" onClick={() => handleTabSwitch('editor')} className="mt-5 self-start rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Open editor</button>
        </section>

        {isDragging && (
          <div className="fixed inset-0 z-50 cursor-col-resize select-none bg-transparent" />
        )}

        <div
          className={`flex-col h-full rounded shadow border border-border bg-card overflow-hidden transition-none min-w-0 ${
            mobileTab === 'editor'
              ? 'flex flex-2/5 w-full md:flex-none md:w-[var(--workspace-width)]'
              : 'hidden md:flex md:flex-none md:w-[var(--workspace-width)]'
          }`}
        >
          <FileTabs
            files={files}
            activeFile={activeFile}
            isLocal={isLocal}
            onFileChange={handleFileChange}
            onFileCreate={handleCreateFile}
            onFileDelete={handleDeleteFile}
          />
          {!(files.find(f => f.id === activeFile)?.blocks_json == null && files.find(f => f.id === activeFile)?.code != null) && (
            <WorkspaceTools workspace={workspace} />
          )}

          <div
            ref={workspace.blocklyDiv}
            className={`blocklyDiv flex-1 min-h-0 w-full relative ${
              files.find(f => f.id === activeFile)?.blocks_json == null && files.find(f => f.id === activeFile)?.code != null
                ? 'hidden'
                : ''
            }`}
          />

          {files.find(f => f.id === activeFile)?.blocks_json == null && files.find(f => f.id === activeFile)?.code != null && (
            <textarea
              aria-label={`Source for ${getCurrentFileName()}`}
              spellCheck={false}
              className="flex-1 min-h-0 resize-none p-4 font-mono text-sm outline-none bg-card text-foreground"
              value={textDrafts[activeFile] ?? files.find(f => f.id === activeFile)?.code ?? ''}
              onChange={(e) => {
                setTextDrafts(prev => ({ ...prev, [activeFile]: e.target.value }))
                updateFileCode(activeFile, e.target.value)
              }}
            />
          )}
        </div>

        <div
          onMouseDown={() => setIsDragging(true)}
          onDoubleClick={() => {
            setWorkspaceWidth(60) // Double click resets to 60/40
            localStorage.setItem('editor_split_percent', '60')
            setTimeout(() => {
              const ws = workspace.getWorkspace()
              if (ws) Blockly.svgResize(ws)
            }, 50)
          }}
          title="Drag to resize, double-click to reset"
          className="hidden md:flex items-center justify-center w-3 hover:w-3 cursor-col-resize group shrink-0 transition-all select-none z-10"
        >
          <div
            className={`w-1 h-12 rounded-full transition-colors flex items-center justify-center ${
              isDragging ? 'bg-primary h-20' : 'bg-border group-hover:bg-primary/70'
            }`}
          >
            <GripVertical className="size-3 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div
          className={`h-full overflow-hidden flex-1 min-w-0 ${
            mobileTab === 'preview' ? 'flex flex-col w-full' : 'hidden md:flex'
          }`}
        >
          <PreviewPane
            storageScope={id || currentProjectId || 'scratch'}
            generatedCode={generatedCode}
            currentFileCode={getCurrentFileCode()}
            currentFileName={getCurrentFileName()}
            previewFileName={getPreviewFileName()}
            htmlFiles={getHtmlFilesList()}
            onRunCode={runCode}
            onNavigateToFile={handleNavigateToFile}
            responsive={responsive}
            selectedDevice={selectedDevice}
            onToggleResponsive={() => setResponsive(!responsive)}
            onSelectDevice={setSelectedDevice}
          />
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileSelect} className="hidden" />

      <SaveModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSaveToAccount={handleSaveToAccount}
        onExportHTML={handleExportHTML}
        onExportJSON={handleExportJSON}
        onExportZip={handleExportZip}
        isNewProject={!currentProjectId}
        initialTitle={projectTitle}
        initialDescription={projectDescription}
      />

      <LoadModal
        isOpen={showLoadModal}
        onClose={() => setShowLoadModal(false)}
        projects={projects}
        onLoadProject={handleLoadProject}
        onDeleteProject={handleDeleteProject}
        onLoadFromDevice={handleLoadFromDevice}
      />
      <EditorTour />
    </div>
  )
}

export default BlockEditor
