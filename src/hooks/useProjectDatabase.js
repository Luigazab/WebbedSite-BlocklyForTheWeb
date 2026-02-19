// hooks/useProjectDatabase.js
import { useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';

export const useProjectDatabase = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadUserProjects = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (!error) {
      setProjects(data);
    }
    return data;
  }, []);

  const saveProject = useCallback(async ({ title, description, workspaceState, code, projectId }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Please log in to save');

    const projectData = {
      user_id: user.id,
      title,
      description,
      blocks_json: workspaceState,
      generated_html: code,
      is_public: false,
      updated_at: new Date().toISOString()
    };

    let result;
    if (projectId) {
      result = await supabase
        .from('projects')
        .update(projectData)
        .eq('id', projectId)
        .select();
    } else {
      result = await supabase
        .from('projects')
        .insert([projectData])
        .select();
    }

    if (result.error) throw result.error;
    return result.data[0];
  }, []);

  const deleteProject = useCallback(async (projectId) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) throw error;
    setProjects(prev => prev.filter(p => p.id !== projectId));
  }, []);

  return {
    projects,
    loading,
    loadUserProjects,
    saveProject,
    deleteProject,
    setProjects
  };
};