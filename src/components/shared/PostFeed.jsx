import { useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'

export function ClassroomPost({ post, currentUserId, onLike, onComment, link = false }) {
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)
  const likes = post.classroom_post_likes ?? []
  async function submit(event) {
    event.preventDefault()
    if (!comment.trim() || busy) return
    setBusy(true)
    try { await onComment(post.id, comment.trim()); setComment('') }
    catch { toast.error('Could not add your comment.') }
    finally { setBusy(false) }
  }
  return <article className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
    <header><p className="font-semibold">{post.author?.username ?? 'Classroom member'}</p>
      <time className="text-xs text-slate-500">{new Date(post.created_at).toLocaleString()}</time></header>
    <p className="whitespace-pre-wrap break-words">{post.content}</p>
    {link && <Link className="text-blockly-purple underline text-sm" to={`/classroom-posts/${post.id}`}>Open post</Link>}
    <button type="button" disabled={busy} className="block text-sm text-blockly-purple" aria-pressed={likes.some(like => like.user_id === currentUserId)}
      onClick={async () => { setBusy(true); try { await onLike(post.id) } catch { toast.error('Could not update your like.') } finally { setBusy(false) } }}>
      {likes.some(like => like.user_id === currentUserId) ? 'Unlike' : 'Like'} · {likes.length}
    </button>
    <ul className="space-y-2">{(post.comments ?? []).map(item => <li key={item.id} className="rounded-lg bg-slate-50 p-3 text-sm">
      <span className="font-semibold">{item.author?.username ?? 'Classroom member'}: </span><span className="whitespace-pre-wrap break-words">{item.content}</span>
    </li>)}</ul>
    <form onSubmit={submit} className="flex gap-2">
      <input aria-label="Write a comment" placeholder="Write a comment…" maxLength={2000} value={comment} onChange={e => setComment(e.target.value)} className="min-w-0 flex-1 rounded-lg border p-2 text-sm" />
      <button disabled={busy || !comment.trim()} className="text-sm font-semibold text-blockly-purple disabled:opacity-50">Send</button>
    </form>
  </article>
}

export default function PostFeed({ posts, currentUserId, onLike, onComment, onLoadMore, hasMore, loading }) {
  return <div className="space-y-4">
    {posts.map(post => <ClassroomPost key={post.id} post={post} currentUserId={currentUserId} onLike={onLike} onComment={onComment} link />)}
    {!posts.length && <p className="text-slate-500">{loading ? 'Loading posts…' : 'No classroom activity yet.'}</p>}
    {hasMore && <button disabled={loading} onClick={onLoadMore} className="text-blockly-purple">{loading ? 'Loading…' : 'Load older posts'}</button>}
  </div>
}
