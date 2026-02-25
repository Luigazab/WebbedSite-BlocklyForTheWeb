import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import DeleteModal from '../ui/DeleteModal'
import {
  MoreVertical, Eye, EyeOff, Pencil, Trash2,
  Calendar, ThumbsUp, MessageSquare, Trophy,
  Loader2
} from 'lucide-react'
import { format } from 'date-fns'

const ROLE_CONFIG = {
  student: { label: 'Student', class: 'bg-sky-100    text-sky-700'    },
  teacher: { label: 'Teacher', class: 'bg-violet-100 text-violet-700' },
  admin:   { label: 'Admin',   class: 'bg-rose-100   text-rose-700'   },
}

// Mock project data — replace with actual fetch later
const MOCK_PROJECTS = [
  {
    id: '1',
    title: 'Project Title',
    description: 'Project description',
    thumbnail: null,
    likes: 0,
    comments: 0,
    isPublic: true,
  },
  {
    id: '2',
    title: 'Another Project',
    description: 'Another project description',
    thumbnail: null,
    likes: 5,
    comments: 2,
    isPublic: false,
  },
]

export default function ProfilePage() {
  const profile = useAuthStore((s) => s.profile)
  const [activeTab, setActiveTab] = useState('Projects')
  const [showMenu, setShowMenu] = useState(null) // Track which project menu is open
  const [showDeleteModal, setShowDeleteModal] = useState(null)
  const [deleting, setDeleting] = useState(false)

  if (!profile) return null

  const roleConfig = ROLE_CONFIG[profile.role] ?? ROLE_CONFIG.student
  const isOwnProfile = true // For now — later check if viewing own profile

  const handleDeleteProject = async () => {
    setDeleting(true)
    // TODO: Call delete service
    setTimeout(() => {
      setDeleting(false)
      setShowDeleteModal(null)
      setShowMenu(null)
    }, 1000)
  }

  const handleToggleVisibility = (projectId) => {
    // TODO: Toggle project visibility
    console.log('Toggle visibility for', projectId)
    setShowMenu(null)
  }

  const handleEditProject = (projectId) => {
    // TODO: Navigate to edit
    console.log('Edit project', projectId)
    setShowMenu(null)
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left sidebar - Profile info */}
      <aside className="w-80 bg-white border-r border-gray-100 p-6 flex flex-col gap-6 overflow-y-auto shrink-0">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <img
            src={profile.avatar_url || '/default-avatar.png'}
            alt="avatar"
            className="w-32 h-32 rounded-full object-cover border-4 border-gray-100"
          />
          <div className="text-center">
            <h2 className="text-xl font-black text-gray-800">{profile.username}</h2>
            <p className="text-sm text-gray-400 mt-1">{profile.email}</p>
            <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mt-2 ${roleConfig.class}`}>
              {roleConfig.label}
            </span>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bio</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Member info */}
        <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Member since:</span>
            <span className="text-sm font-bold text-gray-700">
              {format(new Date(profile.created_at), 'MMM dd, yyyy')}
            </span>
          </div>
          {profile.last_login && (
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">Last Seen:</span>
              <span className="text-sm font-bold text-gray-700">
                {format(new Date(profile.last_login), 'MMM dd, yyyy')}
              </span>
            </div>
          )}
        </div>
      </aside>

      {/* Right content - Projects/Achievements */}
      <main className="flex-1 flex flex-col overflow-hidden bg-gray-50">

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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'Projects' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {MOCK_PROJECTS.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isOwnProfile={isOwnProfile}
                  showMenu={showMenu === project.id}
                  onToggleMenu={() => setShowMenu(showMenu === project.id ? null : project.id)}
                  onToggleVisibility={() => handleToggleVisibility(project.id)}
                  onEdit={() => handleEditProject(project.id)}
                  onDelete={() => {
                    setShowDeleteModal(project.id)
                    setShowMenu(null)
                  }}
                />
              ))}
            </div>
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

      {/* Delete modal */}
      <DeleteModal
        isOpen={!!showDeleteModal}
        onClose={() => setShowDeleteModal(null)}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        message="Deleting this project will remove any data of it forever."
        confirmText="Confirm"
        loading={deleting}
      />
    </div>
  )
}

// ──────────────────────────────────────────────────────────
// Project Card Component
// ──────────────────────────────────────────────────────────
function ProjectCard({ 
  project, 
  isOwnProfile, 
  showMenu, 
  onToggleMenu, 
  onToggleVisibility, 
  onEdit, 
  onDelete 
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-200">
        {project.thumbnail ? (
          <img
            src={project.thumbnail}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400 text-sm">No preview</span>
          </div>
        )}
        
        {/* Three-dot menu */}
        {isOwnProfile && (
          <div className="absolute top-3 right-3">
            <div className="relative">
              <button
                onClick={onToggleMenu}
                className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-gray-600" />
              </button>
              
              {/* Dropdown menu */}
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-10">
                  <button
                    onClick={onToggleVisibility}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                  >
                    {project.isPublic ? (
                      <><EyeOff className="w-4 h-4" />Hide</>
                    ) : (
                      <><Eye className="w-4 h-4" />Show</>
                    )}
                  </button>
                  <button
                    onClick={onEdit}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={onDelete}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors text-left"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-800 text-sm truncate">{project.title}</h3>
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{project.description}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 pt-2 border-t border-gray-50">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>{project.likes} likes</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{project.comments} comments</span>
          </div>
        </div>
      </div>
    </div>
  )
}