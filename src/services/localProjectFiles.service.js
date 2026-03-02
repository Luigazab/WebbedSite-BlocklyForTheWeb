const LOCAL_FILES_KEY = 'blockly_local_files';
const ACTIVE_FILE_KEY = 'blockly_active_file';

const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const getEmptyWorkspaceState = () => ({
  blocks: {
    languageVersion: 0,
    blocks: []
  }
});

export const localProjectFilesService = {
  getLocalFiles() {
    try {
      const stored = localStorage.getItem(LOCAL_FILES_KEY);
      if (!stored) {
        return this.createDefaultLocalFiles();
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error reading local files:', error);
      return this.createDefaultLocalFiles();
    }
  },

  createDefaultLocalFiles() {
    const defaultFiles = [
      {
        id: generateTempId(),
        filename: 'index.html',
        blocks_json: getEmptyWorkspaceState(),
        created_at: new Date().toISOString(),
      },
      {
        id: generateTempId(),
        filename: 'style.css',
        blocks_json: getEmptyWorkspaceState(),
        created_at: new Date().toISOString(),
      },
      {
        id: generateTempId(),
        filename: 'script.js',
        blocks_json: getEmptyWorkspaceState(),
        created_at: new Date().toISOString(),
      },
    ];
    
    this.saveLocalFiles(defaultFiles);
    this.setActiveFile(defaultFiles[0].id);
    return defaultFiles;
  },

  saveLocalFiles(files) {
    try {
      localStorage.setItem(LOCAL_FILES_KEY, JSON.stringify(files));
    } catch (error) {
      console.error('Error saving local files:', error);
    }
  },

  getActiveFile() {
    return localStorage.getItem(ACTIVE_FILE_KEY);
  },

  setActiveFile(fileId) {
    localStorage.setItem(ACTIVE_FILE_KEY, fileId);
  },

  createLocalFile(filename) {
    const files = this.getLocalFiles();
    const newFile = {
      id: generateTempId(),
      filename,
      blocks_json: getEmptyWorkspaceState(),
      created_at: new Date().toISOString(),
    };
    
    files.push(newFile);
    this.saveLocalFiles(files);
    return newFile;
  },

  updateLocalFile(fileId, blocksJson) {
    const files = this.getLocalFiles();
    const fileIndex = files.findIndex(f => f.id === fileId);
    
    if (fileIndex !== -1) {
      files[fileIndex].blocks_json = blocksJson;
      files[fileIndex].updated_at = new Date().toISOString();
      this.saveLocalFiles(files);
      return files[fileIndex];
    }
    return null;
  },

  deleteLocalFile(fileId) {
    const files = this.getLocalFiles();
    const filteredFiles = files.filter(f => f.id !== fileId);
    
    if (filteredFiles.length === 0) {
      return this.createDefaultLocalFiles();
    }
    
    this.saveLocalFiles(filteredFiles);
    
    if (this.getActiveFile() === fileId) {
      this.setActiveFile(filteredFiles[0].id);
    }
    
    return filteredFiles;
  },

  clearLocalFiles() {
    localStorage.removeItem(LOCAL_FILES_KEY);
    localStorage.removeItem(ACTIVE_FILE_KEY);
  },

  getLocalFile(fileId) {
    const files = this.getLocalFiles();
    return files.find(f => f.id === fileId);
  },
};