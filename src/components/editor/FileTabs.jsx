import { useState } from 'react';
import { X, Plus, FileCode, Palette, Code2Icon, NotebookText, Check } from 'lucide-react';

const FileTabs = ({ files, activeFile, onFileChange, onFileCreate, onFileDelete }) => {
  const [showNewFileInput, setShowNewFileInput] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      onFileCreate(newFileName.trim());
      setNewFileName('');
      setShowNewFileInput(false);
    }
  };

  const getFileIcon = (filename) => {
    if (filename.endsWith('.html')) return <FileCode size={14}/>;
    if (filename.endsWith('.css')) return <Palette size={14}/>;
    if (filename.endsWith('.js')) return <Code2Icon size={14}/>;
    return <NotebookText size={14}/>;
  };

  return (
    <div data-tour="file-tabs" className="flex items-center gap-1 bg-muted px-1.5 py-1 overflow-x-auto whitespace-nowrap scrollbar-none shrink-0 border-b border-border">
      {files.map((file) => (
        <div
          key={file.id}
          className={`
            flex items-center gap-1.5 px-2.5 py-1.5 cursor-pointer rounded-t
            transition-all! min-w-fit group text-xs md:text-sm select-none
            ${activeFile === file.id 
              ? 'bg-card shadow-xs text-foreground font-semibold border-b-2 border-primary' 
              : 'bg-muted-foreground/10 text-muted-foreground hover:bg-muted-foreground/20'
            }
          `}
          onClick={() => onFileChange(file.id)}
        >
          <span className="shrink-0">{getFileIcon(file.filename)}</span>
          <span className="truncate max-w-30">{file.filename}</span>
          {files.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Delete ${file.filename}?`)) {
                  onFileDelete(file.id);
                }
              }}
              aria-label={`Delete ${file.filename}`}
              className="opacity-60 md:opacity-0 md:group-hover:opacity-100 hover:text-red-500 transition-opacity ml-1 p-0.5"
            >
              <X size={12} />
            </button>
          )}
        </div>
      ))}

      {showNewFileInput ? (
        <div className="flex items-center gap-1 px-2 py-1 bg-card rounded border border-border">
          <input
            type="text"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateFile();
              if (e.key === 'Escape') {
                setShowNewFileInput(false);
                setNewFileName('');
              }
            }}
            placeholder="page.html"
            className="text-xs outline-none w-24 md:w-32 text-foreground bg-transparent"
            autoFocus
          />
          <button
            onClick={handleCreateFile}
            className="text-emerald-600 hover:text-emerald-700 font-bold p-0.5"
          >
            <Check size={14} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowNewFileInput(true)}
          className="p-1.5 hover:bg-muted-foreground/20 rounded transition-colors text-foreground"
          title="Add new file"
        >
          <Plus size={14} />
        </button>
      )}
    </div>
  );
};

export default FileTabs;