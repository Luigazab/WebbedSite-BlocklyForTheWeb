import { Button } from "#components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "#components/ui/dropdown-menu";
import { useClassroom } from "#hooks/useClassroom";
import { useCurriculum } from "#hooks/useCurriculum";
import { useTeacherOverview } from "#hooks/useTeacherOverview";
import { useAuthStore } from "@/store/authStore";
import { useCopyCode } from "@/utils/copyCode";
import { formatTimeAgo } from "@/utils/dateFormat";
import { Activity, Award, BookOpen, ClipboardCheck, FlaskConical, Loader2, Megaphone, MonitorPlay, Plus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import LessonDetailsModal from "../components/LessonDetailsModal";
import AssignCurriculumModal from "../components/AssignCurriculumModal";
import ClassroomBadgesPanel from '../components/ClassroomBadgesPanel';
import PostFeed from '../../../components/shared/PostFeed';
import useClassroomLivePosts from '../../../hooks/useClassroomLivePosts';
import ClassroomStudentsPanel from '../components/ClassroomStudentsPanel';
import StudentProgressModal from '../components/StudentProgressModal';
import ClassroomCurriculum from '../../../components/classroom/ClassroomCurriculum';
import CourseTopicsModal from '../components/CourseTopicsModal';
import TopicProgressionModal from '../components/TopicProgressionModal';

const dropdownItems = [
  {title: 'Lecture',    icon:BookOpen,        to:'/teacher/lecture/create'   },
  {title: 'Quiz',       icon:ClipboardCheck,  to:'/teacher/quiz/create'      },
  {title: 'Tutorial',   icon:MonitorPlay,     to:'/teacher/tutorial/create'  },
  {title: 'Laboratory', icon:FlaskConical,    to:'/teacher/laboratory/create'},
]
const tabs = [
  { id: 'activities', label: 'Activities', icon: Activity },
  { id: 'badges', label: 'Badges', icon: Award },
  { id: 'feed', label: 'Classroom Posts', icon: Activity },
  { id: 'students', label: 'Students', icon: Users },
]
export default function ClassroomDetail() {
  const navigate = useNavigate();
  const { classroomId } = useParams();
  useClassroomLivePosts(classroomId);
  const profile = useAuthStore((s) => s.profile);
  const [activeTab, setActiveTab] = useState('activities');
  const {copied, copyCode} = useCopyCode()
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [topicGroup, setTopicGroup] = useState(null)
  const [progressionTopic, setProgressionTopic] = useState(null)

  const { currentClassroom, detailLoading, classroomPosts, fetchClassroomDetail, fetchClassroomPosts, handleCreatePost, handleLikePost, handleCommentOnPost, fetchMoreClassroomPosts, handleRegenerateCode, hasMorePosts, postsLoading } = useClassroom();

  const { classroomCourses, topics, loading: curriculumLoading, assigning, masterCourses, fetchMasterCourses, handleAssignCourses, fetchClassroomCurriculum, handleUnlockTopic } = useCurriculum();

  const { studentProgress, lessonCompletion, loading: overviewLoading, fetchOverview } = useTeacherOverview();

  useEffect(() => {
    if (!classroomId) return
    fetchClassroomDetail(classroomId)
    fetchClassroomCurriculum(classroomId)
    fetchOverview(classroomId)
    fetchClassroomPosts(classroomId)
    fetchMasterCourses()
  }, [classroomId]);

  const refreshClassroom = async () => {
    await Promise.all([fetchClassroomCurriculum(classroomId), fetchOverview(classroomId)])
  }

  const onAssignSubmit = async ({ course_ids }) => {
    await handleAssignCourses(classroomId, course_ids)
    setShowAssignModal(false)
  }

  const onNewAnnouncement = async () => {
    const content = window.prompt('Announcement text?')
    if (!content) return
    await handleCreatePost({ classroomId, type: 'announcement', content })
  }

  const initialLoading = detailLoading && !currentClassroom;
  const recentActivity = classroomPosts.filter((p) => p.type !== 'announcement').slice(0, 4);

  if (initialLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
      </div>
    )
  }

  return(
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <section className="relative overflow-hidden rounded-3xl border border-border border-b-4 border-b-slate-400 shadow bg-[url('/classroom_bg.png')] bg-cover p-8 text-sky-800">
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-balance md:text-4xl">
              {currentClassroom?.name}
            </h1>
            <p className="mt-3 max-w-lg text-pretty text-sm text-muted-foreground md:text-base">
              {currentClassroom?.description}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <img src={currentClassroom?.teacher?.avatar_url || "/default-avatar.png"} alt="teacher picture" className="w-10 h-10 rounded-full object-cover object-center" />
              <div>
                <p className="text-sm font-semibold text-gray-600">{currentClassroom?.teacher?.username}</p>
                <p className="text-xs border border-cyan-700 bg-cyan-50 text-cyan-500 rounded-full px-2 w-fit">Teacher</p>
              </div>
            </div>
          </div>
          <div className="flex items-end gap-3 rounded-xl border border-border/60 bg-slate-50/70 px-4 py-3 backdrop-blur shadow">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Join code
              </p>
              <p className="mt-1 font-display text-2xl font-semibold">
                {currentClassroom?.join_code}
              </p>
            </div>
            {copied
            ? <Button onClick={() => ( copyCode(currentClassroom?.join_code || ''))} title="copy join code" className="rounded-md text-xs px-1">
                Code copied
              </Button>
            : <Button onClick={() => ( copyCode(currentClassroom?.join_code || ''))} title="copy join code" className="rounded-md text-xs px-1">
                Copy Invite
              </Button>
          }
          </div>
        </div>
      </section>


      <div className="border-b border-border">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative
                  ${isActive 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      {activeTab === 'activities' && (
        <section className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-4 xl:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">Curriculum</h2>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="default" size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Create New
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-auto min-w-0">
                    {dropdownItems.map((item) => {
                      const Icon = item.icon
                      return <DropdownMenuItem key={item.title} className="gap-2 hover:cursor-pointer" onClick={() => navigate(item.to + "?classroomId=" + encodeURIComponent(classroomId))}>
                        <Icon className="w-4 h-4" />
                        {item.title}
                      </DropdownMenuItem>
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
 
            {!curriculumLoading && classroomCourses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center space-y-3">
                <p className="font-medium">This classroom doesn't have a curriculum yet.</p>
                <Button onClick={() => setShowAssignModal(true)}>Assign Curriculum</Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setShowAssignModal(true)}>
                Manage Courses ({classroomCourses.length}/4)
              </Button>
            )}
 
            {curriculumLoading && (
              <div className="flex justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
              </div>
            )}
 
            {!curriculumLoading && <ClassroomCurriculum
              classroomId={classroomId} courses={classroomCourses} topics={topics} teacher
              lessonCompletion={lessonCompletion} onEditTopics={setTopicGroup}
              onConfigureTopic={setProgressionTopic} onUnlockTopic={handleUnlockTopic}
              onSelectLesson={(lesson, topic) => setSelectedLesson({ lesson, topic, classroomId })}
            />}
          </div>
          <aside className="space-y-4">
            <div className="rounded-2xl border border-b-3 shadow border-border border-b-slate-400 bg-card p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">Student progress</h3>
                <button className="text-xs text-primary hover:underline" onClick={() => setActiveTab('students')}>View all</button>
              </div>
              <ul className="mt-4 space-y-3">
                {overviewLoading && studentProgress.length === 0 && (
                  <li className="flex justify-center py-4">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-300" />
                  </li>
                )}
                {studentProgress.slice(0, 5).map((s) => (
                  <li key={s.studentId} className="flex items-center gap-3">
                    <img src={s.avatarUrl || "/default-avatar.png"} alt={s.username} className="w-8 h-8 rounded-full object-cover object-center" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="truncate font-medium">{s.username}</span>
                        <span className="font-mono text-[11px] text-muted-foreground">{s.progressPct}%</span>
                      </div>
                      <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${s.progressPct}%` }} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-b-3 shadow border-border border-b-slate-400 bg-card p-5">
              <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">Recent Activity</h3>
              <ul className="mt-4 space-y-3 text-sm">
                {recentActivity.length === 0 && (
                  <li className="text-xs text-muted-foreground">No recent activity yet.</li>
                )}
                {recentActivity.map((post) => (
                  <ActivityItem
                    key={post.id}
                    tone={post.type === 'quiz_scored' ? 'success' : post.type === 'laboratory_completed' ? 'primary' : 'muted'}
                    name={post.author?.username ?? 'A student'}
                    verb=""
                    thing={post.content}
                    when={formatTimeAgo(post.created_at)}
                  />
                ))}
              </ul>
            </div>
          </aside>
        </section>
      )}
 
      {activeTab === 'badges' && <ClassroomBadgesPanel key={classroomId} classroomId={classroomId} courses={classroomCourses} topics={topics} onAwarded={() => fetchClassroomPosts(classroomId)} />}
      {activeTab === 'feed' && <div className="space-y-4">
        <div className="flex items-center justify-between"><h2 className="text-xl font-semibold">Classroom Posts</h2><Button size="sm" className="gap-2" onClick={onNewAnnouncement}><Megaphone size={16} />New Announcement</Button></div>
        <PostFeed posts={classroomPosts} currentUserId={profile?.id} onLike={handleLikePost} onComment={handleCommentOnPost} onLoadMore={() => fetchMoreClassroomPosts(classroomId)} hasMore={hasMorePosts} loading={postsLoading} />
      </div>}
      {activeTab === 'students' && <ClassroomStudentsPanel students={studentProgress} loading={overviewLoading} onSelect={student => setSelectedStudent({ ...student, classroomId })} />}
      {selectedStudent?.classroomId === classroomId && selectedStudent && <StudentProgressModal key={selectedStudent.studentId} classroomId={classroomId} student={selectedStudent} onClose={() => setSelectedStudent(null)} onGraded={() => fetchOverview(classroomId)} />}
      {selectedLesson && selectedLesson.classroomId === classroomId && <LessonDetailsModal
        key={selectedLesson.lesson.id}
        classroomId={classroomId}
        lesson={selectedLesson.lesson}
        topic={selectedLesson.topic}
        onClose={() => setSelectedLesson(null)}
      />}

      {topicGroup && <CourseTopicsModal key={topicGroup.courseId} classroomId={classroomId} group={topicGroup} onClose={() => setTopicGroup(null)} onSaved={refreshClassroom} />}
      {progressionTopic && <TopicProgressionModal key={progressionTopic.id} classroomId={classroomId} topic={progressionTopic} topics={topics} courses={classroomCourses} onClose={() => setProgressionTopic(null)} onSaved={refreshClassroom} />}

      {showAssignModal && (
        <AssignCurriculumModal
          classroom={currentClassroom}
          courses={masterCourses}
          assignedCourses={classroomCourses.map((cc) => cc.courses)}
          loading={assigning}
          onSubmit={onAssignSubmit}
          onClose={() => setShowAssignModal(false)}
          handleRegenerate={() => handleRegenerateCode(classroomId)}
        />
      )}
    </div>
  )
}

function ActivityItem({ name, verb, thing, when, tone }) {
  const dot =
    tone === "success" ? "bg-green-700"
    : tone === "warning" ? "bg-amber-500"
    : tone === "muted" ? "bg-muted-foreground"
    : "bg-primary";
  return (
    <li className="flex items-start gap-3">
      <span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${dot}`} />
      <p className="min-w-0 flex-1">
        <span className="font-medium">{name}</span>{" "}
        <span className="text-muted-foreground">{verb}</span>{" "}
        <span className="font-medium">{thing}</span>
        <span className="ml-2 text-[11px] text-muted-foreground">{when}</span>
      </p>
    </li>
  );
}
