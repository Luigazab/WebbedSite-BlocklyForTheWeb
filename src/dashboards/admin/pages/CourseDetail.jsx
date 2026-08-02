import { useParams, Link, useNavigate } from "react-router"; // Note: import from react-router, not the file-based router
import { useState, useEffect } from "react";
import { supabase } from "@/supabaseClient";
import { AppBreadcrumb } from "#components/common/breadcrumb";
import { Button } from "#components/ui/button";
import { Plus } from "lucide-react";
import { LessonTypeBadge } from "#components/common/LessonChip";
import { lessonTypeMeta } from "#lib/lesson-type";


export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isEditingTopic, setIsEditingTopic] = useState(null);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicDescription, setNewTopicDescription] = useState("");

  const fetchCourse = async () => {
    try {
      setLoading(true);
      
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          description,
          slug,
          total_xp,
          created_at,
          topics:topics(
            id,
            title,
            description,
            order,
            is_published,
            lessons:lessons(
              id,
              title,
              type,
              base_xp,
              slug,
              order,
              is_published,
              created_at
            )
          )
        `)
        .eq('id', id)
        .single();

      if (courseError || !courseData) {
        console.error('Course not found');
        navigate('/admin/courses'); // Redirect to courses list if not found
        return;
      }

      const { count: enrollmentCount } = await supabase
        .from('classroom_courses')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', id);

      const transformedCourse = {
        id: courseData.id,
        title: courseData.title || 'Untitled Course',
        description: courseData.description || '',
        slug: courseData.slug || '',
        code: courseData.slug?.toUpperCase().slice(0, 6) || 'COURSE',
        category: 'General',
        total_xp: courseData.total_xp || 3000,
        created_at: courseData.created_at,
        topics: (courseData.topics || [])
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((topic) => ({
            id: topic.id,
            title: topic.title || 'Untitled Topic',
            description: topic.description || '',
            order: topic.order || 0,
            is_published: topic.is_published || false,
            lessons: (topic.lessons || [])
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((lesson) => ({
                id: lesson.id,
                title: lesson.title || 'Untitled Lesson',
                type: lesson.type || 'lecture',
                base_xp: lesson.base_xp || 50,
                slug: lesson.slug || '',
                order: lesson.order || 0,
                is_published: lesson.is_published || false,
                created_at: lesson.created_at
              }))
          })),
        enrollments: enrollmentCount || 0,
        updatedAt: new Date(courseData.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      };

      setCourse(transformedCourse);
    } catch (error) {
      console.error('Error fetching course:', error);
      navigate('/admin/courses');
    } finally {
      setLoading(false);
    }
  };

  // Refresh course data (for updates after mutations)
  const refreshCourse = async () => {
    await fetchCourse();
  };

  // Add new topic
  const addTopic = async () => {
    if (!newTopicTitle.trim()) return;

    try {
      const slug = newTopicTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const { data, error } = await supabase
        .from('topics')
        .insert([{
          course_id: course.id,
          title: newTopicTitle,
          description: newTopicDescription || '',
          slug: slug || 'untitled-topic',
          order: course.topics.length + 1,
          is_published: false
        }])
        .select();

      if (error) throw error;

      await refreshCourse();
      setNewTopicTitle("");
      setNewTopicDescription("");
      setIsEditingTopic(null);
    } catch (error) {
      console.error('Error adding topic:', error);
    }
  };

  // Delete topic
  const deleteTopic = async (topicId) => {
    if (!confirm('Are you sure you want to delete this topic and all its lessons?')) return;

    try {
      const { error } = await supabase
        .from('topics')
        .delete()
        .eq('id', topicId);

      if (error) throw error;
      await refreshCourse();
    } catch (error) {
      console.error('Error deleting topic:', error);
    }
  };

  // Add lesson to topic
  const addLesson = async (topicId) => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .insert([{
          topics_id: topicId,
          title: 'New Lesson',
          type: 'lecture',
          slug: `new-lesson-${Date.now()}`,
          order: (course.topics.find(t => t.id === topicId)?.lessons.length || 0) + 1,
          is_published: false,
          base_xp: 50
        }])
        .select();

      if (error) throw error;
      await refreshCourse();
    } catch (error) {
      console.error('Error adding lesson:', error);
    }
  };

  // Delete lesson
  const deleteLesson = async (lessonId) => {
    if (!confirm('Delete this lesson?')) return;
    
    try {
      await supabase.from('lessons').delete().eq('id', lessonId);
      await refreshCourse();
    } catch (error) {
      console.error('Error deleting lesson:', error);
    }
  };

  // Publish changes
  const publishChanges = async () => {
    try {
      setIsPublishing(true);
      await refreshCourse();
      alert('Changes published successfully!');
    } catch (error) {
      console.error('Error publishing changes:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  // Fetch course on mount and when ID changes
  useEffect(() => {
    if (id) {
      fetchCourse();
    }
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading course...</p>
        </div>
      </div>
    );
  }

  // If course is null (not found), show nothing (redirect will happen)
  if (!course) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <AppBreadcrumb
          items={[
            { label: 'Home', href: '/admin/' },
            { label: 'Courses', href: '/admin/courses' },
            { label: course.title, href: '#' },
          ]}
        />
        <div className="flex gap-2">
          <Button variant="formalPlain" onClick={refreshCourse}>
            Refresh
          </Button>
          <Button variant="formalPrimary" onClick={publishChanges} disabled={isPublishing}>
            {isPublishing ? 'Publishing...' : 'Publish changes'}
          </Button>
        </div>
      </div>

      <header className="rounded-2xl border border-border bg-card p-8 shadow">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Course
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight tracking-tight text-balance">
          {course.title}
        </h1>
        <p className="mt-3 max-w-2xl text-pretty text-muted-foreground">{course.description}</p>
        <div className="mt-6 flex flex-wrap gap-8 text-sm">
          <Stat label="Topics" value={course.topics.length} />
          <Stat
            label="Lessons"
            value={course.topics.reduce((n, t) => n + t.lessons.length, 0)}
          />
          <Stat label="Enrolled" value={course.enrollments.toLocaleString()} />
          <Stat label="Created" value={course.updatedAt} />
          {/* <Stat label="Total XP" value={course.total_xp.toLocaleString()} /> */}
        </div>
      </header>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Topics</h2>
          <Button variant="formalPlain" onClick={() => setIsEditingTopic('new')}>
            <Plus/> Add topic
          </Button>
        </div>

        {/* Add Topic Form */}
        {isEditingTopic === 'new' && (
          <div className="mb-4 rounded-2xl border border-border bg-card p-6">
            <h3 className="font-display text-lg font-bold mb-4">New Topic</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                  placeholder="Enter topic title"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newTopicDescription}
                  onChange={(e) => setNewTopicDescription(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                  placeholder="Enter topic description"
                  rows={2}
                />
              </div>
              <div className="flex gap-3">
                <Button variant="formalPrimary" onClick={addTopic}>
                  Create Topic
                </Button>
                <Button variant="formalPlain" onClick={() => setIsEditingTopic(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        <ol className="space-y-4">
          {course.topics.map((t, i) => (
            <li
              key={t.id}
              className="rounded-2xl border border-border bg-card p-6 transition-shadow! shadow hover:shadow-md"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="grid size-10 place-items-center rounded-lg bg-primary/10 font-mono text-sm font-bold text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold">{t.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
                    {/* <div className="mt-2 flex gap-2 text-xs">
                      <span className={`px-2 py-0.5 rounded-full ${t.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {t.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div> */}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{t.lessons.length} lessons</span>
                  <button 
                    className="rounded-md border border-border px-2 py-1 hover:bg-muted transition-colors"
                    onClick={() => deleteTopic(t.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <ul className="mt-5 divide-y divide-border rounded-xl border border-border">
                {t.lessons.map((l) => (
                  <li key={l.id} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/20 transition-colors">
                    <LessonTypeBadge type={l.type} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{l.title}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {lessonTypeMeta[l.type]?.label || l.type} · {l.base_xp} XP
                        {l.is_published ? ' · Published' : ' · Draft'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => console.log('Edit lesson:', l.id)}
                      >
                        Edit
                      </button>
                      <button 
                        className="text-xs text-red-500 hover:text-red-700 transition-colors"
                        onClick={() => deleteLesson(l.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
                <li className="px-4 py-2 text-center">
                  <button 
                    className="flex text-center text-xs font-medium text-primary hover:underline transition-colors"
                    onClick={() => addLesson(t.id)}
                  >
                    <Plus size={14}/> Add lesson
                  </button>
                </li>
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-xl font-extrabold">{value}</p>
    </div>
  );
}