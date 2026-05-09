import { supabase } from "../supabaseClient";

export const courseService = {
  async getUserProgress(userId) {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*, courses(*)')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async getAllUserProgress(userId) {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*, courses(*)') // Join with courses table to get course details
      .eq('user_id', userId);
    if (error) throw error;
    return data || []; // Return an array, even if empty
  },

  async getCourses() {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('order', { ascending: true });

    if (error) throw error;
    return data;
  },

  async initializeUserProgress(userId, courseId, level, xp) {
    const { data, error } = await supabase
      .from('user_progress')
      .upsert([
        {
          user_id: userId,
          active_course: courseId,
          current_xp: xp,
          current_level: level,
          total_xp: xp
        }
      ],
      { onConflict: 'user_id, active_course' }) 
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};