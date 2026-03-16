import '@/components/tiptap-templates/simple/simple-editor.scss'

export default function LessonContent({ content }) {
  if (!content) return null

  return (
    <div className="tiptap-editor">
      <div
        className="tiptap ProseMirror simple-editor prose max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  )
}