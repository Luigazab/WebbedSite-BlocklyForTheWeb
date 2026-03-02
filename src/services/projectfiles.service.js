import { supabase } from "../supabaseClient";

// Helper to create empty Blockly workspace state
const getEmptyWorkspaceState = () => ({
  blocks: {
    languageVersion: 0,
    blocks: []
  }
});

export async function getProjectFiles(projectId) {
  const { data, error } = await supabase
    .from("project_files")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createProjectFile(projectId, filename, blocksJson = null) {
  const { data, error } = await supabase
    .from("project_files")
    .insert({
      project_id: projectId,
      filename,
      blocks_json: blocksJson || getEmptyWorkspaceState(),
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function saveProjectFile(projectId, filename, blocksJson, fileId = null) {
  const payload = {
    project_id: projectId,
    filename,
    blocks_json: blocksJson,
    updated_at: new Date().toISOString(),
  };

  if (fileId) {
    payload.id = fileId;
  }

  const { data, error } = await supabase
    .from("project_files")
    .upsert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProjectFile(fileId) {
  const { error } = await supabase
    .from("project_files")
    .delete()
    .eq("id", fileId);
  if (error) throw error;
}

// Create default files for new projects
export async function createDefaultProjectFiles(projectId) {
  const emptyState = getEmptyWorkspaceState();
  
  const defaultFiles = [
    { filename: "index.html", blocks_json: emptyState },
    { filename: "style.css", blocks_json: emptyState },
    { filename: "script.js", blocks_json: emptyState },
  ];

  const { data, error } = await supabase
    .from("project_files")
    .insert(
      defaultFiles.map(file => ({
        project_id: projectId,
        ...file,
      }))
    )
    .select();
  
  if (error) throw error;
  return data;
}