import { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router'
import { javascriptGenerator } from 'blockly/javascript'
import BlocklyWorkspace from '../../../components/editor/BlocklyWorkspace'
import PreviewPane from '../../../components/editor/PreviewPane'
import { useProjectDatabase } from '../../../hooks/useProjectDatabase'
import SaveModal from '../../../components/editor/SaveModal'
import LoadModal from '../../../components/editor/LoadModal'
import EditorHeader from '../../../components/layout/EditorHeader'
import { useAuthStore } from '../../../store/authStore'

const Editor = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const location = useLocation()

  const [projectTitle, setProjectTitle] = useState(
    location.state?.projectTitle ?? 'Untitled'
  )
  
  const [generatedCode, setGeneratedCode] = useState('')
  // const [projectTitle, setProjectTitle] = useState('Untitled')
  const [projectDescription, setProjectDescription] = useState('')
  const [currentProjectId, setCurrentProjectId] = useState(null)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showLoadModal, setShowLoadModal] = useState(false)
  const [message, setMessage] = useState('')
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
      }
    } catch (error) {
      showMessage('Error loading project', true)
    }
  }

  const runCode = () => {
    const code = workspace.getGeneratedCode()
    setGeneratedCode(code)
  }

  const handleSave = async ({ title, description }) => {
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
      showMessage(`Project "${title}" saved successfully!`)
      loadUserProjects()
    } catch (error) {
      showMessage(error.message, true)
    }
  }

  const handleLoadProject = (project) => {
    setProjectTitle(project.title)
    setProjectDescription(project.description || '')
    setCurrentProjectId(project.id)
    setInitialWorkspaceState(project.blocks_json)
    navigate(`/${profile?.role}/editor/${project.id}`)
    setShowLoadModal(false)
    showMessage(`Loaded "${project.title}"`)
  }

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return
    
    try {
      await deleteProject(projectId)
      if (currentProjectId === projectId) {
        createNewProject()
      }
      showMessage('Project deleted')
    } catch (error) {
      showMessage('Error deleting project', true)
    }
  }

  const createNewProject = () => {
    workspace.clearWorkspace()
    setProjectTitle('Untitled')
    setProjectDescription('')
    setCurrentProjectId(null)
    setInitialWorkspaceState(null)
    navigate(`/${profile?.role}/editor`, { replace: true })
    showMessage('New project created')
  }

  const showMessage = (msg, isError = false) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), 3000)
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <EditorHeader
        onNew={createNewProject}
        onSave={() => setShowSaveModal(true)}
        onLoad={() => setShowLoadModal(true)}
        projectTitle={projectTitle}
      />

      {message && (
        <div className="fixed top-20 right-4 z-50 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg">
          {message}
        </div>
      )}
      
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

      <SaveModal 
        isOpen={showSaveModal} 
        onClose={() => setShowSaveModal(false)} 
        onSave={handleSave} 
        initialTitle={projectTitle} 
        initialDescription={projectDescription} 
      />
      
      <LoadModal 
        isOpen={showLoadModal} 
        onClose={() => setShowLoadModal(false)} 
        projects={projects} 
        onLoadProject={handleLoadProject} 
        onDeleteProject={handleDeleteProject} 
      />
    </div>
  )
}

export default Editor