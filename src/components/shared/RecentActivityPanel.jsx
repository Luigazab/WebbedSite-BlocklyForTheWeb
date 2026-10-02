import { Award, Activity } from 'lucide-react'
import { Link } from 'react-router'
import { formatTimeAgo } from '../../utils/dateFormat'

export default function RecentActivityPanel({ posts, loading = false, error = '', showAuthor = true }) {
  return <section className="rounded-2xl border border-slate-200 border-b-4 bg-white p-5 shadow-sm">
    <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700"><Activity size={16} /> Recent Activities</h3>
    {error ? <p role="alert" className="mt-4 text-sm text-red-600">{error}</p> :
      <ul className="mt-4 space-y-4">
        {!posts.length && <li className="text-sm text-slate-500">{loading ? 'Loading activities…' : 'No recent activities yet.'}</li>}
        {posts.map(post => <li key={post.id} className="flex items-start gap-3 text-sm">
          {post.type === 'badge_earned' ? <Award size={18} className="mt-1 shrink-0 text-amber-600" /> : <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-sky-500" />}
          <div className="min-w-0 break-words">
            {showAuthor && <span className="font-semibold">{post.author?.username ?? 'A student'} </span>}
            {String(post.id).startsWith('award-') ? <span>{post.content}</span> : <Link className="hover:underline" to={`/classroom-posts/${post.id}`}>{post.content}</Link>}
            <p className="mt-1 text-xs text-slate-400">{formatTimeAgo(post.created_at)}</p>
          </div>
        </li>)}
      </ul>}
  </section>
}
