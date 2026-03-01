import { supabase } from "../supabaseClient";

export async function getProjectFiles(projectId) {
  const { data, error } = await supabase
    .from("project_files")
    .select("*")
    .eq("project_id", projectId);
  if (error) throw error;
  return data;
}

export async function saveProjectFile(projectId, filename, blocksJson) {
  const { data, error } = await supabase
    .from("project_files")
    .upsert({
      project_id: projectId,
      filename,
      blocks_json: blocksJson,
      updated_at: new Date().toISOString(),
    }, { onConflict: ["project_id", "filename"] });
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
