import { useState, useEffect } from 'react'
import { Upload, Trash2, FolderOpen, X } from 'lucide-react'

/**
 * LoadModal with 2 options:
 * 1. Load from account (shows project list)
 * 2. Load from device (file picker)
 */
const LoadModal = ({ 
  isOpen, 
  onClose, 
  projects, 
  onLoadProject, 
  onDeleteProject,
  onLoadFromDevice 
}) => {
  const [showProjectsList, setShowProjectsList] = useState(false)

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setShowProjectsList(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleLoadFromAccount = () => {
    setShowProjectsList(true)
  }

  const handleLoadFromDevice = () => {
    onLoadFromDevice()
    onClose()
  }

  const handleLoadProject = (project) => {
    onLoadProject(project)
    setShowProjectsList(false)
    onClose()
  }

  const handleDeleteProject = (projectId) => {
    onDeleteProject(projectId)
  }

  // If showing projects list
  if (showProjectsList) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-99 p-4">
        <div className="card p-6 w-full max-w-2xl  max-h-[80vh] flex flex-col">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <h3 className="text-2xl font-bold">Load Project</h3>
            <button
              onClick={() => {
                setShowProjectsList(false)
                onClose()
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {projects.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No saved projects yet
              </p>
            ) : (
              <div className="space-y-3">
                {projects.map((project) => (
                  <div 
                    key={project.id} 
                    className="border border-gray-200 rounded-lg p-4 hover:bg-blockly-purple/20 hover:border-blockly-purple transition-all duration-300 shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{project.title}</h4>
                        {project.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {project.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(project.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleLoadProject(project)} 
                          className="p-2 bg-blockly-blue/80 rounded-lg hover:bg-blockly-blue hover:ring-blockly-blue hover:ring-2 transition"
                        >
                          <Upload size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteProject(project.id)} 
                          className="p-2 bg-blockly-red/80 rounded-lg hover:bg-blockly-red hover:ring-blockly-red hover:ring-2 transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setShowProjectsList(false)}
            className="btn w-full mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium shrink-0"
          >
            Back
          </button>
        </div>
      </div>
    )
  }

  // Main load options view
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-99 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold">Load Project</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Option 1: Load from Account */}
          <button
            onClick={handleLoadFromAccount}
            className="shadow w-full flex items-center justify-between p-4 bg-white hover:bg-purple-100 rounded-xl transition-all group border-2 border-gray-200 hover:border-purple-300"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white group-hover:bg-purple-600 border-2 border-gray-300 group-hover:border-purple-600 rounded-xl flex items-center justify-center shrink-0 transition-all">
                <FolderOpen className="w-6 h-6 text-gray-700 group-hover:text-white transition-colors" />
              </div>
              <div className="text-left">
                <h4 className="text-lg font-semibold text-gray-900">Load saved project</h4>
                <p className="text-sm text-gray-600">Load a project saved with your account</p>
              </div>
            </div>
          </button>

          {/* Option 2: Load from Device */}
          <button
            onClick={handleLoadFromDevice}
            className="shadow w-full flex items-center justify-between p-4 bg-white hover:bg-purple-100 rounded-xl transition-all group border-2 border-gray-200 hover:border-purple-300"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white group-hover:bg-purple-600 border-2 border-gray-300 group-hover:border-purple-600 rounded-xl flex items-center justify-center shrink-0 transition-all">
                <Upload className="w-6 h-6 text-gray-700 group-hover:text-white transition-colors" />
              </div>
              <div className="text-left">
                <h4 className="text-lg font-semibold text-gray-900">Load saved file from device</h4>
                <p className="text-sm text-gray-600">Load project saved as .json on your device</p>
              </div>
            </div>
          </button>

        </div>

        <button
          onClick={onClose}
          className="btn w-full mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default LoadModal