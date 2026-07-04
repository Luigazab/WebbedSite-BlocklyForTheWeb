import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
  BookOpen, FlaskConical, Trophy, Code2, Megaphone,
  Heart, MessageCircle, ChevronDown, ChevronUp, Send,
} from 'lucide-react'

// ─── Post type config ─────────────────────────────────────────────────────────
const POST_META = {
  lecture_completed:    { icon: BookOpen,     color: 'text-blue-500',   bg: 'bg-blue-50',   label: 'completed a lesson'  },
  quiz_scored:          { icon: Trophy,       color: 'text-amber-500',  bg: 'bg-amber-50',  label: 'scored on a quiz'    },
  laboratory_completed: { icon: FlaskConical, color: 'text-green-500',  bg: 'bg-green-50',  label: 'finished a lab'      },
  tutorial_completed:   { icon: Code2,        color: 'text-purple-500', bg: 'bg-purple-50', label: 'completed a tutorial' },
  project_shared:       { icon: Code2,        color: 'text-pink-500',   bg: 'bg-pink-50',   label: 'shared a project'    },
  announcement:         { icon: Megaphone,    color: 'text-blockly-purple', bg: 'bg-blockly-purple/10', label: 'announcement' },
}

// ─── Single post ──────────────────────────────────────────────────────────────
function PostCard({ post, currentUserId, onLike, onComment }) {
  const [showComments, setShowComments] = useState(false)
  const [commentText,  setCommentText]  = useState('')
  const [submitting,   setSubmitting]   = useState(false)

  const meta      = POST_META[post.type] ?? POST_META.announcement
  const Icon      = meta.icon
  const likes     = post.classroom_post_likes ?? []
  const comments  = post.comments ?? []
  const hasLiked  = likes.some((l) => l.user_id === currentUserId)

  const handleComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    setSubmitting(true)
    try {
      await onComment(post.id, commentText.trim())
      setCommentText('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
      {/* Author + type */}
      <div className="flex items-center gap-3">
        <img
          src={post.author?.avatar_url || '/default-avatar.png'}
          alt={post.author?.username}
          className="w-9 h-9 rounded-full object-cover border border-gray-100 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">{post.author?.username}</p>
          <p className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </p>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${meta.bg}`}>
          <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
          <span className={`text-xs font-semibold ${meta.color}`}>{meta.label}</span>
        </div>
      </div>

      {/* Content */}
      <p className="text-sm text-gray-700 leading-relaxed">{post.content}</p>

      {/* Actions bar */}
      <div className="flex items-center gap-4 pt-1 border-t border-gray-50">
        <button
          onClick={() => onLike(post.id)}
          className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
            hasLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
          }`}
        >
          <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
          {likes.length > 0 && likes.length}
        </button>
        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-blockly-purple transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          {comments.length > 0 && comments.length}
          {showComments ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="flex flex-col gap-3 pt-1">
          {comments.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-1">No comments yet — be the first!</p>
          )}
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2.5">
              <img
                src={c.author?.avatar_url || '/default-avatar.png'}
                alt={c.author?.username}
                className="w-7 h-7 rounded-full object-cover border border-gray-100 shrink-0 mt-0.5"
              />
              <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                <p className="text-xs font-semibold text-gray-700">{c.author?.username}</p>
                <p className="text-xs text-gray-600 mt-0.5">{c.content}</p>
              </div>
            </div>
          ))}

          {/* Comment input */}
          <form onSubmit={handleComment} className="flex items-center gap-2 mt-1">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment…"
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blockly-purple transition-colors"
            />
            <button
              type="submit"
              disabled={submitting || !commentText.trim()}
              className="p-2 rounded-xl bg-blockly-purple text-white hover:bg-blockly-purple/90 disabled:opacity-40 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

// ─── Feed list ────────────────────────────────────────────────────────────────
export default function PostFeed({ posts, currentUserId, onLike, onComment, onLoadMore, hasMore, loading }) {
  return (
    <div className="flex flex-col gap-4">
      {posts.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-14 gap-2 text-center bg-gray-50 rounded-2xl">
          <Megaphone className="w-8 h-8 text-gray-200" />
          <p className="text-sm font-semibold text-gray-500">No activity yet</p>
          <p className="text-xs text-gray-400">Activity from lessons, quizzes, and labs will appear here.</p>
        </div>
      )}

      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={currentUserId}
          onLike={onLike}
          onComment={onComment}
        />
      ))}

      {hasMore && (
        <button
          onClick={onLoadMore}
          disabled={loading}
          className="w-full py-2.5 text-sm font-semibold text-blockly-purple bg-blockly-purple/5 rounded-xl hover:bg-blockly-purple/10 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Loading…' : 'Load more'}
        </button>
      )}
    </div>
  )
}