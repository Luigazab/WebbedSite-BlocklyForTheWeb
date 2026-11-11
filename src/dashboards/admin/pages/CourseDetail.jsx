import StatCard from '../../../components/common/StatCard';
import TopicPublicationButton from '../../../components/shared/TopicPublicationButton';
import TopicSettingsModal from '../../../components/shared/TopicSettingsModal';
import ClassroomBadgesPanel from '../../teacher/components/ClassroomBadgesPanel';
import DeleteModal from '#components/ui/DeleteModal';
import { useParams, Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/supabaseClient";
import { AppBreadcrumb } from "#components/common/breadcrumb";
import { Button } from "#components/ui/button";
import { Plus, ChevronDown, Settings2, Trash2, Layers, BookOpen, Users, Calendar } from "lucide-react";
import { LessonTypeBadge } from "#components/common/LessonChip";
import { lessonTypeMeta } from "#lib/lesson-type";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "#components/ui/dropdown-menu";
import { coursePreviewPath } from '@/utils/lessonRoutes';

export default function CourseDetail({ readOnly = false }) {
  const basePath = readOnly ? "/teacher" : "/admin";
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  
  // Topic creation & edit modal states
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [activeConfigureTopic, setActiveConfigureTopic] = useState(null);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicDescription, setNewTopicDescription] = useState("");

  // Reusable DeleteModal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'topic' | 'lesson', id, title }
  const [deleteLoading, setDeleteLoading] = useState(false);

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
              topic_track, 
              required_for_topic, 
              expected_minutes,
              slug,
              order,
              is_published,
              created_at
            )
          )
        `)
        .is('topics.classroom_id', null)
        .is('topics.lessons.classroom_id', null)
        .eq('id', id)
        .single();

      if (courseError || !courseData) {
        console.error('Course not found');
        navigate(basePath + '/courses');
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
                topic_track: lesson.topic_track || 'core',
                required_for_topic: lesson.required_for_topic,
                expected_minutes: lesson.expected_minutes || 15,
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
      navigate(basePath + '/courses');
    } finally {
      setLoading(false);
    }
  };

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

      const { error } = await supabase
        .from('topics')
        .insert([{
          course_id: course.id,
          title: newTopicTitle.trim(),
          description: newTopicDescription.trim() || '',
          slug: slug || 'untitled-topic',
          order: course.topics.length + 1,
          is_published: false
        }]);

      if (error) throw error;

      await refreshCourse();
      setNewTopicTitle("");
      setNewTopicDescription("");
      setIsAddingTopic(false);
    } catch (error) {
      console.error('Error adding topic:', error);
    }
  };

  // Open delete modal for a topic
  const requestDeleteTopic = (topic) => {
    setDeleteTarget({
      type: 'topic',
      id: topic.id,
      title: topic.title,
      dialogTitle: 'Delete Topic',
      message: 'Are you sure you want to delete? Deleting will also remove the following:\n• Lessons under this topic\n• Student progress (if the topic is cloned/created in a classroom).',
      confirmText: 'Delete Topic',
    });
    setDeleteModalOpen(true);
  };

  // Open delete modal for a lesson
  const requestDeleteLesson = (lesson) => {
    setDeleteTarget({
      type: 'lesson',
      id: lesson.id,
      title: lesson.title,
      dialogTitle: 'Delete Lesson',
      message: `Are you sure you want to delete the lesson "${lesson.title}"? This action cannot be undone.`,
      confirmText: 'Delete Lesson',
    });
    setDeleteModalOpen(true);
  };

  // Execute deletion based on deleteTarget
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setDeleteLoading(true);
    try {
      if (deleteTarget.type === 'topic') {
        const { error } = await supabase
          .from('topics')
          .delete()
          .eq('id', deleteTarget.id);
        if (error) throw error;
      } else if (deleteTarget.type === 'lesson') {
        const { error } = await supabase
          .from('lessons')
          .delete()
          .eq('id', deleteTarget.id);
        if (error) throw error;
      }

      setDeleteModalOpen(false);
      setDeleteTarget(null);
      await refreshCourse();
    } catch (error) {
      console.error(`Error deleting ${deleteTarget?.type}:`, error);
      alert(error.message || `Failed to delete ${deleteTarget?.type}.`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const publishChanges = async () => {
    try {
      setIsPublishing(true);
      const { error } = await supabase.rpc('publish_course_template', { p_course: id });
      if (error) throw error;
      await refreshCourse();
      alert('Changes published successfully!');
    } catch (error) {
      console.error('Error publishing changes:', error);
      alert(error.message || 'Could not publish this template.');
    } finally {
      setIsPublishing(false);
    }
  };

  useEffect(() => {
    if (id) fetchCourse();
  }, [id]);

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

  if (!course) return null;

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="formalPlain" onClick={refreshCourse}>
            Refresh
          </Button>
          {!readOnly && (
            <Button variant="formalPrimary" onClick={publishChanges} disabled={isPublishing}>
              {isPublishing ? 'Publishing...' : 'Publish changes'}
            </Button>
          )}
        </div>
      </div>

      {/* Header Info */}
      <header className="rounded-2xl border border-border bg-card p-8 shadow-xs">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Course
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight tracking-tight text-balance">
          {course.title}
        </h1>
        <p className="mt-3 max-w-2xl text-pretty text-muted-foreground">{course.description}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Layers} label="Topics" value={course.topics.length} />
          <StatCard icon={BookOpen}
            label="Lessons"
            value={course.topics.reduce((n, t) => n + t.lessons.length, 0)}
          />
          <StatCard icon={Users} label="Enrolled" value={course.enrollments.toLocaleString()} />
          <StatCard icon={Calendar} label="Created" value={course.updatedAt} />
        </div>
      </header>

      {/* Topics Curriculum */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold">Topics & Curriculum</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage learning modules, progression tracks, and lesson order.
            </p>
          </div>
          {!readOnly && (
            <Button variant="formalPlain" onClick={() => setIsAddingTopic(true)}>
              <Plus className="size-4 mr-1" /> Add topic
            </Button>
          )}
        </div>

        {/* Add Topic Drawer */}
        {!readOnly && isAddingTopic && (
          <div className="mb-6 rounded-2xl border border-primary/30 bg-primary/5 p-6 shadow-xs animate-in fade-in duration-200">
            <h3 className="font-display text-base font-bold mb-3 text-foreground">Create New Topic</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Title *</label>
                <input
                  type="text"
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="e.g. Fundamental Syntax"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Description</label>
                <textarea
                  value={newTopicDescription}
                  onChange={(e) => setNewTopicDescription(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="Brief summary of topic content"
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="formalPrimary" onClick={addTopic}>
                  Create Topic
                </Button>
                <Button variant="formalPlain" onClick={() => setIsAddingTopic(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        <ol className="space-y-4">
          {!readOnly && (
            <ClassroomBadgesPanel
              templateCourseId={id}
              courses={[{ course_id: id, courses: { title: course.title } }]}
              topics={course.topics.map(topic => ({ ...topic, courseId: id }))}
            />
          )}

          {course.topics.map((t, i) => (
            <li
              key={t.id}
              className="rounded-2xl border border-border bg-card p-6 shadow-xs hover:shadow-md transition-shadow duration-200"
            >
              {/* Topic Header Row */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 font-mono text-sm font-bold text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground">{t.title}</h3>
                    {t.description && (
                      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                        {t.description}
                      </p>
                    )}
                    <div className="mt-2.5 flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        t.is_published 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      }`}>
                        {t.is_published ? 'Published' : 'Draft'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        • {t.lessons.length} {t.lessons.length === 1 ? 'lesson' : 'lessons'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Topic Actions */}
                <div className="flex items-center gap-2">
                  {!readOnly && (
                    <>
                      {/* Open Settings Modal Button */}
                      <Button
                        variant="formalPlain"
                        size="sm"
                        onClick={() => setActiveConfigureTopic(t)}
                        className="flex items-center gap-1.5 text-xs"
                      >
                        <Settings2 className="size-3.5" />
                        Configure Topic
                      </Button>

                      <TopicPublicationButton
                        topicId={t.id}
                        published={t.is_published}
                        onChanged={(updated) =>
                          setCourse((current) => ({
                            ...current,
                            topics: current.topics.map((topic) =>
                              topic.id === updated.id ? { ...topic, is_published: updated.is_published } : topic
                            ),
                          }))
                        }
                      />

                      {/* Trigger Topic DeleteModal */}
                      <button
                        onClick={() => requestDeleteTopic(t)}
                        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        title="Delete Topic"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Lessons List in Topic Card */}
              <ul className="mt-5 divide-y divide-border rounded-xl border border-border overflow-hidden bg-background">
                {t.lessons.length === 0 ? (
                  <li className="px-4 py-6 text-center text-xs text-muted-foreground">
                    No lessons in this topic yet.
                  </li>
                ) : (
                  t.lessons.map((l) => (
                    <li key={l.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                      <LessonTypeBadge type={l.type} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground truncate">{l.title}</p>
                          {l.required_for_topic && (
                            <span className="text-[10px] font-semibold uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                              Required
                            </span>
                          )}
                          {l.topic_track && l.topic_track !== 'core' && (
                            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded capitalize text-muted-foreground">
                              {l.topic_track} track
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {lessonTypeMeta[l.type]?.label || l.type} · {l.base_xp} XP · ~{l.expected_minutes || 15}m
                          {l.is_published ? ' · Published' : ' · Draft'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7 px-2.5 text-muted-foreground hover:text-foreground"
                          onClick={() =>
                            navigate(
                              readOnly
                                ? coursePreviewPath(id, course.slug, l.slug)
                                : `/admin/${l.type}/edit/${l.id}`
                            )
                          }
                        >
                          {readOnly ? "View" : "Edit"}
                        </Button>
                        {!readOnly && (
                          /* Trigger Lesson DeleteModal */
                          <button
                            className="p-1 text-muted-foreground hover:text-destructive rounded transition-colors"
                            onClick={() => requestDeleteLesson(l)}
                            title="Delete lesson"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </li>
                  ))
                )}

                {!readOnly && (
                  <li className="px-4 py-2.5 bg-muted/20 border-t border-border">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="formalPlain" size="sm" className="text-xs">
                          <Plus className="size-3.5 mr-1" /> Add lesson <ChevronDown className="size-3.5 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {["lecture", "quiz", "tutorial", "laboratory"].map((type) => (
                          <DropdownMenuItem
                            key={type}
                            onSelect={() =>
                              navigate(`/admin/${type}/create?topicId=${encodeURIComponent(t.id)}`)
                            }
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>
                )}
              </ul>
            </li>
          ))}
        </ol>
      </div>

      {/* Edit Topic & Progression Modal */}
      <TopicSettingsModal
        isOpen={Boolean(activeConfigureTopic)}
        topic={activeConfigureTopic}
        onClose={() => setActiveConfigureTopic(null)}
        onSaved={refreshCourse}
      />

      {/* Reusable Delete Modal for Topic or Lesson */}
      {!readOnly && (
        <DeleteModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setDeleteTarget(null);
          }}
          onConfirm={handleDeleteConfirm}
          title={deleteTarget?.dialogTitle || "Confirm Deletion"}
          message={deleteTarget?.message || "Are you sure you want to delete this item?"}
          confirmText={deleteTarget?.confirmText || "Delete"}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
