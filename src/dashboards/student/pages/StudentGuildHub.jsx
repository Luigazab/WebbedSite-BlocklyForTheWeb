import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useAuthStore } from '../../../store/authStore'
import { useClassroomStore } from '../../../store/classroomStore'
import PageWrapper from '../../../components/layout/PageWrapper'
import PostFeed from '../../teacher/components/PostFeed'
import StudentMilestonePanel from '../components/StudentMilestonePanel'
import GuildMembersPanel from '../components/GuildMembersPanel'
import {
  Activity, Target, Users, ArrowLeft,
  Loader2, Zap, BookOpen, Crown, Flame,
  ChevronRight, Award, Sparkles, Menu, X,
} from 'lucide-react'

// ── Tab definitions ────────────────────────────────────────────────────────────
const TABS = [
  { key: 'feed', label: 'Activity', icon: Activity },
  { key: 'milestones', label: 'Milestones', icon: Target },
  { key: 'members', label: 'Members', icon: Users },
]

// ── Side Panel Component ─────────────────────────────────────────────────────
function GuildSidePanel({ guild, milestones, memberCount, teacher, guildPosts, currentUserId }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  
  const nextM = milestones.find((m) => (m.current_score ?? 0) < m.target_score)
  const guildXp = nextM?.current_score ?? milestones[milestones.length - 1]?.current_score ?? 0
  const nextPct = nextM
    ? Math.min(100, Math.round(((nextM.current_score ?? 0) / nextM.target_score) * 100))
    : milestones.length > 0 ? 100 : 0
  const doneCount = milestones.filter((m) => (m.current_score ?? 0) >= m.target_score).length

  // User contribution breakdown
  const myPosts = guildPosts.filter((p) => p.author_id === currentUserId)
  const breakdown = [
    { label: 'Lessons', count: myPosts.filter((p) => p.type === 'lecture_completed').length, color: 'bg-[#FFEFE0]', border: 'border-[#dfa269]' },
    { label: 'Quizzes', count: myPosts.filter((p) => p.type === 'quiz_scored').length, color: 'bg-[#E9E3FF]', border: 'border-[#8778be]' },
    { label: 'Labs', count: myPosts.filter((p) => p.type === 'laboratory_completed').length, color: 'bg-slate-200', border: 'border-[#587194]' },
  ]
  const totalContributions = breakdown.reduce((sum, b) => sum + b.count, 0)

  const SidePanelContent = () => (
    <div className="flex flex-col gap-4 h-full overflow-y-auto p-4">
      {/* Mobile close button */}
      <button
        onClick={() => setIsMobileOpen(false)}
        className="lg:hidden flex items-center gap-2 text-gray-500 hover:text-gray-700 p-2 -ml-2"
      >
        <X className="w-5 h-5" />
        Close
      </button>

      {/* Guild Info Card */}
      <div className="bg-white rounded-2xl border border-b-8 border-slate-200 shadow-sm p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <div className="px-2.5 py-0.5 bg-[#FFEFE0] rounded-full text-xs font-bold text-[#dfa269]">
                Guild
              </div>
              {doneCount === milestones.length && milestones.length > 0 && (
                <div className="px-2.5 py-0.5 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full text-xs font-bold text-white flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  Complete!
                </div>
              )}
            </div>
            <h2 className="text-xl font-black text-gray-800 truncate">{guild.name}</h2>
            {guild.description && (
              <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{guild.description}</p>
            )}
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blockly-purple to-purple-500 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
        </div>

        {teacher && (
          <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 rounded-lg">
            <img 
              src={teacher.avatar_url} 
              alt={teacher.username} 
              className="w-8 h-8 rounded-full object-cover"
            />
            <div>
              <p className="text-xs text-gray-400">Teacher</p>
              <p className="text-sm font-semibold text-gray-700">{teacher.username}</p>
            </div>
          </div>
        )}

        {/* Mini stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center bg-slate-200 rounded-lg py-2 shadow border border-b-4 border-[#587194]">
            <p className="text-xl font-black text-gray-800">{memberCount}</p>
            <p className="text-[10px] font-bold text-gray-500">Members</p>
          </div>
          <div className="text-center bg-[#FFEFE0] rounded-lg py-2 shadow border border-b-4 border-[#dfa269]">
            <p className="text-xl font-black text-gray-800">
              {doneCount}<span className="text-xs text-gray-500">/{milestones.length}</span>
            </p>
            <p className="text-[10px] font-bold text-gray-500">Done</p>
          </div>
          <div className="text-center bg-[#E9E3FF] rounded-lg py-2 shadow border border-b-4 border-[#8778be]">
            <p className="text-xl font-black text-gray-800">{guildXp.toLocaleString()}</p>
            <p className="text-[10px] font-bold text-gray-500">Guild XP</p>
          </div>
        </div>

        {/* Progress bar */}
        {milestones.length > 0 && (
          <div className="mt-3 flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 font-medium truncate max-w-[70%]">
                {nextM ? `Next: ${nextM.title}` : '🎉 Complete!'}
              </span>
              <span className="font-bold text-blockly-purple">{nextPct}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#8778be] to-blockly-purple rounded-full transition-all duration-700"
                style={{ width: `${nextPct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Your Contribution Card */}
      <div className="bg-white rounded-2xl border border-b-8 border-slate-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-[#E9E3FF] flex items-center justify-center">
            <Zap className="w-4 h-4 text-[#8778be]" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">Your Contribution</p>
            <p className="text-xs text-gray-400">{totalContributions} activities</p>
          </div>
          <div className="ml-auto bg-gradient-to-r from-amber-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold">
            +{totalContributions} XP
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {breakdown.map(({ label, count, color, border }) => (
            <div 
              key={label} 
              className={`flex flex-col items-center ${color} rounded-lg py-3 gap-0.5 shadow border border-b-4 ${border}`}
            >
              <p className="text-2xl font-black text-gray-800 leading-none">{count}</p>
              <p className="text-[10px] font-bold text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-2xl border border-b-8 border-slate-200 shadow-sm p-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Flame className="w-4 h-4 text-orange-400" />
          <span className="font-medium">Guild Activity</span>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400">Posts:</span>
            <span className="font-bold text-gray-800">{guildPosts.length}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400">Members:</span>
            <span className="font-bold text-gray-800">{memberCount}</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 bg-blockly-purple text-white p-4 rounded-full shadow-lg shadow-blockly-purple/30 hover:bg-blockly-purple/90 transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Side Panel */}
      <div className={`
        fixed lg:sticky top-0 lg:top-4 h-screen lg:h-[calc(100vh-2rem)]
        w-full lg:w-80 xl:w-96
        bg-gray-50/95 backdrop-blur-sm lg:bg-gray-50
        transition-transform duration-300 ease-in-out z-50
        ${isMobileOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        lg:rounded-2xl lg:border lg:border-b-8 lg:border-slate-200 lg:shadow-sm
        overflow-hidden
      `}>
        <SidePanelContent />
      </div>
    </>
  )
}

// ── Main Content ──────────────────────────────────────────────────────────────
function MainContent({ 
  activeTab, 
  setActiveTab, 
  guild,
  guildPosts, 
  milestones, 
  members, // Added members prop
  memberCount, 
  profile, 
  handleLikePost, 
  handleCommentOnPost, 
  fetchMorePosts, 
  hasMorePosts, 
  postsLoading, 
  classroomId, 
  teacher 
}) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex flex-col gap-4">
        {/* Mobile header */}
        <div className="lg:hidden bg-white rounded-2xl border border-b-8 border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors -ml-2"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400">Guild</p>
              <h1 className="text-lg font-black text-gray-800 truncate">{guild.name}</h1>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-b-8 border-slate-200 shadow-sm p-1 sticky top-4 z-30">
          <div className="flex gap-1">
            {TABS.map(({ key, label, icon: Icon }) => {
              let badge = null
              if (key === 'feed' && guildPosts.length > 0) badge = guildPosts.length
              if (key === 'milestones') {
                const done = milestones.filter((m) => (m.current_score ?? 0) >= m.target_score).length
                badge = `${done}/${milestones.length}`
              }
              if (key === 'members') badge = memberCount

              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all
                    ${activeTab === key 
                      ? 'bg-blockly-purple text-white shadow-lg shadow-blockly-purple/30' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <Icon className={`w-4 h-4 ${activeTab === key ? 'text-white' : ''}`} />
                  <span className="hidden sm:inline">{label}</span>
                  {badge && (
                    <span className={`px-2 py-0.5 text-xs rounded-full font-bold
                      ${activeTab === key 
                        ? 'bg-white/20 text-white' 
                        : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab content */}
        {activeTab === 'feed' && (
          <div className="bg-white rounded-2xl border border-b-8 border-slate-200 shadow-sm p-4 sm:p-6">
            <PostFeed
              posts={guildPosts}
              currentUserId={profile?.id}
              onLike={(postId) => handleLikePost(postId, profile?.id)}
              onComment={(postId, content) => handleCommentOnPost(postId, profile?.id, content)}
              onLoadMore={() => fetchMorePosts(classroomId)}
              hasMore={hasMorePosts}
              loading={postsLoading}
            />
          </div>
        )}

        {activeTab === 'milestones' && (
          <div className="bg-white rounded-2xl border border-b-8 border-slate-200 shadow-sm p-4 sm:p-6">
            <StudentMilestonePanel milestones={milestones} />
          </div>
        )}

        {activeTab === 'members' && (
          <div className="bg-white rounded-2xl border border-b-8 border-slate-200 shadow-sm p-4 sm:p-6">
            <GuildMembersPanel
              members={members}
              teacherId={teacher?.id}
              currentUserId={profile?.id}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function StudentGuildHub() {
  const { classroomId } = useParams()
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)

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

  return (
    <PageWrapper title={name} subtitle={description || 'Guild Hub'} actions={null}>
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 max-w-full">
        {/* Side Panel */}
        <GuildSidePanel
          guild={currentGuild}
          milestones={milestones}
          memberCount={member_count}
          teacher={teacher}
          guildPosts={guildPosts}
          currentUserId={profile?.id}
        />

        {/* Main Content */}
        <MainContent
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          guild={currentGuild}
          guildPosts={guildPosts}
          milestones={milestones}
          members={members} // Added members prop
          memberCount={member_count}
          profile={profile}
          handleLikePost={handleLikePost}
          handleCommentOnPost={handleCommentOnPost}
          fetchMorePosts={fetchMorePosts}
          hasMorePosts={hasMorePosts}
          postsLoading={postsLoading}
          classroomId={classroomId}
          teacher={teacher}
        />
      </div>
    </PageWrapper>
  )
}