import { supabase } from '@/supabaseClient';

export const teacherService = {
  async getTeacherClassrooms(teacherId) {
    const { data: classrooms, error } = await supabase
      .from('classrooms')
      .select(`
        *,
        classroom_members!inner (
          student_id,
          profiles!inner (
            id,
            username,
            email,
            avatar_url
          )
        ),
        classroom_courses (
          courses!inner (
            id,
            title,
            description,
            color
          )
        )
      `)
      .eq('teacher_id', teacherId)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching classrooms:', error);
      throw error;
    }

    // Transform and aggregate data
    return classrooms.map((classroom) => {
      const studentCount = classroom.classroom_members?.length || 0;
      const averageProgress = 0; // You'll need to compute this from user_lesson_progress
      const pendingSubmissions = 0; // You'll need to compute this from quiz_attempts or similar

      return {
        ...classroom,
        studentCount,
        averageProgress,
        pendingSubmissions,
        code: classroom.join_code || 'N/A',
        section: classroom.description || 'No section',
        courseTitle: classroom.classroom_courses?.[0]?.courses?.title || 'No course assigned',
      };
    });
  },

  // Get students for a classroom
  async getClassroomStudents(classroomId) {
    const { data: members, error } = await supabase
      .from('classroom_members')
      .select(`
        student_id,
        profiles!inner (
          id,
          username,
          email,
          bio,
          avatar_url,
          role,
          created_at
        )
      `)
      .eq('classroom_id', classroomId);

    if (error) {
      console.error('Error fetching classroom students:', error);
      throw error;
    }

    return members.map((member) => ({
      ...member.profiles,
    }));
  },

  // Get announcements for a teacher's classrooms
  async getTeacherAnnouncements(teacherId) {
    // First get all classrooms for this teacher
    const { data: classrooms, error: classroomsError } = await supabase
      .from('classrooms')
      .select('id')
      .eq('teacher_id', teacherId);

    if (classroomsError) {
      console.error('Error fetching classrooms for announcements:', classroomsError);
      throw classroomsError;
    }

    const classroomIds = classrooms.map(c => c.id);

    // If no classrooms, return empty array
    if (classroomIds.length === 0) {
      return [];
    }

    // Then get announcements for these classrooms
    // Fix: Specify the foreign key relationship explicitly
    const { data: posts, error: postsError } = await supabase
      .from('classroom_posts')
      .select(`
        *,
        author:profiles!classroom_posts_author_id_fkey (
          username
        )
      `)
      .in('classroom_id', classroomIds)
      .eq('type', 'announcement')
      .order('created_at', { ascending: false })
      .limit(5);

    if (postsError) {
      console.error('Error fetching announcements:', postsError);
      throw postsError;
    }

    // Transform to match the expected structure
    return posts.map((post) => ({
      id: post.id,
      classroom_id: post.classroom_id,
      author_id: post.author_id,
      type: post.type,
      content: post.content,
      created_at: post.created_at,
      author_name: post.author?.username || 'Unknown',
      tag: post.type === 'urgent' ? 'urgent' : post.type === 'reminder' ? 'reminder' : 'info',
      title: post.content?.split('\n')[0] || 'Announcement',
      body: post.content || '',
      postedBy: post.author?.username || 'Unknown',
      postedAt: new Date(post.created_at).toLocaleDateString(),
    }));
  },

  // Alternative approach: Get announcements with a separate query
  async getTeacherAnnouncementsAlternative(teacherId) {
    // First get all classrooms for this teacher
    const { data: classrooms, error: classroomsError } = await supabase
      .from('classrooms')
      .select('id')
      .eq('teacher_id', teacherId);

    if (classroomsError) {
      console.error('Error fetching classrooms for announcements:', classroomsError);
      throw classroomsError;
    }

    const classroomIds = classrooms.map(c => c.id);

    if (classroomIds.length === 0) {
      return [];
    }

    // Get announcements
    const { data: posts, error: postsError } = await supabase
      .from('classroom_posts')
      .select('*')
      .in('classroom_id', classroomIds)
      .eq('type', 'announcement')
      .order('created_at', { ascending: false })
      .limit(5);

    if (postsError) {
      console.error('Error fetching announcements:', postsError);
      throw postsError;
    }

    // Get author names separately
    const authorIds = [...new Set(posts.map(p => p.author_id))];
    const { data: authors, error: authorsError } = await supabase
      .from('profiles')
      .select('id, username')
      .in('id', authorIds);

    if (authorsError) {
      console.error('Error fetching authors:', authorsError);
      throw authorsError;
    }

    // Create a map of author IDs to usernames
    const authorMap = {};
    authors.forEach(author => {
      authorMap[author.id] = author.username;
    });

    // Transform to match the expected structure
    return posts.map((post) => ({
      id: post.id,
      classroom_id: post.classroom_id,
      author_id: post.author_id,
      type: post.type,
      content: post.content,
      created_at: post.created_at,
      author_name: authorMap[post.author_id] || 'Unknown',
      tag: post.type === 'urgent' ? 'urgent' : post.type === 'reminder' ? 'reminder' : 'info',
      title: post.content?.split('\n')[0] || 'Announcement',
      body: post.content || '',
      postedBy: authorMap[post.author_id] || 'Unknown',
      postedAt: new Date(post.created_at).toLocaleDateString(),
    }));
  },

  // Get total students count across all classrooms
  async getTotalStudents(teacherId) {
    const { data: classrooms, error } = await supabase
      .from('classrooms')
      .select(`
        id,
        classroom_members!inner (student_id)
      `)
      .eq('teacher_id', teacherId);

    if (error) {
      console.error('Error fetching total students:', error);
      throw error;
    }

    // Count unique students across all classrooms
    const uniqueStudents = new Set();
    classrooms.forEach((classroom) => {
      classroom.classroom_members?.forEach((member) => {
        uniqueStudents.add(member.student_id);
      });
    });

    return uniqueStudents.size;
  },

  // Get total pending submissions
  async getTotalPendingSubmissions(teacherId) {
    // This is a simplified example - adjust based on your actual logic
    const { count, error } = await supabase
      .from('quiz_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (error) {
      console.error('Error fetching pending submissions:', error);
      return 0;
    }

    return count || 0;
  },

  // Get average progress across all students for a teacher
  async getAverageProgress(teacherId) {
    const { data: classrooms, error } = await supabase
      .from('classrooms')
      .select(`
        id,
        classroom_members!inner (
          student_id
        )
      `)
      .eq('teacher_id', teacherId);

    if (error) {
      console.error('Error fetching average progress:', error);
      return 0;
    }

    // Get all student IDs
    const studentIds = new Set();
    classrooms.forEach((classroom) => {
      classroom.classroom_members?.forEach((member) => {
        studentIds.add(member.student_id);
      });
    });

    if (studentIds.size === 0) return 0;

    // Get progress for all students
    const { data: progress, error: progressError } = await supabase
      .from('user_progress')
      .select('current_xp, total_xp')
      .in('user_id', Array.from(studentIds));

    if (progressError) {
      console.error('Error fetching student progress:', progressError);
      return 0;
    }

    // Calculate average progress
    const avgProgress = progress.reduce((acc, curr) => {
      const percentage = curr.total_xp > 0 
        ? (curr.current_xp / curr.total_xp) * 100 
        : 0;
      return acc + percentage;
    }, 0) / (progress.length || 1);

    return Math.round(avgProgress);
  },
};