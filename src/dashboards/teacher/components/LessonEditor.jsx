import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import {Table} from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import { useEffect, useCallback, useState } from 'react'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Minus,
  AlignLeft, AlignCenter, AlignRight,
  Link as LinkIcon, Image as ImageIcon,
  Table as TableIcon, Highlighter,
  Undo, Redo,
} from 'lucide-react'

// ─── Toolbar button ────────────────────────────────────────────────────────────
function ToolBtn({ onClick, active, disabled, title, children }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault() // keep editor focused
        onClick()
      }}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-md transition-colors ${
        active
          ? 'bg-indigo-100 text-indigo-700'
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
      } disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  )
}

// ─── Divider ───────────────────────────────────────────────────────────────────
function Divider() {
  return <div className="w-px h-5 bg-slate-200 mx-1" />
}

// ─── Main editor ───────────────────────────────────────────────────────────────
export default function LessonEditor({ value, onChange, placeholder = 'Start writing your lesson...' }) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-indigo-600 underline cursor-pointer' },
      }),
      Image.configure({
        HTMLAttributes: { class: 'max-w-full rounded-lg my-3' },
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'outline-none min-h-[420px] px-6 py-5 prose prose-slate max-w-none prose-headings:font-bold prose-a:text-indigo-600 focus:outline-none',
      },
    },
  })

  // Sync external value resets (e.g. loading a lesson for editing)
  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (value !== current && value !== undefined) {
      editor.commands.setContent(value || '', false)
    }
  }, [value, editor])

  const setLink = useCallback(() => {
    if (!linkUrl.trim()) {
      editor.chain().focus().extendMarkToLink({ href: '' }).run()
      return
    }
    const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`
    editor.chain().focus().setLink({ href: url }).run()
    setLinkUrl('')
    setLinkDialogOpen(false)
  }, [editor, linkUrl])

  const insertImage = useCallback(() => {
    if (!imageUrl.trim()) return
    const url = imageUrl.startsWith('http') ? imageUrl : `https://${imageUrl}`
    editor.chain().focus().setImage({ src: url }).run()
    setImageUrl('')
    setImageDialogOpen(false)
  }, [editor, imageUrl])

  const insertTable = useCallback(() => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }, [editor])

  if (!editor) return null

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-visible">

      {/* ── Toolbar ────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 bg-slate-50 border-b border-slate-200 sticky top-0 z-10 rounded-t-xl">

        {/* History */}
        <ToolBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
          <Undo size={15} />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
          <Redo size={15} />
        </ToolBtn>

        <Divider />

        {/* Text style */}
        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
          <Bold size={15} />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
          <Italic size={15} />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">
          <UnderlineIcon size={15} />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
          <Strikethrough size={15} />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} title="Highlight">
          <Highlighter size={15} />
        </ToolBtn>

        <Divider />

        {/* Headings */}
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1">
          <Heading1 size={15} />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">
          <Heading2 size={15} />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">
          <Heading3 size={15} />
        </ToolBtn>

        <Divider />

        {/* Lists & blocks */}
        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List">
          <List size={15} />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered List">
          <ListOrdered size={15} />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Quote / Callout">
          <Quote size={15} />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider Line">
          <Minus size={15} />
        </ToolBtn>

        <Divider />

        {/* Alignment */}
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align Left">
          <AlignLeft size={15} />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align Center">
          <AlignCenter size={15} />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align Right">
          <AlignRight size={15} />
        </ToolBtn>

        <Divider />

        {/* Link */}
        <div className="relative">
          <ToolBtn onClick={() => { setLinkUrl(editor.getAttributes('link').href || ''); setLinkDialogOpen(v => !v) }} active={editor.isActive('link')} title="Insert Link">
            <LinkIcon size={15} />
          </ToolBtn>
          {linkDialogOpen && (
            <div className="absolute top-9 left-0 z-20 bg-white border border-slate-200 rounded-xl shadow-lg p-3 flex gap-2 w-72">
              <input
                autoFocus
                type="url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') setLink(); if (e.key === 'Escape') setLinkDialogOpen(false) }}
                className="flex-1 text-sm px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button type="button" onClick={setLink} className="px-3 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Add
              </button>
            </div>
          )}
        </div>

        {/* Image */}
        <div className="relative">
          <ToolBtn onClick={() => setImageDialogOpen(v => !v)} title="Insert Image">
            <ImageIcon size={15} />
          </ToolBtn>
          {imageDialogOpen && (
            <div className="absolute top-9 left-0 z-20 bg-white border border-slate-200 rounded-xl shadow-lg p-3 flex gap-2 w-72">
              <input
                autoFocus
                type="url"
                placeholder="https://image-url.com/photo.png"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') insertImage(); if (e.key === 'Escape') setImageDialogOpen(false) }}
                className="flex-1 text-sm px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button type="button" onClick={insertImage} className="px-3 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Insert
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <ToolBtn onClick={insertTable} active={editor.isActive('table')} title="Insert Table">
          <TableIcon size={15} />
        </ToolBtn>

      </div>

      {/* ── Editor area ───────────────────────────────────────────────────── */}
      <div
        className="cursor-text"
        onClick={() => editor.commands.focus()}
      >
        <EditorContent editor={editor} />
      </div>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <div className="px-6 py-2 bg-slate-50 border-t border-slate-200 rounded-b-xl flex justify-between items-center">
        <span className="text-xs text-slate-400">
          {editor.storage?.characterCount?.characters?.() ?? editor.getText().length} characters
        </span>
        <span className="text-xs text-slate-400">
          {editor.isActive('bold') && <span className="font-bold mr-1">B</span>}
          {editor.isActive('italic') && <span className="italic mr-1">I</span>}
          {editor.isActive('heading', { level: 1 }) && <span className="mr-1">H1</span>}
          {editor.isActive('heading', { level: 2 }) && <span className="mr-1">H2</span>}
          {editor.isActive('heading', { level: 3 }) && <span className="mr-1">H3</span>}
        </span>
      </div>

      {/* Click outside to close dialogs */}
      {(linkDialogOpen || imageDialogOpen) && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => { setLinkDialogOpen(false); setImageDialogOpen(false) }}
        />
      )}
    </div>
  )
}