import { useEffect, useRef, useState } from 'react'
import { X, ThumbsUp, MessageSquare, Monitor, Code } from 'lucide-react'
import * as Blockly from 'blockly/core'
import 'blockly/blocks'
import Theme from '@blockly/theme-modern'
import { useProjectFiles } from '../../hooks/useProjectFiles'
import { codeGeneratorService } from '../../services/codeGenerator.service'

export default function ProjectDetailsModal({ project, onClose, onDelete, onToggleVisibility }) {
  const [comment, setComment] = useState('')
  const [viewMode, setViewMode] = useState('preview') // 'preview' or 'blocks'
  const [filesWithCode, setFilesWithCode] = useState([])
  const [generatedCode, setGeneratedCode] = useState('')
  
  const blocklyDivRef = useRef(null)
  const workspaceRef = useRef(null)

  // ✅ Use the hook we already built
  const { files, activeFile, setActiveFile } = useProjectFiles(project.id)

  // ✅ Generate code for each file
  useEffect(() => {
    if (files.length > 0) {
      // Create a mock workspace for code generation
      const mockWorkspace = {
        workspaceToCode: () => ''
      }

      const filesWithGeneratedCode = files.map(file => {
        // For each file, generate code from blocks_json
        let code = ''
        try {
          // Create temporary workspace to generate code
          const tempDiv = document.createElement('div')
          const tempWorkspace = Blockly.inject(tempDiv, { readOnly: true })
          
          if (file.blocks_json) {
            Blockly.serialization.workspaces.load(file.blocks_json, tempWorkspace)
            code = codeGeneratorService.generateCode(tempWorkspace, file.filename)
          }
          
          tempWorkspace.dispose()
        } catch (error) {
          console.error('Error generating code for', file.filename, error)
        }

        return {
          ...file,
          generatedCode: code
        }
      })

      setFilesWithCode(filesWithGeneratedCode)

      // Set first file as active if none selected
      if (!activeFile && files.length > 0) {
        const indexFile = files.find(f => f.filename === 'index.html')
        const firstHtmlFile = files.find(f => f.filename.endsWith('.html'))
        const firstFile = indexFile || firstHtmlFile || files[0]
        setActiveFile(firstFile.id)
      }
    }
  }, [files])

  // ✅ Generate combined preview
  useEffect(() => {
    if (filesWithCode.length > 0 && activeFile) {
      const activeFileData = files.find(f => f.id === activeFile)
      if (activeFileData) {
        const combined = codeGeneratorService.combineFilesForPreview(
          filesWithCode,
          activeFileData.filename
        )
        setGeneratedCode(combined)
      }
    }
  }, [filesWithCode, activeFile, files])

  // ✅ Render Blockly workspace when in blocks mode
  useEffect(() => {
    if (viewMode === 'blocks' && activeFile && blocklyDivRef.current) {
      const file = files.find(f => f.id === activeFile)
      if (file?.blocks_json) {
        renderBlocklyWorkspace(file.blocks_json)
      }
    }

    return () => {
      if (workspaceRef.current) {
        workspaceRef.current.dispose()
        workspaceRef.current = null
      }
    }
  }, [viewMode, activeFile, files])

  const renderBlocklyWorkspace = (blocksJson) => {
    if (!blocklyDivRef.current || !blocksJson) return

    try {
      if (workspaceRef.current) {
        workspaceRef.current.dispose()
      }

      const workspace = Blockly.inject(blocklyDivRef.current, {
        readOnly: true,
        theme: Theme,
        renderer: 'zelos',
        zoom: {
          controls: true,
          wheel: true,
          startScale: 0.8,
          maxScale: 3,
          minScale: 0.3,
          scaleSpeed: 1.2
        },
        move: {
          scrollbars: true,
          drag: true,
          wheel: true
        },
        sounds: false,
      })

      workspaceRef.current = workspace
      Blockly.serialization.workspaces.load(blocksJson, workspace)

      setTimeout(() => {
        workspace.scrollCenter()
      }, 100)
    } catch (error) {
      console.error('Error rendering Blockly workspace:', error)
    }
  }

  const handleSubmitComment = (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    console.log('Submitting comment:', comment)
    setComment('')
  }

  const getFileIcon = (filename) => {
    if (filename.endsWith('.html')) return '📄'
    if (filename.endsWith('.css')) return '🎨'
    if (filename.endsWith('.js')) return '⚡'
    return '📝'
  }

  // ✅ Get current file's generated code for Code tab
  const getCurrentFileCode = () => {
    if (!activeFile) return ''
    const file = filesWithCode.find(f => f.id === activeFile)
    return file?.generatedCode || ''
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between shrink-0 border-b pb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{project.title}</h2>
            {project.description && (
              <p className="text-sm text-gray-500 mt-1">{project.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex gap-6 pt-6">
          {/* Left: Preview/Blocks with tabs */}
          <div className="flex-1 flex gap-2">
            {/* ✅ Side bookmark tabs for view mode */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setViewMode('preview')}
                className={`p-3 rounded-l-lg transition-all ${
                  viewMode === 'preview'
                    ? 'bg-blockly-purple text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Preview"
              >
                <Monitor size={20} />
              </button>
              <button
                onClick={() => setViewMode('blocks')}
                className={`p-3 rounded-l-lg transition-all ${
                  viewMode === 'blocks'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Blocks"
              >
                <Code size={20} />
              </button>
            </div>

            {/* Preview/Blocks area */}
            <div className="flex-1 flex flex-col gap-3">
              {/* ✅ File tabs */}
              {files.length > 0 && (
                <div className="flex gap-1 overflow-x-auto bg-gray-800 p-1 rounded-lg">
                  {files.map(file => (
                    <button
                      key={file.id}
                      onClick={() => setActiveFile(file.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded transition-all min-w-fit ${
                        activeFile === file.id
                          ? 'bg-white text-gray-900 font-semibold shadow'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <span>{getFileIcon(file.filename)}</span>
                      <span className="text-sm">{file.filename}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Display area */}
              <div className="flex-1 border-2 border-gray-300 bg-white rounded-lg overflow-hidden">
                {files.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blockly-purple" />
                  </div>
                ) : viewMode === 'preview' ? (
                  generatedCode ? (
                    <iframe
                      key={activeFile} // ✅ Force refresh when file changes
                      srcDoc={generatedCode}
                      title={`Preview of ${project.title}`}
                      sandbox="allow-scripts"
                      className="w-full h-full border-0"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
                      No preview available
                    </div>
                  )
                ) : (
                  <div
                    ref={blocklyDivRef}
                    className="w-full h-full bg-gray-50"
                  />
                )}
              </div>

              {/* ✅ Show generated code below preview */}
              {viewMode === 'preview' && (
                <details className="bg-gray-900 rounded-lg">
                  <summary className="px-4 py-2 cursor-pointer text-green-400 font-mono text-sm hover:bg-gray-800">
                    View Code
                  </summary>
                  <pre className="p-4 text-green-400 text-xs overflow-auto max-h-48 font-mono">
                    {getCurrentFileCode()}
                  </pre>
                </details>
              )}
            </div>
          </div>

          {/* Right: Stats & Comments */}
          <div className="w-80 flex flex-col gap-4">
            {/* Stats */}
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors">
                <ThumbsUp className="w-4 h-4" />
                {project.likes_count || 0}
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors">
                <MessageSquare className="w-4 h-4" />
                {project.comments_count || 0}
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const role = project.user_id // You might need to get this from profile
                  window.open(`/student/editor/${project.id}`, '_blank')
                }}
                className="flex-1 btn btn-primary py-2 text-sm font-semibold"
              >
                Open
              </button>
              <button
                onClick={onToggleVisibility}
                className="flex-1 btn bg-gray-100 text-gray-700 hover:bg-gray-200 py-2 text-sm font-semibold"
              >
                {project.is_public ? 'Private' : 'Public'}
              </button>
            </div>

            <button
              onClick={onDelete}
              className="btn bg-red-50 text-red-600 hover:bg-red-100 py-2 text-sm font-semibold"
            >
              Delete Project
            </button>

            {/* Comments section */}
            <div className="flex-1 flex flex-col gap-3 overflow-hidden">
              <h3 className="font-bold text-gray-800">Comments</h3>

              {/* Comment form */}
              <form onSubmit={handleSubmitComment} className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blockly-purple focus:ring-2 focus:ring-blockly-purple/10 transition resize-none bg-white"
                />
                <button
                  type="submit"
                  disabled={!comment.trim()}
                  className="self-end px-4 py-1.5 bg-blockly-purple text-white text-sm font-semibold rounded-lg hover:bg-blockly-purple/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Post
                </button>
              </form>

              {/* Comments list */}
              <div className="flex-1 overflow-y-auto flex flex-col gap-2">
                <div className="text-center text-sm text-gray-400 py-4">
                  No comments yet
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}