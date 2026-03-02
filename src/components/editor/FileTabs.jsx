import { useState } from 'react';
import { X, Plus, Cloud, HardDrive, FileCode, Palette, Code2Icon, NotebookText, Check } from 'lucide-react';

const FileTabs = ({ files, activeFile, onFileChange, onFileCreate, onFileDelete, isLocal }) => {
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
    if (filename.endsWith('.html')) return <FileCode/>;
    if (filename.endsWith('.css')) return <Palette/>;
    if (filename.endsWith('.js')) return <Code2Icon/>;
    return <NotebookText/>;
  };

  return (
    <div className="flex items-center gap-1 bg-gray-800 px-2 py-1 overflow-x-auto">
      {isLocal && (
        <div className="flex items-center gap-1 px-2 py-1 text-xs text-yellow-400 bg-yellow-900/30 rounded mr-2">
          <HardDrive size={12} />
          <span>Local</span>
        </div>
      )}
      {files.map((file) => (
        <div
          key={file.id}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-t cursor-pointer
            transition-all min-w-fit group
            ${activeFile === file.id 
              ? 'btn-secondary border-2 border-gray-600 border-b-0 -mb-0.5' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }
          `}
          onClick={() => onFileChange(file.id)}
        >
          <span className="text-sm">{getFileIcon(file.filename)}</span>
          <span className="text-sm font-medium">{file.filename}</span>
          {files.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Delete ${file.filename}?`)) {
                  onFileDelete(file.id);
                }
              }}
              className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity ml-1"
            >
              <X size={14} />
            </button>
          )}
        </div>
      ))}

      {showNewFileInput ? (
        <div className="flex items-center gap-1 px-2 py-1 bg-white rounded-t">
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
            placeholder="filename.html"
            className="text-sm outline-none w-32 text-black"
            autoFocus
          />
          <button
            onClick={handleCreateFile}
            className="text-green-600 hover:text-green-700 font-bold"
          >
            <Check/>
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowNewFileInput(true)}
          className="p-1.5 hover:bg-gray-600 rounded transition-colors text-gray-300"
          title="Add new file"
        >
          <Plus size={16} />
        </button>
      )}
    </div>
  );
};

export default FileTabs;