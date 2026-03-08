import { useState, useMemo, useRef } from 'react'
import SimpleMDE from 'react-simplemde-editor'
import ReactMarkdown from 'react-markdown'
import 'easymde/dist/easymde.min.css'
import { Eye, Code } from 'lucide-react'

export default function MarkdownEditor({ value, onChange }) {
  const [showPreview, setShowPreview] = useState(false)
  const editorRef = useRef(null)

  const editorOptions = useMemo(() => {
    return {
      spellChecker: false,
      placeholder: 'Write your lesson content in Markdown...\n\n# Heading 1\n## Heading 2\n**bold** *italic*\n- List item\n\n```javascript\ncode block\n```',
      toolbar: [
        'bold', 'italic', 'heading', '|',
        'quote', 'unordered-list', 'ordered-list', '|',
        'link', 'image', '|',
        'code', 'table', '|',
        'preview', 'side-by-side', 'fullscreen', '|',
        'guide'
      ],
      minHeight: '500px',
      maxHeight: '700px',
      sideBySideFullscreen: false,
      status: ['lines', 'words', 'cursor'],
      autosave: {
        enabled: true,
        uniqueId: 'lesson-editor',
        delay: 1000,
      },
    }
  }, [])

  return (
    <div className="p-6">
      {/* Toggle Preview */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">Lesson Content</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(false)}
            className={`btn flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${!showPreview
                ? 'bg-blockly-purple text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            <Code className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => setShowPreview(true)}
            className={`btn flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${showPreview
                ? 'bg-blockly-purple text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
        </div>
      </div>

      {/* Editor or Preview */}
      {showPreview ? (
        <div className="prose prose-sm max-w-none border border-gray-200 rounded-xl p-6 bg-gray-50 min-h-125]">
          <ReactMarkdown>{value || '*No content yet*'}</ReactMarkdown>
        </div>
      ) : (
        <SimpleMDE
          ref={editorRef}
          value={value}
          onChange={onChange}
          options={editorOptions}
        />
      )}

      {/* Helper text */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Markdown Tips:</strong> Use # for headings, **bold**, *italic*, [links](url), 
          ![images](url), `code`, and ```language code blocks```. Click the ? icon in the toolbar for more help.
        </p>
      </div>
    </div>
  )
}