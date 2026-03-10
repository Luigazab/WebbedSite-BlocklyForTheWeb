import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Markdown from '@tiptap/extension-markdown';
import Image from '@tiptap/extension-image';
import { useState } from 'react';

// Custom styling for the notepad look
const notepadStyles = {
  editor: {
    minHeight: '420px',
    padding: '2rem 1.5rem',
    background: 'repeating-linear-gradient(white, white 1.5rem, #f0f0f0 1.5rem, #f0f0f0 1.55rem)',
    lineHeight: '1.5rem',
    fontFamily: '"Comic Sans MS", cursive, sans-serif', // or any handwriting‑like font
    border: '1px solid #ccc',
    boxShadow: 'inset 0 0 10px #ddd',
  },
};

export default function NotepadEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown,               // enables markdown output
      Image.configure({
        inline: true,
        allowBase64: true,    // only for demo – use real uploads in production
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      // Save markdown to the parent state
      onChange(editor.storage.markdown.getMarkdown());
    },
    editorProps: {
      attributes: {
        class: 'notepad-editor',
        style: notepadStyles.editor,
      },
    },
  });

  // Toolbar buttons (you can style them like your existing toggle)
  const Toolbar = () => (
    <div className="toolbar">
      <button onClick={() => editor.chain().focus().toggleBold().run()}>
        Bold
      </button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()}>
        Italic
      </button>
      {/* add more buttons as needed */}
    </div>
  );

  return (
    <div className="rounded border">
      <Toolbar />
      <EditorContent editor={editor} />
    </div>
  );
}