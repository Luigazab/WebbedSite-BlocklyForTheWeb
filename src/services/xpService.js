import { supabase } from "../supabaseClient";

export const xpService = {
  /** Complete a lesson through the database RPC so XP, attempts, and levels
   * are updated atomically. */
  async completeLesson({ userId, lessonId, score }) {
    const { data, error } = await supabase.rpc('complete_lesson', {
      p_user_id: userId,
      p_lesson_id: lessonId,
      p_score: score,
    })

    if (error) throw error
    return Array.isArray(data) ? data[0] : data
  },

  async getCourseXP(userId, courseId) {
    const [{ data: logs, error: logsError }, { data: course, error: courseError }] = await Promise.all([
      supabase.from('user_xp_logs').select('xp_earned').eq('user_id', userId).eq('course_id', courseId),
      supabase.from('courses').select('total_xp').eq('id', courseId).single(),
    ])

    if (logsError) throw logsError
    if (courseError) throw courseError
    return {
      earnedXP: (logs ?? []).reduce((total, log) => total + (log.xp_earned ?? 0), 0),
      totalXP: course.total_xp ?? 0,
    }
  },

  subscribeToCourseXP({ userId, courseId, onChange }) {
    return supabase
      .channel(`course-xp:${userId}:${courseId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'user_xp_logs', filter: `user_id=eq.${userId}`,
      }, (payload) => {
        if (payload.new.course_id === courseId) onChange()
      })
      .subscribe()
  },

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
