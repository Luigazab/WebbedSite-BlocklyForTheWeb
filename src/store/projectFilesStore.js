import { create } from "zustand";
import { 
  getProjectFiles, 
  saveProjectFile, 
  deleteProjectFile, 
  createProjectFile 
} from "../services/projectfiles.service";
import { localProjectFilesService } from "../services/localProjectFiles.service";

export const useProjectFilesStore = create((set, get) => ({
  files: [],
  activeFile: null,
  isLocal: false,

  loadFiles: async (projectId) => {
    if (!projectId) {
      const localFiles = localProjectFilesService.getLocalFiles();
      const activeFileId = localProjectFilesService.getActiveFile() || localFiles[0]?.id;
      
      set({ 
        files: localFiles, 
        activeFile: activeFileId,
        isLocal: true 
      });
      return localFiles;
    }
    
    try {
      const files = await getProjectFiles(projectId);
      set({ 
        files, 
        activeFile: files.length > 0 ? files[0].id : null,
        isLocal: false 
      });
      return files;
    } catch (error) {
      console.error('Error loading files:', error);
      return [];
    }
  },

  createFile: async (projectId, filename) => {
    if (!projectId) {
      const newFile = localProjectFilesService.createLocalFile(filename);
      const files = localProjectFilesService.getLocalFiles();
      set({ files, activeFile: newFile.id, isLocal: true });
      return newFile;
    }
    
    const newFile = await createProjectFile(projectId, filename);
    await get().loadFiles(projectId);
    set({ activeFile: newFile.id });
    return newFile;
  },

  saveFile: async (projectId, fileId, blocksJson) => {
    if (!projectId) {
      localProjectFilesService.updateLocalFile(fileId, blocksJson);
      const files = localProjectFilesService.getLocalFiles();
      set({ files, isLocal: true });
      return;
    }
    
    const file = get().files.find(f => f.id === fileId);
    if (!file) return;
    
    await saveProjectFile(projectId, file.filename, blocksJson, fileId);
    await get().loadFiles(projectId);
  },

  deleteFile: async (fileId, projectId) => {
    if (!projectId) {
      // Local mode
      const files = localProjectFilesService.deleteLocalFile(fileId);
      const activeFileId = localProjectFilesService.getActiveFile();
      set({ files, activeFile: activeFileId, isLocal: true });
      return;
    }
    
    await deleteProjectFile(fileId);
    const files = await get().loadFiles(projectId);
    
    if (get().activeFile === fileId && files.length > 0) {
      set({ activeFile: files[0].id });
    }
  },

  setActiveFile: (fileId) => {
    localProjectFilesService.setActiveFile(fileId);
    set({ activeFile: fileId });
  },

  migrateLocalFilesToDb: async (projectId) => {
    const localFiles = localProjectFilesService.getLocalFiles();
    
    for (const localFile of localFiles) {
      await createProjectFile(projectId, localFile.filename, localFile.blocks_json);
    }
    
    localProjectFilesService.clearLocalFiles();
    
    await get().loadFiles(projectId);
  },
}));