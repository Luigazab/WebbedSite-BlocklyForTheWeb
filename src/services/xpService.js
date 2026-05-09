import { supabase } from "../supabaseClient";

export const xpService = {
  async logXP({ userId, courseId, sourceId, sourceType, xp }) {
    const { error } = await supabase
      .from("user_xp_logs")
      .insert([
        {
          user_id: userId,
          course_id: courseId,
          source_id: sourceId,
          source_type: sourceType,
          xp_earned: xp
        }
      ]);

    if (error) throw error;
  },

  async getUserXPLogs(userId) {
    const { data, error } = await supabase
      .from("user_xp_logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }
};