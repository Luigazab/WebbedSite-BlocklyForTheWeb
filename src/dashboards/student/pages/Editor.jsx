// Editor.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { javascriptGenerator } from 'blockly/javascript';
import BlocklyWorkspace from '../../../components/editor/BlocklyWorkspace'
import PreviewPane from '../../../components/editor/PreviewPane';
import { useProjectDatabase } from '../../../hooks/useProjectDatabase';
import ModalDropdown from '../../../components/editor/ModalDropdown';
import SaveModal from '../../../components/editor/SaveModal';
import LoadModal from '../../../components/editor/LoadModal';

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [generatedCode, setGeneratedCode] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [message, setMessage] = useState('');
  const [responsive, setResponsive] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState('desktop');
  const [initialWorkspaceState, setInitialWorkspaceState] = useState(null);
  
  const { 
    projects, 
    loadUserProjects, 
    saveProject, 
    deleteProject 
  } = useProjectDatabase();

  // Initialize Blockly workspace
  const workspace = BlocklyWorkspace({
    initialWorkspaceState,
    onWorkspaceChange: (workspaceRef) => {
      const code = javascriptGenerator.workspaceToCode(workspaceRef);
      setGeneratedCode(code);
    },
    onWorkspaceLoad: () => {
      if (id && !initialWorkspaceState) {
        loadProjectById(id);
      }
    }
  });

  // Load user projects on mount
  useEffect(() => {
    loadUserProjects();
  }, []);

  const loadProjectById = async (projectId) => {
    try {
      // Use your existing loadProjectById logic here
      // Set the initial workspace state instead of loading directly
      // This will trigger workspace re-initialization with the loaded state
    } catch (error) {
      showMessage('Error loading project', true);
    }
  };

  const runCode = () => {
    const code = workspace.getGeneratedCode();
    setGeneratedCode(code);
  };

  const handleSave = async ({ title, description }) => {
    try {
      const workspaceState = workspace.getWorkspaceState();
      const code = workspace.getGeneratedCode();
      
      const savedProject = await saveProject({
        title,
        description,
        workspaceState,
        code,
        projectId: id || currentProjectId
      });
      
      setCurrentProjectId(savedProject.id);
      setProjectTitle(title);
      setProjectDescription(description);
      
      if (!(id || currentProjectId)) {
        navigate(`/editor/${savedProject.id}`, { replace: true });
      }
      
      setShowSaveModal(false);
      showMessage(`Project "${title}" saved successfully!`);
      loadUserProjects();
    } catch (error) {
      showMessage(error.message, true);
    }
  };

  const handleLoadProject = (project) => {
    setProjectTitle(project.title);
    setProjectDescription(project.description || '');
    setCurrentProjectId(project.id);
    setInitialWorkspaceState(project.blocks_json);
    navigate(`/editor/${project.id}`);
    setShowLoadModal(false);
    showMessage(`Loaded "${project.title}"`);
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    
    try {
      await deleteProject(projectId);
      if (currentProjectId === projectId) {
        createNewProject();
      }
      showMessage('Project deleted');
    } catch (error) {
      showMessage('Error deleting project', true);
    }
  };

  const createNewProject = () => {
    workspace.clearWorkspace();
    setProjectTitle('Untitled');
    setProjectDescription('');
    setCurrentProjectId(null);
    setInitialWorkspaceState(null);
    navigate('/editor', { replace: true });
    showMessage('New project created');
  };

  const exportWorkspace = () => {
    const workspaceState = workspace.getWorkspaceState();
    if (!workspaceState) {
      showMessage('No workspace to export', true);
      return;
    }
    
    const blob = new Blob([JSON.stringify(workspaceState, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectTitle || 'workspace'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showMessage('Workspace exported!');
  };

  const exportToFile = () => {
    const code = workspace.getGeneratedCode();
    if (!code) {
      showMessage('No code to export', true);
      return;
    }
    
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectTitle || 'website'}.html`;
    a.click();
    URL.revokeObjectURL(url);
    showMessage('HTML file downloaded!');
  };

  const showMessage = (msg, isError = false) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-full overflow-hidden rounded-lg p-2 gap-4" >
      {message && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg">
          {message}
        </div>
      )}
      
        {/* Blockly Workspace */}
        <div className="flex md:w-2/3 h-full md:overflow-hidden border-4 rounded-xl border-gray-600 relative bg-white">
          <div ref={workspace.blocklyDiv} className="blocklyDiv flex-1 z-0" />
        </div>
        
        {/* Preview Pane */}
        <div className='flex-1 h-full'> 
          <div className="flex gap-2 justify-end">
            <button onClick={createNewProject} 
              className="flex items-center px-2 py-2 bg-orange-600 text-white font-semibold text-md rounded-xs border-2 drop-shadow-[4px_4px_0_rgba(0,0,0,1)] border-black hover:drop-shadow-[2px_2px_0_rgba(0,0,0,1)] hover:bg-orange-700 transition">
              New Project
            </button>
            <ModalDropdown 
              label={'Save'} 
              onClick={() => setShowSaveModal(true)} 
              action={'Save to Projects'} 
              description={'Saves online to your account'} 
              onClick2={exportWorkspace} 
              action2={'Export as JSON'} 
              description2={'Saves project to your device that you can load back for next time'} 
              onClick3={exportToFile} 
              action3={'Export as File'} 
              description3={'Save locally as an HTML and CSS file'} 
              color={'green'} 
            />
            <ModalDropdown 
              label={'Load'} 
              onClick={() => setShowLoadModal(true)} 
              action={'Load from Projects'} 
              description={'Retrieves saved projects from your account'} 
              color={'blue'}
            />
          </div>
          <PreviewPane
            generatedCode={generatedCode}
            onRunCode={runCode}
            responsive={responsive}
            selectedDevice={selectedDevice}
            onToggleResponsive={() => setResponsive(!responsive)}
            onSelectDevice={setSelectedDevice}
          />
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
  );
};

export default Editor;