import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router'
import BlocklyWorkspace from '../editor/BlocklyWorkspace'
import PreviewPane from '../editor/PreviewPane'
import FileTabs from '../editor/FileTabs'
import { useProjectDatabase } from '../../hooks/useProjectDatabase'
import { useProjectFiles } from '../../hooks/useProjectFiles'
import { codeGeneratorService } from '../../services/codeGenerator.service'
import { zipExportService } from '../../services/zipExport.service'
import { defineFileReferenceBlocks } from '../../blockly/fileReferenceBlocks'
import { localProjectFilesService } from '../../services/localProjectFiles.service'
import SaveModal from '../editor/SaveModal'
import LoadModal from '../editor/LoadModal'
import EditorHeader from '../layout/EditorHeader'
import { useAuthStore } from '../../store/authStore'
import { useUIStore } from '../../store/uiStore'
import { useBlocklyThumbnail } from '../../hooks/useBlocklyThumbnail'
import { projectService } from '../../services/project.service'
import EditorTour, { useAutoStartEditorTour } from '../tour/EditorTour'

const BlockEditor = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const addToast = useUIStore((s) => s.addToast)
  const location = useLocation()
  const fileInputRef = useRef(null)
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);

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
  const [activePreviewFile, setActivePreviewFile] = useState(null)
  
  const isLoadingRef = useRef(false)
  const lastSavedHtmlRef = useRef('');
  const { saveThumbnail, loading: thumbnailLoading, error: thumbnailError } = useBlocklyThumbnail();
  
  const { projects, loadUserProjects, saveProject, deleteProject } = useProjectDatabase()
  const { files, activeFile, isLocal, saveFile, deleteFile, setActiveFile, createFile, migrateLocalFilesToDb } = useProjectFiles(id || currentProjectId)

  const workspace = BlocklyWorkspace({
    initialWorkspaceState,
    onWorkspaceChange: (workspaceRef) => {
      if (isLoadingRef.current) return
      
      const file = files.find(f => f.id === activeFile)
      if (!file) return
      
      const code = codeGeneratorService.generateCode(workspaceRef, file.filename)
      updateFileCode(activeFile, code)
    },
    onWorkspaceLoad: () => {
      defineFileReferenceBlocks(files)
    }
  })

  useEffect(() => {
    if (id && id !== currentProjectId) setCurrentProjectId(id)
  }, [id])

  useEffect(() => {
    if (id && projects.length > 0) {
      const project = projects.find(p => p.id === id)
      if (project) {
        setProjectTitle(project.title)
        setProjectDescription(project.description || '')
      }
    }
  }, [id, projects])

  useEffect(() => {
    loadUserProjects()
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
    if (!file || !file.blocks_json) return

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
        generatedCode: prev.find(f => f.id === file.id)?.generatedCode || ''
      }));
      return updated;
    });
  }, [files]);


  useEffect(() => {
    if (!currentProjectId || filesWithCode.length === 0) return;

    const timer = setTimeout(async () => {
      // Use the same logic as preview to keep them in sync
      const previewFile = files.find(f => f.id === activePreviewFile);
      const targetFile = previewFile || 
                        files.find(f => f.filename === 'index.html') ||
                        files.find(f => f.filename.endsWith('.html')) ||
                        files[0];
      if (!targetFile) return;

      const combined = codeGeneratorService.combineFilesForPreview(
        filesWithCode,
        targetFile.filename
      );

      // Avoid saving identical content
      if (combined === lastSavedHtmlRef.current) return;

      try {
        await projectService.updateProjectGeneratedHtml(currentProjectId, combined);
        lastSavedHtmlRef.current = combined;
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [filesWithCode, currentProjectId, activePreviewFile, files]);

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

  const runCode = () => {
    const file = files.find(f => f.id === activeFile)
    if (file && workspace.getWorkspace()) {
      const code = codeGeneratorService.generateCode(workspace.getWorkspace(), file.filename)
      updateFileCode(activeFile, code)
    }
  }

  // ✅ SIMPLE: Just save and switch
  const handleFileChange = async (fileId) => {
    if (!activeFile || fileId === activeFile) return

    try {
      // Save current file
      const workspaceState = workspace.getWorkspaceState()
      await saveFile(currentProjectId, activeFile, workspaceState)
      
      // Switch to new file (this will trigger the load effect)
      setActiveFile(fileId)
    } catch (error) {
      console.error('Error switching files:', error)
      addToast('Error switching files', 'error')
    }
  }

  const handleCreateFile = async (filename) => {
    try {
      if (activeFile) {
        const workspaceState = workspace.getWorkspaceState()
        await saveFile(currentProjectId, activeFile, workspaceState)
      }
      await createFile(currentProjectId, filename)
      addToast(`Created ${filename}`, 'success')
    } catch (error) {
      addToast('Error creating file', 'error')
    }
  }

  const handleDeleteFile = async (fileId) => {
    try {
      await deleteFile(fileId, currentProjectId)
      setFilesWithCode(prev => prev.filter(f => f.id !== fileId))
      addToast('File deleted', 'info')
    } catch (error) {
      addToast('Error deleting file', 'error')
    }
  }

  const handleSaveToAccount = async ({ title, description }) => {
    try {
      if (activeFile) {
        const workspaceState = workspace.getWorkspaceState()
        await saveFile(currentProjectId, activeFile, workspaceState)
      }

      let projectIdToUse = currentProjectId;

      if (!currentProjectId) {
        const savedProject = await saveProject({
          title,
          description,
          workspaceState: { blocks: { languageVersion: 0, blocks: [] } },
          code: generatedCode,
          projectId: null
        })
        
        setCurrentProjectId(savedProject.id)
        setProjectTitle(title)
        setProjectDescription(description)
        projectIdToUse = savedProject.id; 
        
        if (isLocal) {
          await migrateLocalFilesToDb(savedProject.id)
          addToast('Local files migrated to your account', 'success')
        }
        
        navigate(`/${profile?.role}/editor/${savedProject.id}`, { replace: true })
      } else {
        await saveProject({
          title,
          description,
          workspaceState: { blocks: { languageVersion: 0, blocks: [] } },
          code: generatedCode,
          projectId: currentProjectId
        })
        
        setProjectTitle(title)
        setProjectDescription(description)
        projectIdToUse = currentProjectId;
      }
      
      setShowSaveModal(false)
      addToast(`Project "${title}" saved successfully!`, 'success')
      loadUserProjects()
      try {
        const result = await saveThumbnail(workspace.getWorkspace(), projectIdToUse);
        if (result) {
          addToast('Thumbnail saved', 'success');
        } else {
          addToast('Failed to save thumbnail', 'error');
        }
      } catch (err) {
        console.error('Thumbnail save failed:', err);
        addToast('Thumbnail save error', 'error');
      }
    } catch (error) {
      console.error('Save error:', error)
      addToast(error.message || 'Failed to save project', 'error')
    }
  }

  const handleExportZip = async () => {
    if (filesWithCode.length === 0) {
      addToast('No files to export', 'error')
      return
    }
    try {
      await zipExportService.exportProjectAsZip(projectTitle, projectDescription, filesWithCode)
      addToast('Project exported as ZIP!', 'success')
    } catch (error) {
      addToast('Failed to export ZIP', 'error')
    }
  }

  const handleExportHTML = () => {
    if (!generatedCode) {
      addToast('No code to export', 'error')
      return
    }
    const blob = new Blob([generatedCode], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${projectTitle || 'website'}.html`
    a.click()
    URL.revokeObjectURL(url)
    addToast('HTML file downloaded!', 'success')
  }

  const handleExportJSON = () => {
    const workspaceState = workspace.getWorkspaceState()
    if (!workspaceState) {
      addToast('No workspace to export', 'error')
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
    addToast('Blockly project exported!', 'success')
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
          addToast('Invalid project file format', 'error')
          return
        }
        setProjectTitle(data.title || 'Loaded Project')
        setProjectDescription(data.description || '')
        setCurrentProjectId(null)
        setInitialWorkspaceState(data.blocks_json)
        addToast(`Loaded "${data.title || 'project'}" from device`, 'success')
      } catch (error) {
        addToast('Failed to parse project file', 'error')
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
    addToast(`Loaded "${project.title}"`, 'success')
  }

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return
    try {
      await deleteProject(projectId)
      if (currentProjectId === projectId) handleCreateNew()
      addToast('Project deleted', 'info')
      loadUserProjects()
    } catch (error) {
      addToast('Error deleting project', 'error')
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
        addToast('New project started', 'info')
      }
    } else {
      workspace.clearWorkspace()
      setProjectTitle('Untitled')
      setProjectDescription('')
      setCurrentProjectId(null)
      setInitialWorkspaceState(null)
      setFilesWithCode([])
      addToast('Ready for new project', 'info')
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
  useAutoStartEditorTour
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('tour_editor_completed')
    if (!hasSeenTour) {
      setTimeout(() => startTour('editor'), 500)
    }
  }, [])

  return (
    <div className="flex flex-col h-screen">
      <EditorHeader
        onNew={handleCreateNew}
        onSave={() => setShowSaveModal(true)}
        onLoad={() => setShowLoadModal(true)}
        projectTitle={projectTitle}
      />
      
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        <div className="flex flex-col md:w-2/3 h-full border border-gray-600 bg-white overflow-hidden">
          <FileTabs
            files={files}
            activeFile={activeFile}
            isLocal={isLocal}
            onFileChange={handleFileChange}
            onFileCreate={handleCreateFile}
            onFileDelete={handleDeleteFile}
          />
          <div ref={workspace.blocklyDiv} className="blocklyDiv flex-1" />
        </div>
        
        <div className="flex-1 h-full overflow-hidden"> 
          <PreviewPane
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