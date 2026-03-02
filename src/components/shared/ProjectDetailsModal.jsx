import { useEffect, useRef, useState } from 'react'
import { X, ThumbsUp, MessageSquare, Monitor, Code } from 'lucide-react'
import * as Blockly from 'blockly/core'
import 'blockly/blocks'
import Theme from '@blockly/theme-modern'

export default function ProjectDetailsModal({ project, onClose, srcDoc }) {
  const [comment, setComment] = useState('')
  const [viewMode, setViewMode] = useState('preview')
  const [blocksJson, setBlocksJson] = useState(null);
  const blocklyDivRef = useRef(null);
  const workspaceRef = useRef(null);

  const handleSubmitComment = (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    console.log('Submitting comment:', comment)
    setComment('')
  }

  const handleViewModeToggle = (mode) => {
    if(workspaceRef.current){
      workspaceRef.current.dispose();
      workspaceRef.current = null;
    }
    setViewMode(mode)
  }
  useEffect(() => {
    if (viewMode === 'blocks' && blocksJson && blocklyDivRef.current && !workspaceRef.current) {
      renderBlocklyWorkspace();
    }
    
    return () => {
      if (workspaceRef.current) {
        workspaceRef.current.dispose();
        workspaceRef.current = null;
      }
    };
  }, [viewMode, blocksJson]);
  const renderBlocklyWorkspace = () => {
    if (!blocklyDivRef.current || !blocksJson) return;

    try {
      if (workspaceRef.current) {
        workspaceRef.current.dispose();
      }

      const workspace = Blockly.inject(blocklyDivRef.current, {
        readOnly: true,
        theme: Theme,
        renderer: "zelos",
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
      });

      workspaceRef.current = workspace;

      if (blocksJson) {
        Blockly.serialization.workspaces.load(blocksJson, workspace);
      }

      setTimeout(() => {
        workspace.scrollCenter();
      }, 100);
    } catch (error) {
      console.error('Error rendering Blockly workspace:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card l max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-800">{project.title}</h2>
            <p className="text-sm font-bold text-gray-400 ml-2 pl-2 border-l-4">{project.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {/* Left: Preview */}
            <div className="flex flex-col gap-4">
              <div className='flex gap-2 mb-3'>
                <button
                  onClick={() => handleViewModeToggle('preview')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm btn ${
                    viewMode === 'preview'
                      ? 'btn-primary'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Monitor size={18} />
                  Preview
                </button>
                <button
                  onClick={() => handleViewModeToggle('blocks')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm btn ${
                    viewMode === 'blocks'
                      ? 'btn-lead'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Code size={18} />
                  Blocks
                </button>
              </div>
              <div className="flex-1 border-2 border-black bg-white rounded-lg overflow-hidden drop-shadow-[4px_4px_0_rgba(0,0,0,1)]">
                {viewMode === 'preview' ? (
                  srcDoc ? ( 
                    <iframe 
                      srcDoc={srcDoc} 
                      title={`Preview of ${title}`} 
                      sandbox="allow-scripts"
                      className="w-full h-full border-0"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-lg">
                      No preview available
                    </div>
                  )
                ) : (
                  <div 
                    ref={blocklyDivRef}
                    className="w-full h-full bg-gray-50"
                    style={{ minHeight: '400px' }}
                  />
                )}
              </div>
            </div>

            {/* Right: Comments */}
            <div className="flex flex-col gap-4">
              
              {/* Stats */}
              <div className="flex items-center justify-end gap-4">
                <button className="flex items-center gap-2 px-2 py-2 bg-blue-100 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-200 transition-colors">
                  <ThumbsUp className="w-4 h-4" />
                  {project.likes}
                </button>
                <button className="flex items-center gap-2 px-2 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors">
                  <MessageSquare className="w-4 h-4" />
                  {project.comments}
                </button>
              </div>

              {/* Edit button */}
              <button className="btn w-full py-2.5 btn-lead text-sm ">
                Edit
              </button>
              <h3 className="font-bold text-gray-800">Comments</h3>

              {/* Comment form */}
              <form onSubmit={handleSubmitComment} className="flex flex-col gap-3 p-4 bg-gray-50 rounded-xl">
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
                  className="btn self-end px-4 py-2 bg-blockly-purple text-white text-sm font-semibold rounded-lg hover:bg-blockly-purple/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Post
                </button>
              </form>

              {/* Comments list */}
              <div className="flex flex-col gap-3">
                {/* Mock comment */}
                <div className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-gray-300 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">Username</p>
                    <p className="text-sm text-gray-600 mt-1">This is a sample comment</p>
                    <p className="text-xs text-gray-400 mt-1">2 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}