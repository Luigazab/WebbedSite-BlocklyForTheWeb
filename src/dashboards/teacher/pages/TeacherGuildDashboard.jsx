import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useAuthStore }           from '../../../store/authStore'
import { useClassroomStore }      from '../../../store/classroomStore'
import PageWrapper                from '../../../components/layout/PageWrapper'
import MilestonePanel             from '../components/MilestonePanel'
import RosterPanel                from '../components/RosterPanel'
import PostFeed                   from '../components/PostFeed'
import CreateMilestoneModal       from '../components/CreateMilestoneModal'
import {
  Copy, RefreshCw, Check, Loader2, Users, Target,
  Activity, ArrowLeft,
} from 'lucide-react'

// ── Tab definitions ────────────────────────────────────────────────────────────
const TABS = [
  { key: 'feed',       label: 'Activity',   icon: Activity },
  { key: 'milestones', label: 'Milestones', icon: Target   },
  { key: 'roster',     label: 'Roster',     icon: Users    },
]

export default function TeacherGuildDashboard() {
  const { classroomId } = useParams()
  const navigate        = useNavigate()
  const profile         = useAuthStore((s) => s.profile)

  const {
    currentGuild,
    guildPosts,
    detailLoading,
    postsLoading,
    actionLoading,
    hasMorePosts,
    fetchGuildDetail,
    fetchGuildPosts,
    fetchMorePosts,
    handleRegenerateCode,
    handleRemoveStudent,
    handleLikePost,
    handleCommentOnPost,
    handleCreateMilestone,
    clearCurrentGuild,
  } = useClassroomStore()

  const [activeTab,       setActiveTab]       = useState('feed')
  const [copied,          setCopied]          = useState(false)
  const [showMilestone,   setShowMilestone]   = useState(false)

  useEffect(() => {
    fetchGuildDetail(classroomId, profile?.id)
    fetchGuildPosts(classroomId)
    return () => clearCurrentGuild()
  }, [classroomId])

  const copyCode = () => {
    navigator.clipboard.writeText(currentGuild.join_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const onCreateMilestone = async (payload) => {
    await handleCreateMilestone({ classroomId, ...payload })
    setShowMilestone(false)
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (detailLoading || !currentGuild) {
    return (
      <PageWrapper title="Guild Dashboard">
        <div className="flex justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
        </div>
      </PageWrapper>
    )
  }

  const { name, description, join_code, member_count, milestones } = currentGuild

  // Milestone summary stats
  const guildXp      = milestones[0]?.current_score ?? 0
  const nextM        = milestones.find((m) => (m.current_score ?? 0) < m.target_score)
  const nextPct      = nextM
    ? Math.min(100, Math.round(((nextM.current_score ?? 0) / nextM.target_score) * 100))
    : milestones.length > 0 ? 100 : 0

  return (
    <PageWrapper
      title={name}
      subtitle={description || 'Guild Dashboard'}
      actions={
        <button
          onClick={() => navigate('/teacher/classrooms')}
          className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      }
    >
      <div className="flex flex-col gap-6">

        {/* ── Join code banner ─────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-blockly-purple/5 border border-blockly-purple/20 rounded-2xl px-6 py-4">
          <div>
            <p className="text-xs font-semibold text-blockly-purple uppercase tracking-wider mb-1">
              Invite students with this code
            </p>
            <p className="text-3xl font-black text-blockly-purple tracking-[0.3em]">
              {join_code}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyCode}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-blockly-purple/20 text-blockly-purple text-sm font-semibold rounded-lg hover:bg-blockly-purple/5 transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={() => handleRegenerateCode(classroomId)}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Regenerate
            </button>
          </div>
        </div>

        {/* ── Summary stat strip ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blockly-purple/10 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-blockly-purple" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900 leading-none">{member_count}</p>
              <p className="text-xs font-semibold text-gray-400 mt-0.5">Members</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900 leading-none">
                {milestones.filter((m) => (m.current_score ?? 0) >= m.target_score).length}
                <span className="text-base font-semibold text-gray-400">/{milestones.length}</span>
              </p>
              <p className="text-xs font-semibold text-gray-400 mt-0.5">Milestones done</p>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-400">
                {nextM ? `Next: ${nextM.title}` : milestones.length > 0 ? 'All complete 🎉' : 'No milestones yet'}
              </p>
              <p className="text-xs font-bold text-blockly-purple">{nextPct}%</p>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blockly-purple rounded-full transition-all duration-700"
                style={{ width: `${nextPct}%` }}
              />
            </div>
          </div>
        </div>

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
          <MilestonePanel
            milestones={milestones}
            onAddMilestone={() => setShowMilestone(true)}
          />
        )}

        {activeTab === 'roster' && (
          <RosterPanel
            members={currentGuild.members}
            onRemove={(studentId, username) =>
              handleRemoveStudent(studentId, classroomId, username)
            }
          />
        )}
      </div>

      {/* ── Create milestone modal ─────────────────────────────────────────── */}
      {showMilestone && (
        <CreateMilestoneModal
          loading={actionLoading}
          onSubmit={onCreateMilestone}
          onClose={() => setShowMilestone(false)}
        />
      )}
    </PageWrapper>
  )
}