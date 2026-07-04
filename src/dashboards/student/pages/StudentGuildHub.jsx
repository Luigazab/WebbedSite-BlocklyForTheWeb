import { useEffect, useState }    from 'react'
import { useParams, useNavigate } from 'react-router'
import { useAuthStore }           from '../../../store/authStore'
import { useClassroomStore }      from '../../../store/classroomStore'
import PageWrapper                from '../../../components/layout/PageWrapper'
import PostFeed                   from '../../teacher/components/PostFeed'
import StudentMilestonePanel      from '../components/StudentMilestonePanel'
import GuildMembersPanel          from '../components/GuildMembersPanel'
import {
  Activity, Target, Users, ArrowLeft,
  Loader2, Zap, BookOpen,
} from 'lucide-react'

// ── Tab definitions ────────────────────────────────────────────────────────────
const TABS = [
  { key: 'feed',       label: 'Activity',   icon: Activity },
  { key: 'milestones', label: 'Milestones', icon: Target   },
  { key: 'members',    label: 'Members',    icon: Users    },
]

// ── My contribution strip ─────────────────────────────────────────────────────
function MyContribution({ guildPosts, currentUserId, memberCount }) {
  const myPosts = guildPosts.filter((p) => p.author_id === currentUserId)

  const breakdown = [
    { label: 'Lessons',  count: myPosts.filter((p) => p.type === 'lecture_completed').length    },
    { label: 'Quizzes',  count: myPosts.filter((p) => p.type === 'quiz_scored').length          },
    { label: 'Labs',     count: myPosts.filter((p) => p.type === 'laboratory_completed').length  },
  ]

  return (
    <div className="bg-blockly-purple/5 border border-blockly-purple/15 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4 text-blockly-purple" />
        <p className="text-sm font-bold text-blockly-purple">Your Contribution</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {breakdown.map(({ label, count }) => (
          <div key={label} className="flex flex-col items-center bg-white rounded-xl py-3 gap-1">
            <p className="text-xl font-black text-gray-800 leading-none">{count}</p>
            <p className="text-xs text-gray-400">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function StudentGuildHub() {
  const { classroomId } = useParams()
  const navigate        = useNavigate()
  const profile         = useAuthStore((s) => s.profile)

  const {
    currentGuild,
    guildPosts,
    detailLoading,
    postsLoading,
    hasMorePosts,
    fetchGuildDetail,
    fetchGuildPosts,
    fetchMorePosts,
    handleLikePost,
    handleCommentOnPost,
    clearCurrentGuild,
  } = useClassroomStore()

  const [activeTab, setActiveTab] = useState('feed')

  useEffect(() => {
    fetchGuildDetail(classroomId, profile?.id)
    fetchGuildPosts(classroomId)
    return () => clearCurrentGuild()
  }, [classroomId])

  // ── Loading ────────────────────────────────────────────────────────────────
  if (detailLoading || !currentGuild) {
    return (
      <PageWrapper title="Guild Hub">
        <div className="flex justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
        </div>
      </PageWrapper>
    )
  }

  const { name, description, milestones, members, member_count, teacher } = currentGuild

  // Milestone progress numbers
  const nextM      = milestones.find((m) => (m.current_score ?? 0) < m.target_score)
  const guildXp    = nextM?.current_score ?? milestones[milestones.length - 1]?.current_score ?? 0
  const nextPct    = nextM
    ? Math.min(100, Math.round(((nextM.current_score ?? 0) / nextM.target_score) * 100))
    : milestones.length > 0 ? 100 : 0
  const doneCount  = milestones.filter((m) => (m.current_score ?? 0) >= m.target_score).length

  return (
    <PageWrapper
      title={name}
      subtitle={description || 'Guild Hub'}
      actions={
        <button
          onClick={() => navigate('/student/classrooms')}
          className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      }
    >
      <div className="flex flex-col gap-6">

        {/* ── Guild hero strip ─────────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-blockly-purple to-purple-500 rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-xs font-semibold text-purple-200 uppercase tracking-wider mb-1">
                Guild Classroom
              </p>
              <h1 className="text-2xl font-black leading-tight">{name}</h1>
              {teacher && (
                <p className="text-sm text-purple-200 mt-1">
                  Led by <span className="font-semibold text-white">{teacher.username}</span>
                </p>
              )}
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
          </div>

          {/* Stat pills */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1.5">
              <Users className="w-3.5 h-3.5 text-purple-200" />
              <span className="text-sm font-semibold">{member_count} members</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1.5">
              <Zap className="w-3.5 h-3.5 text-yellow-300" />
              <span className="text-sm font-semibold">{guildXp.toLocaleString()} XP</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1.5">
              <Target className="w-3.5 h-3.5 text-purple-200" />
              <span className="text-sm font-semibold">{doneCount}/{milestones.length} milestones</span>
            </div>
          </div>

          {/* Next milestone bar */}
          {milestones.length > 0 && (
            <div className="mt-4 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs text-purple-200">
                <span>{nextM ? `Next: ${nextM.title}` : 'All milestones complete 🎉'}</span>
                <span className="font-bold text-white">{nextPct}%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-700"
                  style={{ width: `${nextPct}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── My contribution ──────────────────────────────────────────────── */}
        <MyContribution
          guildPosts={guildPosts}
          currentUserId={profile?.id}
          memberCount={member_count}
        />

        {/* ── Tabs ─────────────────────────────────────────────────────────── */}
        <div className="flex gap-1 border-b border-gray-200">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold relative transition-colors
                ${activeTab === key ? 'text-blockly-purple' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {activeTab === key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blockly-purple" />
              )}
            </button>
          ))}
        </div>

        {/* ── Tab content ──────────────────────────────────────────────────── */}
        {activeTab === 'feed' && (
          <PostFeed
            posts={guildPosts}
            currentUserId={profile?.id}
            onLike={(postId) => handleLikePost(postId, profile?.id)}
            onComment={(postId, content) => handleCommentOnPost(postId, profile?.id, content)}
            onLoadMore={() => fetchMorePosts(classroomId)}
            hasMore={hasMorePosts}
            loading={postsLoading}
          />
        )}

        {activeTab === 'milestones' && (
          <StudentMilestonePanel milestones={milestones} />
        )}

        {activeTab === 'members' && (
          <GuildMembersPanel
            members={members}
            teacherId={teacher?.id}
            currentUserId={profile?.id}
          />
        )}

      </div>
    </PageWrapper>
  )
}