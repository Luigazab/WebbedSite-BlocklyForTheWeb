import { create } from "zustand";
import { getProjectFiles, saveProjectFile, deleteProjectFile } from "../services/projectfiles.service";

export const useProjectFilesStore = create((set, get) => ({
  files: [],
  activeFile: null,

  loadFiles: async (projectId) => {
    const files = await getProjectFiles(projectId);
    set({ files, activeFile: files[0]?.id || null });
  },

  saveFile: async (projectId, filename, blocksJson) => {
    await saveProjectFile(projectId, filename, blocksJson);
    await get().loadFiles(projectId); // refresh
  },

  deleteFile: async (fileId, projectId) => {
    await deleteProjectFile(fileId);
    await get().loadFiles(projectId);
  },

  setActiveFile: (fileId) => set({ activeFile: fileId }),
}));
