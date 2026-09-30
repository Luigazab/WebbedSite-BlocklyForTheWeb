import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router'
import { useAuthStore } from '../../store/authStore'
import { supabase } from '../../supabaseClient'
import { likeClassroomPost, commentOnClassroomPost } from '../../services/classroomService'
import { ClassroomPost } from '../../components/shared/PostFeed'
import Loader from '../../components/layout/Loader'

export default function ClassroomPostPage() {
  const { user, profile, loading } = useAuthStore()
  const location = useLocation()
  const { postId } = useParams()
  if (loading) return <Loader />
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />
  return <PostContent key={`${user.id}:${postId}`} postId={postId} userId={user.id} role={profile?.role} />
}

function PostContent({ postId, userId, role }) {
  const [post, setPost] = useState(null)
  const [error, setError] = useState(null)
  useEffect(() => {
    let active = true
    supabase.from('classroom_posts').select(`*, author:author_id(id, username, avatar_url),
      classroom_post_likes(user_id), comments(id, content, created_at, author:author_id(id, username, avatar_url))`)
      .eq('id', postId).maybeSingle().then(({ data, error }) => {
        if (!active) return
        if (error || !data) setError('This post was removed or you no longer have access to its classroom.')
        else setPost(data)
      }).catch(() => { if (active) setError('Could not load this post. Please try again.') })
    return () => { active = false }
  }, [postId])
  if (!post && !error) return <Loader />
  return <main className="max-w-3xl mx-auto p-6 space-y-5">
    <Link to={post && ['student', 'teacher'].includes(role) ? `/${role}/classrooms/${post.classroom_id}` : `/${role || 'student'}`} className="text-blockly-purple underline">
      {post ? 'Back to classroom' : 'Back to dashboard'}
    </Link>
    {error ? <p role="alert">{error}</p> : <ClassroomPost post={post} currentUserId={userId}
      onLike={async () => {
        const { liked } = await likeClassroomPost(postId, userId)
        setPost(p => ({ ...p, classroom_post_likes: liked ? [...p.classroom_post_likes, { user_id: userId }] : p.classroom_post_likes.filter(l => l.user_id !== userId) }))
      }}
      onComment={async (_id, content) => {
        const comment = await commentOnClassroomPost(postId, userId, content)
        setPost(p => ({ ...p, comments: [...p.comments, comment] }))
      }} />}
  </main>
}
