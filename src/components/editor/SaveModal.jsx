import { useState, useEffect } from 'react'
import { Save, Download, FileJson, X } from 'lucide-react'

/**
 * SaveModal with 3 options:
 * 1. Save to account (shows detail form if new project, saves directly if existing)
 * 2. Export as HTML
 * 3. Export as JSON
 */
const SaveModal = ({ 
  isOpen, 
  onClose, 
  onSaveToAccount,
  onExportHTML, 
  onExportJSON,
  isNewProject,
  initialTitle = '',
  initialDescription = ''
}) => {
  const [showDetailForm, setShowDetailForm] = useState(false)
  const [projectTitle, setProjectTitle] = useState(initialTitle)
  const [projectDescription, setProjectDescription] = useState(initialDescription)

  useEffect(() => {
    if (isOpen) {
      setProjectTitle(initialTitle)
      setProjectDescription(initialDescription)
      setShowDetailForm(false)
    }
  }, [isOpen, initialTitle, initialDescription])

  if (!isOpen) return null

  const handleSaveToAccount = () => {
    if (isNewProject) {
      setShowDetailForm(true)
    } else {
      onSaveToAccount({ title: projectTitle, description: projectDescription })
      onClose()
    }
  }

  const handleSaveWithDetails = () => {
    onSaveToAccount({ title: projectTitle, description: projectDescription })
    setShowDetailForm(false)
    onClose()
  }

  const handleExportHTML = () => {
    onExportHTML()
    onClose()
  }

  const handleExportJSON = () => {
    onExportJSON()
    onClose()
  }

  if (showDetailForm) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-99 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold">Save Project</h3>
            <button
              onClick={() => {
                setShowDetailForm(false)
                onClose()
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                placeholder="Name your project"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                autoFocus
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2">
                Description <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <textarea
                placeholder="What is this project about?"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24 resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowDetailForm(false)}
              className="btn flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 "
            >
              Back
            </button>
            <button
              onClick={handleSaveWithDetails}
              disabled={!projectTitle.trim()}
              className="btn flex-1 px-4 py-2 btn-secondary rounded-lg disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-99 p-4">
      <div className="card bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold">Save Project</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Option 1: Save to Account */}
          <button
            onClick={handleSaveToAccount}
            className="shadow w-full flex items-center justify-between p-4 bg-white hover:bg-purple-100 rounded-xl transition-all group border-2 border-gray-200 hover:border-purple-300"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white group-hover:bg-purple-600 border-2 border-gray-300 group-hover:border-purple-600 rounded-xl flex items-center justify-center shrink-0 transition-all">
                <Save className="w-6 h-6 text-gray-700 group-hover:text-white transition-colors" />
              </div>
              <div className="text-left">
                <h4 className="text-lg font-semibold text-gray-900">Save project</h4>
                <p className="text-sm text-gray-600">
                  {isNewProject 
                    ? 'Save project to your account'
                    : 'Update saved project'
                  }
                </p>
              </div>
            </div>
          </button>

          {/* Option 2: Export as HTML */}
          <button
            onClick={handleExportHTML}
            className="shadow w-full flex items-center justify-between p-4 bg-white hover:bg-purple-100 rounded-xl transition-all group border-2 border-gray-200 hover:border-purple-300"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white group-hover:bg-purple-600 border-2 border-gray-300 group-hover:border-purple-600 rounded-xl flex items-center justify-center shrink-0 transition-all">
                <Download className="w-6 h-6 text-gray-700 group-hover:text-white transition-colors" />
              </div>
              <div className="text-left">
                <h4 className="text-lg font-semibold text-gray-900">Save file as HTML</h4>
                <p className="text-sm text-gray-600">Save the generated code as HTML file</p>
              </div>
            </div>
          </button>

          {/* Option 3: Export as JSON */}
          <button
            onClick={handleExportJSON}
            className="shadow w-full flex items-center justify-between p-4 bg-white hover:bg-purple-100 rounded-xl transition-all group border-2 border-gray-200 hover:border-purple-300"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white group-hover:bg-purple-600 border-2 border-gray-300 group-hover:border-purple-600 rounded-xl flex items-center justify-center shrink-0 transition-all">
                <FileJson className="w-6 h-6 text-gray-700 group-hover:text-white transition-colors" />
              </div>
              <div className="text-left">
                <h4 className="text-lg font-semibold text-gray-900">Save project locally</h4>
                <p className="text-sm text-gray-600">Save project to your device as .json file</p>
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

export default SaveModal