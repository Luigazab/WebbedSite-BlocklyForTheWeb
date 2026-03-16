// src/components/shared/ProfilePage.jsx
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router'
import { useAuthStore } from '../../store/authStore'
import { profileService } from '../../services/profile.service'
import { projectService } from '../../services/project.service'
import ProjectDetailsModal from './ProjectDetailsModal'
import DeleteModal from '../ui/DeleteModal'
import { useLikes } from '../../hooks/useLikes'
import {
  Trophy, Loader2, FoldersIcon,
  Image as ImageIcon, ThumbsUp, MessageSquare,
} from 'lucide-react'
import { format } from 'date-fns'

const ROLE_CONFIG = {
  student: { label: 'Student', class: 'bg-sky-100    text-sky-700'    },
  teacher: { label: 'Teacher', class: 'bg-violet-100 text-violet-700' },
  admin:   { label: 'Admin',   class: 'bg-rose-100   text-rose-700'   },
}

export default function ProfilePage() {
  const { userId } = useParams()                        // present when viewing someone else
  const loggedIn   = useAuthStore((s) => s.profile)    // always the current user

  // The profile being displayed — could be own or someone else's
  const [viewedProfile, setViewedProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError,   setProfileError]   = useState(null)

  const isOwnProfile = !userId || userId === loggedIn?.id

  // ── Load the profile ──────────────────────────────────────
  useEffect(() => {
    if (isOwnProfile) {
      setViewedProfile(loggedIn)
      setProfileLoading(false)
      return
    }
    setProfileLoading(true)
    profileService.getProfile(userId)
      .then((data) => { setViewedProfile(data); setProfileLoading(false) })
      .catch((err) => { setProfileError(err.message); setProfileLoading(false) })
  }, [userId, loggedIn, isOwnProfile])

  // ── Projects state ────────────────────────────────────────
  const [projects,        setProjects]        = useState([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [projectsError,   setProjectsError]   = useState(null)
  const [selectedProject, setSelectedProject] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(null)
  const [deleting,        setDeleting]        = useState(false)

  const [activeTab, setActiveTab] = useState('Projects')

  // ── Fetch projects ────────────────────────────────────────
  const fetchProjects = useCallback(async () => {
    if (!viewedProfile?.id) return
    setProjectsLoading(true)
    setProjectsError(null)
    try {
      let data
      if (isOwnProfile) {
        // All own projects
        data = await projectService.getUserProjects({ filter: 'All', sortBy: 'Recent' })
      } else {
        // Only public projects for other users
        data = await projectService.getPublicProjectsByUser(viewedProfile.id)
      }
      setProjects(data)
    } catch (err) {
      setProjectsError(err.message)
    } finally {
      setProjectsLoading(false)
    }
  }, [viewedProfile?.id, isOwnProfile])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  // ── Handlers ──────────────────────────────────────────────
  const handleDeleteProject = async () => {
    if (!showDeleteModal) return
    setDeleting(true)
    try {
      await projectService.deleteProject(showDeleteModal)
      setProjects((prev) => prev.filter((p) => p.id !== showDeleteModal))
      if (selectedProject?.id === showDeleteModal) setSelectedProject(null)
    } catch (err) {
      console.error('Delete failed:', err.message)
    } finally {
      setDeleting(false)
      setShowDeleteModal(null)
    }
  }

  const handleToggleVisibility = async (project) => {
    try {
      const updated = await projectService.toggleVisibility(project.id, !project.is_public)
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      setSelectedProject(updated)
    } catch (err) {
      console.error('Visibility toggle failed:', err.message)
    }
  }

  const handleLikeToggled = (projectId, newCount) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, likes_count: newCount } : p))
    )
  }

  const handleCommentsCountChanged = (projectId, delta) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, comments_count: (p.comments_count || 0) + delta }
          : p
      )
    )
  }

  // ── Render guards ─────────────────────────────────────────
  if (profileLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blockly-purple" />
      </div>
    )
  }

  if (profileError || !viewedProfile) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-red-500">{profileError ?? 'Profile not found.'}</p>
      </div>
    )
  }

  const roleConfig = ROLE_CONFIG[viewedProfile.role] ?? ROLE_CONFIG.student

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Left sidebar ─────────────────────────────────────── */}
      <aside className="w-80 bg-white border-r border-gray-100 p-6 flex flex-col gap-6 overflow-y-auto shrink-0">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <img
            src={viewedProfile.avatar_url || '/default-avatar.png'}
            alt="avatar"
            className="w-32 h-32 rounded-full object-cover border-4 border-gray-100"
          />
          <div className="text-center">
            <h2 className="text-xl font-black text-gray-800">{viewedProfile.username}</h2>
            {isOwnProfile && (
              <p className="text-sm text-gray-400 mt-1">{viewedProfile.email}</p>
            )}
            <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mt-2 ${roleConfig.class}`}>
              {roleConfig.label}
            </span>
          </div>
        </div>

        {/* Bio */}
        {viewedProfile.bio && (
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bio</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{viewedProfile.bio}</p>
          </div>
        )}

        {/* Member info */}
        <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Member since</span>
            <span className="text-sm font-bold text-gray-700">
              {format(new Date(viewedProfile.created_at), 'MMM dd, yyyy')}
            </span>
          </div>
          {isOwnProfile && viewedProfile.last_login && (
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">Last Seen</span>
              <span className="text-sm font-bold text-gray-700">
                {format(new Date(viewedProfile.last_login), 'MMM dd, yyyy')}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Projects</span>
            <span className="text-sm font-bold text-gray-700">{projects.length}</span>
          </div>
        </div>
      </aside>

      {/* ── Right content ─────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden bg-gray-50">

        {/* Tab bar */}
        <div className="px-8 py-4 bg-white border-b border-gray-100">
          <div className="flex gap-2">
            {['Projects', 'Achievements'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-colors
                  ${activeTab === tab
                    ? 'bg-blockly-purple text-white'
                    : 'bg-transparent text-gray-500 hover:bg-gray-100'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-8">

          {activeTab === 'Projects' && (
            <>
              {projectsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-48 bg-white rounded-2xl border border-slate-200 animate-pulse" />
                  ))}
                </div>
              ) : projectsError ? (
                <div className="flex flex-col bg-slate-200 rounded-3xl items-center justify-center py-12 gap-4 text-center">
                  <p className="text-red-500 font-semibold">Failed to load projects</p>
                  <p className="text-sm text-slate-400">{projectsError}</p>
                  <button onClick={fetchProjects} className="btn btn-primary text-sm">Try Again</button>
                </div>
              ) : projects.length === 0 ? (
                <div className="flex flex-col bg-slate-200 rounded-3xl items-center justify-center py-12 gap-4">
                  <div className="text-blockly-light bg-blockly-purple p-4 rounded-xl">
                    <FoldersIcon size={48} />
                  </div>
                  <p className="text-lg font-bold text-slate-700">
                    {isOwnProfile ? 'No saved projects yet' : 'No public projects yet'}
                  </p>
                  <p className="text-sm text-slate-700">
                    {isOwnProfile ? 'Create one to get started!' : 'This user has no public projects.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {projects.map((project) => (
                    <ProfileProjectCard
                      key={project.id}
                      project={project}
                      isOwnProfile={isOwnProfile}
                      onClick={() => setSelectedProject(project)}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'Achievements' && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-yellow-100 flex items-center justify-center">
                <Trophy className="w-8 h-8 text-yellow-600" />
              </div>
              <p className="text-sm text-gray-400">No achievements yet.</p>
            </div>
          )}
        </div>
      </main>

      {/* ── Modals ───────────────────────────────────────────────── */}
      {selectedProject && (
        <ProjectDetailsModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onDelete={() => {
            setShowDeleteModal(selectedProject.id)
            setSelectedProject(null)
          }}
          onToggleVisibility={() => handleToggleVisibility(selectedProject)}
          onLikeToggled={handleLikeToggled}
          onCommentsCountChanged={handleCommentsCountChanged}
        />
      )}

      <DeleteModal
        isOpen={!!showDeleteModal}
        onClose={() => setShowDeleteModal(null)}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        message="Deleting this project will remove all of its data forever."
        confirmText="Confirm"
        loading={deleting}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Project Card  (same pattern as ProjectsPage's ProjectCard)
// ─────────────────────────────────────────────────────────────
function ProfileProjectCard({ project, isOwnProfile, onClick }) {
  const [showPreview, setShowPreview] = useState(false)
  const [likesCount, setLikesCount] = useState(project.likes_count || 0)
  const { isLiked, toggleLike } = useLikes([project.id])

  const handleLike = async (e) => {
    e.stopPropagation()
    try {
      const nowLiked = await toggleLike(project.id)
      setLikesCount((prev) => (nowLiked ? prev + 1 : prev - 1))
    } catch (err) {
      console.error('Like error:', err)
    }
  }

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setShowPreview(true)}
      onMouseLeave={() => setShowPreview(false)}
      className="bg-white rounded-2xl shadow border border-slate-200 overflow-hidden hover:border-blockly-purple hover:shadow-xl transition-all! text-left group"
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-linear-to-b from-green-50 to-amber-50 flex items-center justify-center overflow-hidden relative">
        {project.thumbnail_url ? (
          <>
            <img
              src={project.thumbnail_url}
              alt={project.title}
              className={`w-full h-full object-contain group-hover:scale-105 transition-all! duration-300! ${
                showPreview ? 'opacity-0' : 'opacity-100'
              }`}
            />
            {showPreview && project.generated_html && (
              <iframe
                srcDoc={project.generated_html}
                className="absolute inset-0 w-full h-full border-0 pointer-events-none"
                sandbox="allow-scripts"
                title={`Preview of ${project.title}`}
              />
            )}
          </>
        ) : (
          <ImageIcon className="w-12 h-12 text-slate-400" />
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-gray-800 text-sm truncate flex-1">{project.title}</h3>
          {isOwnProfile && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
              project.is_public
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {project.is_public ? 'Public' : 'Private'}
            </span>
          )}
        </div>

        {project.description && (
          <p className="text-xs text-slate-400 line-clamp-2">{project.description}</p>
        )}

        <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 transition-colors ${
              isLiked(project.id) ? 'text-blue-500' : 'hover:text-blue-400'
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>{likesCount}</span>
          </button>
          <div className="flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{project.comments_count ?? 0}</span>
          </div>
          {project.updated_at && (
            <span className="ml-auto text-[10px] text-slate-500">
              {new Date(project.updated_at).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}