import { createElement, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { Activity, ArrowLeft, BookOpen, Loader2, Users } from 'lucide-react'
import PageWrapper from '../../../components/layout/PageWrapper'
import StudentClassroomActivities from '../components/StudentClassroomActivities'
import PostFeed from '../../../components/shared/PostFeed'
import { useAuthStore } from '../../../store/authStore'
import { useClassroomStore } from '../../../store/classroomStore'
import useClassroomLivePosts from '../../../hooks/useClassroomLivePosts'
import ClassroomMembersPanel from '../components/ClassroomMembersPanel'
import { useCopyCode } from '@/utils/copyCode'
import { Button } from '#components/ui/button'

const tabs = [
  { id: 'learning', label: 'Learning', icon: BookOpen },
  { id: 'activity', label: 'Activity', icon: Activity },
  { id: 'classmates', label: 'Classmates', icon: Users },
]

export default function StudentClassroomHub() {
  const { classroomId } = useParams()
  const profile = useAuthStore(state => state.profile)
  const {
    currentClassroom, classroomPosts, detailLoading, postsLoading, hasMorePosts, error,
    fetchClassroomDetail, fetchClassroomPosts, fetchMoreClassroomPosts,
    likePost, commentOnPost, clearCurrentClassroom,
  } = useClassroomStore()
  const [activeTab, setActiveTab] = useState('learning')
  const [postsError, setPostsError] = useState('')
  const {copied, copyCode} = useCopyCode()
  useClassroomLivePosts(classroomId)

  useEffect(() => {
    if (!classroomId || !profile?.id) return
    let active = true
    fetchClassroomDetail(classroomId, profile.id).catch(() => {})
    fetchClassroomPosts(classroomId).catch(cause => {
      if (active) setPostsError(cause.message || 'Could not load classroom activity.')
    })
    return () => { active = false; clearCurrentClassroom() }
  }, [classroomId, profile?.id, fetchClassroomDetail, fetchClassroomPosts, clearCurrentClassroom])

  const classroom = currentClassroom?.id === classroomId ? currentClassroom : null
  const back = <Link to="/student/classrooms" className="inline-flex items-center gap-2 text-sm font-semibold text-blockly-purple"><ArrowLeft size={16} /> My classroom</Link>

  if (error && !classroom) return <PageWrapper title="Classroom unavailable">{back}<p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">This classroom was removed or you no longer have access.</p></PageWrapper>
  if (detailLoading || !classroom) return <PageWrapper title="Classroom">{back}<div className="flex justify-center py-20"><Loader2 className="animate-spin text-blockly-purple" /></div></PageWrapper>
  if (!classroom.current_user_membership) return <PageWrapper title="Classroom unavailable">{back}<p role="alert">Join this classroom to view its lessons and activity.</p></PageWrapper>

  return <PageWrapper>
    <section className="relative overflow-hidden rounded-3xl border border-border border-b-4 border-b-slate-400 shadow bg-[url('/classroom_bg.png')] bg-cover p-8 text-sky-800">
      <div className="relative flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-balance md:text-4xl">
            {classroom.name}
          </h1>
          <p className="mt-3 max-w-lg text-pretty text-sm text-muted-foreground md:text-base">
            {classroom.description || 'Learn with your classmates.'}
          </p>
          <div className="flex items-center gap-2 mt-3">
            <img src={classroom.teacher?.avatar_url || "/default-avatar.png"} alt="teacher picture" className="w-10 h-10 rounded-full object-cover object-center" />
            <div>
              <p className="text-sm font-semibold text-gray-600">{classroom.teacher?.username}</p>
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
              {classroom.join_code}
            </p>
          </div>
          {copied
          ? <Button onClick={() => ( copyCode(classroom.join_code || ''))} title="copy join code" className="rounded-md text-xs px-1">
              Code copied
            </Button>
          : <Button onClick={() => ( copyCode(classroom.join_code || ''))} title="copy join code" className="rounded-md text-xs px-1">
              Copy Invite
            </Button>
        }
        </div>
      </div>
    </section>

    <div className="flex gap-2 overflow-x-auto border-b pb-2" role="tablist" aria-label="Classroom sections">
      {tabs.map(({ id, label, icon }) => <button key={id} type="button" role="tab" aria-selected={activeTab === id} onClick={() => setActiveTab(id)}
        className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold ${activeTab === id ? 'bg-blockly-purple text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
        {createElement(icon, { size: 17 })} {label}
      </button>)}
    </div>

    {activeTab === 'learning' && <StudentClassroomActivities classroomId={classroomId} />}
    {activeTab === 'activity' && <section aria-label="Classroom activity" className="rounded-2xl p-5">
      {postsError && <p role="alert" className="mb-4 text-sm text-red-700">{postsError}</p>}
      <PostFeed posts={classroomPosts} currentUserId={profile.id}
        onLike={postId => likePost(postId, profile.id)}
        onComment={(postId, content) => commentOnPost(postId, profile.id, content)}
        onLoadMore={() => fetchMoreClassroomPosts(classroomId)}
        hasMore={hasMorePosts} loading={postsLoading} />
    </section>}
    {activeTab === 'classmates' && <ClassroomMembersPanel members={classroom.members} currentUserId={profile.id} />}
  </PageWrapper>
}
