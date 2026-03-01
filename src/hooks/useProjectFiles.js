import { useEffect } from "react";
import { useProjectFilesStore } from "../store/projectFilesStore";

export function useProjectFiles(projectId) {
  const { files, activeFile, loadFiles, saveFile, deleteFile, setActiveFile } =
    useProjectFilesStore();

  useEffect(() => {
    if (projectId) {
      loadFiles(projectId)
      addToast('Account created! Please check your email to confirm.', 'success')
    };
  }, [projectId]);

  return {
    files,
    activeFile,
    saveFile,
    deleteFile,
    setActiveFile,
  };
}
