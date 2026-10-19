// Reuse a new project's empty default files when saving a local workspace.
// The caller clears local drafts only after every write succeeds.
export async function migrateProjectFiles({projectId,files,readFiles,saveFile,createFile,deleteFile}) {
  const existing = await readFiles(projectId)
  for (const file of files) {
    const match = existing.find(row => row.filename === file.filename)
    if (match) await saveFile(projectId,file.filename,file.blocks_json,match.id)
    else await createFile(projectId,file.filename,file.blocks_json)
  }
  for (const file of existing) {
    if (!files.some(row => row.filename === file.filename) && !file.code && !(file.blocks_json?.blocks?.blocks?.length)) await deleteFile(file.id)
  }
}
