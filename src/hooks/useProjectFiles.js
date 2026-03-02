import { useEffect } from "react";
import { useProjectFilesStore } from "../store/projectFilesStore";

export function useProjectFiles(projectId) {
  const { files, activeFile, isLocal, loadFiles, saveFile, deleteFile, setActiveFile, createFile, migrateLocalFilesToDb } = useProjectFilesStore();

  useEffect(() => {
    loadFiles(projectId);
  }, [projectId, loadFiles]);

  return {
    files,
    activeFile,
    isLocal,
    saveFile,
    deleteFile,
    setActiveFile,
    createFile,
    migrateLocalFilesToDb,
  };
}