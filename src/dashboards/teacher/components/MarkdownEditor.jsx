import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import {Table} from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Link from '@tiptap/extension-link';
import { useState } from 'react';
import { 
  Bold, Italic, Heading1, Heading2, Heading3, 
  List, ListOrdered, Quote, Table as TableIcon, 
  Link as LinkIcon, Image as ImageIcon, Minus, 
  Maximize2, Pilcrow
} from 'lucide-react';

// Mock image upload – replace with your own upload logic (e.g., to Supabase storage)
const uploadImage = async (file) => {
  // Example: upload to your server and return the public URL
  // For now, return a base64 preview (not recommended for production)
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
};

export default function MarkdownEditor({
  value = '', // expects JSON string or object
  onChange,
  placeholder = 'Start writing your lesson here...',
}) {
  // Parse initial content – if it's a string, try to parse as JSON
  const initialContent = typeof value === 'string' && value ? JSON.parse(value) : value;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Configure as needed
      }),
      Image.configure({
        inline: true,
        allowBase64: true, // for demo; replace with actual URLs in production
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      // Save JSON string to parent
      const json = editor.getJSON();
      onChange(JSON.stringify(json));
    },
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none focus:outline-none p-6',
        style: 'background: repeating-linear-gradient(white, white 1.5rem, #f0f0f0 1.5rem, #f0f0f0 1.55rem); line-height: 1.5rem; font-family: "Courier New", monospace; min-height: 420px;',
      },
      handleDOMEvents: {
        drop: (view, event) => {
          const hasFiles = event.dataTransfer?.files?.length;
          if (!hasFiles) return false;

          event.preventDefault();

          Array.from(event.dataTransfer.files).forEach(async (file) => {
            if (file.type.startsWith('image/')) {
              const url = await uploadImage(file);
              const { schema } = view.state;
              const node = schema.nodes.image.create({ src: url });
              const transaction = view.state.tr.replaceSelectionWith(node);
              view.dispatch(transaction);
            }
          });
          return true;
        },
      },
    },
  });

  // Toolbar button component
  const ToolbarButton = ({ onClick, icon: Icon, label, active = false }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded hover:bg-gray-200 transition ${
        active ? 'bg-gray-200 text-blue-600' : 'text-gray-700'
      }`}
      title={label}
    >
      <Icon size={16} />
    </button>
  );

  // Toolbar component
  const Toolbar = () => {
    if (!editor) return null;

    return (
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          icon={Bold}
          label="Bold"
          active={editor.isActive('bold')}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          icon={Italic}
          label="Italic"
          active={editor.isActive('italic')}
        />
        <span className="w-px h-6 bg-gray-300 mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          icon={Heading1}
          label="Heading 1"
          active={editor.isActive('heading', { level: 1 })}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          icon={Heading2}
          label="Heading 2"
          active={editor.isActive('heading', { level: 2 })}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          icon={Heading3}
          label="Heading 3"
          active={editor.isActive('heading', { level: 3 })}
        />
        <span className="w-px h-6 bg-gray-300 mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          icon={List}
          label="Bullet List"
          active={editor.isActive('bulletList')}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          icon={ListOrdered}
          label="Ordered List"
          active={editor.isActive('orderedList')}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          icon={Quote}
          label="Quote"
          active={editor.isActive('blockquote')}
        />
        <span className="w-px h-6 bg-gray-300 mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          icon={TableIcon}
          label="Insert Table"
        />
        <ToolbarButton
          onClick={() => {
            const url = window.prompt('Enter the URL:');
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
          icon={LinkIcon}
          label="Insert Link"
          active={editor.isActive('link')}
        />
        <ToolbarButton
          onClick={() => {
            const url = window.prompt('Enter the image URL:');
            if (url) editor.chain().focus().setImage({ src: url }).run();
          }}
          icon={ImageIcon}
          label="Insert Image"
        />
        <span className="w-px h-6 bg-gray-300 mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          icon={Minus}
          label="Divider"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setHardBreak().run()}
          icon={Maximize2}
          label="Fullscreen (not implemented)"
        />
      </div>
    );
  };

  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          Content Editor
        </span>
        {/* Optionally you could add a "Preview" button later, but not needed now */}
      </div>
      <Toolbar />
      <EditorContent editor={editor} />
    </div>
  );
}