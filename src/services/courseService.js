/**
 * Create check createCourse, uploads image as well the same time its created, wont fail if no image
 * Read check getCourses and getCoursesById
 * Update check updateCourse
 * Delete check deleteCourse
 * 
 * 
 * CREATE TABLE public.courses (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    title text,
    description text,
    color text,
    image_src text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    order smallint GENERATED ALWAYS AS IDENTITY NOT NULL,
    slug text NOT NULL UNIQUE,
    total_xp bigint NOT NULL DEFAULT '3000'::bigint,
    CONSTRAINT courses_pkey PRIMARY KEY (id)
  );
 */
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
  },

  async createCourse(title, description, color, image){
    let imagePath = null;
    if (image){
      const file = `${Date.now()}-${image.name}`;
      const { error: uploadError} = await supabase
        .storage
        .from('system-images')
        .upload(`course-images/${file}`, image);
      if (uploadError) throw uploadError;
  
      imagePath = `system-images/course-images/${file}`;
    }

    const { data, error } = await supabase
      .from('courses')
      .insert([{title, description, color, image_src: imagePath}])
      .select();
    if (error) {
      await supabase.storage.from('system-images').remove(`course-images/${file}`);
      throw error
    }
    return data;
  },

  async updateCourse(courseId, updates, newImage) {
    let imagePath = updates.image_src || null;

    if (newImage) {
      const fileName = `${Date.now()}-${newImage.name}`;

      const { error: uploadError } = await supabase
        .storage
        .from('system-images')
        .upload(`course-images/${fileName}`, newImage);

      if (uploadError) throw uploadError;

      imagePath = `system-images/course-images/${fileName}`;

      if (updates.old_image_src) {
        const relativePath = updates.old_image_src.replace('system-images/', '');
        await supabase.storage.from('system-images').remove([relativePath]);
      }
    }

    const { data, error } = await supabase
      .from('courses')
      .update({
        title: updates.title, 
        description: updates.description, 
        color: updates.color, 
        image_src: imagePath, 
        order: updates.order, 
        total_xp: updates.total_xp, 
      })
      .eq('id', courseId)
      .select();
      
    if (error) throw error;
    return data;
  },

  async getCourses(page = 1, pageSize = 15) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
      .from("course_with_counts")
      .select("*")
      .order("order", { ascending: true })
      .range(from, to);

    if (error) throw error;
    return data;
  },

  
  async getCourseById(courseId) {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCourse(courseId){
    const { data: course, error: fetchError } = await supabase
      .from('courses')
      .select('image_src')
      .eq("id", courseId)
      .single();
    if (fetchError) throw fetchError;
    
    const { error: deleteError } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId)
    if (deleteError) throw deleteError;

    if (course?.image_src) {
      const relativePath = course.image_src.replace('system-images/', "");
      await supabase.storage.from('system-images').remove([relativePath]);
    }

    return true;
  }
};