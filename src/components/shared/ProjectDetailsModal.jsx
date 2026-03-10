import { useEffect, useRef, useState } from 'react'
import { X, ThumbsUp, MessageSquare, Monitor, Code, FileCode, Palette, Code2Icon, NotebookText, Eye, EyeOff, Trash2 } from 'lucide-react'
import * as Blockly from 'blockly/core'
import 'blockly/blocks'
import Theme from '@blockly/theme-modern'
import { formatDistanceToNow } from 'date-fns'
import { useProjectFiles } from '../../hooks/useProjectFiles'
import { codeGeneratorService } from '../../services/codeGenerator.service'
import { useCommentsStore } from '../../store/commentsStore'
import { useAuthStore } from '../../store/authStore'
import { useLikes } from '../../hooks/useLikes'

export default function ProjectDetailsModal({ project, onClose, onDelete, onToggleVisibility }) {
  const [comment, setComment] = useState('')
  const [viewMode, setViewMode] = useState('preview') 
  const [filesWithCode, setFilesWithCode] = useState([])
  const [generatedCode, setGeneratedCode] = useState('')

  const [likesCount, setLikesCount] = useState(project.likes_count || 0)
  const { isLiked, toggleLike } = useLikes([project.id])
  
  const blocklyDivRef = useRef(null)
  const workspaceRef = useRef(null)

  const profile = useAuthStore((s) => s.profile)
  const { files, activeFile, setActiveFile } = useProjectFiles(project.id)
  const { comments, loading: commentsLoading, loadComments, addComment, deleteComment } = useCommentsStore()

  useEffect(() => {
    loadComments(project.id)
  }, [project.id])

  useEffect(() => {
    setLikesCount(project.likes_count || 0)
  }, [project.likes_count])

  useEffect(() => {
    if (files.length > 0) {
      const filesWithGeneratedCode = files.map(file => {
        let code = ''
        try {
          const tempDiv = document.createElement('div')
          tempDiv.style.display = 'none'
          document.body.appendChild(tempDiv)
          
          const tempWorkspace = Blockly.inject(tempDiv, { readOnly: true })
          
          if (file.blocks_json) {
            Blockly.serialization.workspaces.load(file.blocks_json, tempWorkspace)
            code = codeGeneratorService.generateCode(tempWorkspace, file.filename)
          }
          
          tempWorkspace.dispose()
          document.body.removeChild(tempDiv)
        } catch (error) {
          console.error('Error generating code for', file.filename, error)
        }

        return {
          ...file,
          generatedCode: code
        }
      })

      setFilesWithCode(filesWithGeneratedCode)

      if (!activeFile && files.length > 0) {
        const indexFile = files.find(f => f.filename === 'index.html')
        const firstHtmlFile = files.find(f => f.filename.endsWith('.html'))
        const firstFile = indexFile || firstHtmlFile || files[0]
        setActiveFile(firstFile.id)
      }
    }
  }, [files])

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
        renderer: 'custom_renderer',
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

  const handleLike = async () => {
    try {
      const nowLiked = await toggleLike(project.id)
      const newCount = nowLiked ? likesCount + 1 : likesCount - 1
      setLikesCount(newCount)
      onLikeToggled?.(project.id, newCount) // notify parent
    } catch (err) {
      console.error('Like failed:', err)
    }
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    
    try {
      await addComment(project.id, comment.trim())
      setComment('')
      onCommentsCountChanged?.(project.id, +1)
    } catch (error) {
      console.error('Error posting comment:', error)
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return
    
    try {
      await deleteComment(commentId)
      onCommentsCountChanged?.(project.id, -1)
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
  }

  const getFileIcon = (filename) => {
    if (filename.endsWith('.html')) return <FileCode/>;
    if (filename.endsWith('.css')) return <Palette/>
    if (filename.endsWith('.js')) return <Code2Icon/>
    return <NotebookText/>
  }

  const getCurrentFileCode = () => {
    if (!activeFile) return ''
    const file = filesWithCode.find(f => f.id === activeFile)
    return file?.generatedCode || ''
  }
  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch (error) {
      return 'recently'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="absolute max-w-6xl w-full h-[90vh] bg-white shadow-2xl rounded-lg transform rotate-3 translate-x-2 translate-y-2 z-40" />
      <div className="card max-w-6xl w-full h-[90vh]  overflow-hidden flex flex-col shadow z-50 border-2 border-slate-300">
        {/* Header */}
        <div className="flex justify-between border-b pb-4 items-start">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800">{project.title}</h2>
            {project.description && (
              <p className="text-sm font-bold text-slate-500 ml-4">{project.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-300 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex gap-6 pt-6">
          <div className="flex-1 flex">
            <div className="flex flex-col mt-10">
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
            <div className="flex-1 flex flex-col">
              {/* ✅ File tabs */}
              {files.length > 0 && (
                <div className="flex overflow-x-auto ">
                  {files.map(file => (
                    <button
                      key={file.id}
                      onClick={() => setActiveFile(file.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-tr-xl transition-all duration-400 ease-in-out min-w-fit ${
                        activeFile === file.id
                          ? 'bg-blockly-purple font-bold text-white shadow'
                          : 'text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      <span>{getFileIcon(file.filename)}</span>
                      <span className="text-sm">{file.filename}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Display area */}
              <div className="flex-1 border-2 border-slate-600 bg-white overflow-hidden shadow rounded-tr-xl">
                <div className="flex items-center justify-between gap-2 px-3 py-1.5 border-b border-slate-600 bg-gray-100">
                  <span className="text-xs text-gray-500 font-mono truncate">
                    {activeFile ? activeFile : "Untitled"}
                  </span>
                  <div className='flex gap-2'>
                    <span className="w-3 h-3 rounded-full bg-blockly-red"></span>
                    <span className="w-3 h-3 rounded-full bg-blockly-yellow"></span>
                    <span className="w-3 h-3 rounded-full bg-blockly-green"></span>
                  </div>
                </div>
                {files.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blockly-purple" />
                  </div>
                ) : viewMode === 'preview' ? (
                  generatedCode ? (
                    <iframe
                      key={`${activeFile}-${generatedCode.substring(0, 100)}`}
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
                <details className="bg-gray-900 ">
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
            <div className="flex items-center gap-3">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isLiked(project.id)
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                {likesCount}
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors">
                <MessageSquare className="w-4 h-4" />
                {comments.length || 0}
              </button>
              
              <div className="flex-1 flex justify-center">
                <div className="flex rounded-full overflow-hidden border border-slate-400 shadow-inset transition-all group">
                  <label className={`flex-1 flex gap-2 px-2 items-center rounded-full text-center py-2 cursor-pointer text-xs font-semibold transition-colors
                    ${project.is_public ? 'bg-slate-100 text-slate-700' : 'bg-blockly-blue text-white'}`}>
                    <input type="radio" name="visibility" value="private" checked={!project.is_public} onChange={() => onToggleVisibility(false)} className="hidden"/>
                    <EyeOff className="w-4 h-4" />
                    Private
                  </label>
                  <label className={`flex-1 flex gap-2 px-2 items-center rounded-full text-center py-2 cursor-pointer text-xs font-semibold transition-colors
                    ${project.is_public ? 'bg-blockly-blue text-white' : 'bg-slate-100 text-slate-700'}`}>
                    <input type="radio" name="visibility" value="public" checked={project.is_public} onChange={() => onToggleVisibility(true)} className="hidden"/>
                    <Eye className="w-4 h-4" />
                    Public
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={() => {
                const role = profile.role
                window.open(`/${role}/editor/${project.id}`, '_blank')
              }}
              className="btn btn-secondary text-sm rounded-sm"
            >
              Open
            </button>


            {/* Comments section */}
            <div className="flex-1 flex flex-col gap-3 overflow-hidden">
              <h3 className="font-bold text-gray-800">Comments</h3>

              {/* Comment form */}
              <form onSubmit={handleSubmitComment} className="flex flex-col gap-2 p-3 rounded-lg">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                  className="w-full border border-slate-300 shadow rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blockly-purple focus:ring-2 focus:ring-blockly-purple/10 transition resize-none bg-white"
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
                {commentsLoading ? (
                  <div className="text-center text-sm text-gray-400 py-4">Loading...</div>
                ) : comments.length === 0 ? (
                  <div className="text-center text-sm text-gray-400 py-4">No comments yet</div>
                ) : (
                  comments.map(comment => (
                    <div key={comment.id} className="flex gap-3 p-3 bg-white border border-slate-300 shadow rounded-lg group">
                      {comment.profiles?.avatar_url ? (
                        <img
                          src={comment.profiles.avatar_url}
                          alt={comment.profiles?.username || 'User'}
                          className="w-8 h-8 rounded-full shrink-0 object-cover border border-slate-600"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blockly-purple flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {comment.profiles?.username?.[0]?.toUpperCase() || '?'}
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-800">
                            {comment.profiles?.username || 'Unknown'}
                          </p>
                          {comment.user_id === profile?.id && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                              title="Delete comment"
                            >
                              <Trash2 className="w-3 h-3 text-red-600" />
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{comment.content}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(comment.created_at)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <button
              onClick={onDelete}
              className="btn btn-accent text-sm max-w-fit rounded-sm self-end"
            >
              Delete Project
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}