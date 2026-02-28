// src/dashboards/student/pages/Editor.jsx (or wherever your BlockEditor is)
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router'
import { javascriptGenerator } from 'blockly/javascript'
import BlocklyWorkspace from '../editor/BlocklyWorkspace'
import PreviewPane from '../editor/PreviewPane'
import { useProjectDatabase } from '../../hooks/useProjectDatabase'
import SaveModal from '../editor/SaveModal'
import LoadModal from '../editor/LoadModal'
import CreateProjectModal from '../shared/CreateProjectModal'
import EditorHeader from '../layout/EditorHeader'
import { useAuthStore } from '../../store/authStore'
import { useUIStore } from '../../store/uiStore'


const BlockEditor = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const addToast = useUIStore((s) => s.addToast)
  const location = useLocation()
  const fileInputRef = useRef(null)

  const [projectTitle, setProjectTitle] = useState(
    location.state?.projectTitle ?? 'Untitled'
  )
  
  const [generatedCode, setGeneratedCode] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [currentProjectId, setCurrentProjectId] = useState(null)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showLoadModal, setShowLoadModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [responsive, setResponsive] = useState(true)
  const [selectedDevice, setSelectedDevice] = useState('desktop')
  const [initialWorkspaceState, setInitialWorkspaceState] = useState(null)
  
  const { 
    projects, 
    loadUserProjects, 
    saveProject, 
    deleteProject 
  } = useProjectDatabase()

  // Initialize Blockly workspace
  const workspace = BlocklyWorkspace({
    initialWorkspaceState,
    onWorkspaceChange: (workspaceRef) => {
      const code = javascriptGenerator.workspaceToCode(workspaceRef)
      setGeneratedCode(code)
    },
    onWorkspaceLoad: () => {
      if (id && !initialWorkspaceState) {
        loadProjectById(id)
      }
    }
  })

  useEffect(() => {
    loadUserProjects()
  }, [])

  useEffect(() => {
    if (workspace.isInitialized) {
      const code = workspace.getGeneratedCode()
      setGeneratedCode(code)
    }
  }, [workspace.isInitialized])

  const loadProjectById = async (projectId) => {
    try {
      const project = projects.find((p) => p.id === projectId)
      if (project) {
        setProjectTitle(project.title)
        setProjectDescription(project.description || '')
        setCurrentProjectId(project.id)
        setInitialWorkspaceState(project.blocks_json)
        addToast(`Loaded "${project.title}"`, 'success')
      }
    } catch (error) {
      addToast('Error loading project', 'error')
    }
  }

  const runCode = () => {
    const code = workspace.getGeneratedCode()
    setGeneratedCode(code)
  }

  // ─── Save Handlers ─────────────────────────────────────

  const handleSaveToAccount = async ({ title, description }) => {
    try {
      const workspaceState = workspace.getWorkspaceState()
      const code = workspace.getGeneratedCode()
      
      const savedProject = await saveProject({
        title,
        description,
        workspaceState,
        code,
        projectId: id || currentProjectId
      })
      
      setCurrentProjectId(savedProject.id)
      setProjectTitle(title)
      setProjectDescription(description)
      
      if (!(id || currentProjectId)) {
        navigate(`/${profile?.role}/editor/${savedProject.id}`, { replace: true })
      }
      
      setShowSaveModal(false)
      addToast(`Project "${title}" saved successfully!`, 'success')
      loadUserProjects()
    } catch (error) {
      addToast(error.message || 'Failed to save project', 'error')
    }
  }

  const handleExportHTML = () => {
    const code = workspace.getGeneratedCode()
    if (!code) {
      addToast('No code to export', 'error')
      return
    }
    
    const blob = new Blob([code], { type: 'text/html' })
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
    
    const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { 
      type: 'application/json' 
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${projectTitle || 'blockly-project'}.json`
    a.click()
    URL.revokeObjectURL(url)
    addToast('Blockly project exported!', 'success')
  }

  // ─── Load Handlers ─────────────────────────────────────

  const handleLoadFromDevice = () => {
    fileInputRef.current?.click()
  }

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
    setInitialWorkspaceState(project.blocks_json)
    navigate(`/${profile?.role}/editor/${project.id}`)
    addToast(`Loaded "${project.title}"`, 'success')
  }

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return
    
    try {
      await deleteProject(projectId)
      if (currentProjectId === projectId) {
        handleCreateNew()
      }
      addToast('Project deleted', 'info')
      loadUserProjects()
    } catch (error) {
      addToast('Error deleting project', 'error')
    }
  }

  // ─── Create New ────────────────────────────────────────

  const handleCreateNew = () => {
    // Always show the CreateProjectModal when New button is clicked
    setShowCreateModal(true)
  }

  const handleCreateNewConfirm = () => {
    workspace.clearWorkspace()
    setProjectTitle('Untitled')
    setProjectDescription('')
    setCurrentProjectId(null)
    setInitialWorkspaceState(null)
    navigate(`/${profile?.role}/editor`, { replace: true })
    setShowCreateModal(false)
    addToast('New project created', 'info')
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <EditorHeader
        onNew={(handleCreateNew)}
        onSave={() => setShowSaveModal(true)}
        onLoad={() => setShowLoadModal(true)}
        projectTitle={projectTitle}
      />
      
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden p-4 gap-4">
        {/* Blockly Workspace */}
        <div className="flex md:w-2/3 h-full border-4 rounded-xl border-gray-600 bg-white overflow-hidden">
          <div ref={workspace.blocklyDiv} className="blocklyDiv flex-1" />
        </div>
        
        {/* Preview Pane */}
        <div className="flex-1 h-full overflow-hidden"> 
          <PreviewPane
            generatedCode={generatedCode}
            onRunCode={runCode}
            responsive={responsive}
            selectedDevice={selectedDevice}
            onToggleResponsive={() => setResponsive(!responsive)}
            onSelectDevice={setSelectedDevice}
          />
        </div>
      </div>

      {/* Hidden file input for loading JSON from device */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Modals */}
      {showCreateModal && (
        <CreateProjectModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreated={handleCreateNewConfirm}
        />
      )}

      <SaveModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSaveToAccount={handleSaveToAccount}
        onExportHTML={handleExportHTML}
        onExportJSON={handleExportJSON}
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
    </div>
  )
}

export default BlockEditor