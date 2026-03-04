// src/components/shared/ProjectsPage.jsx
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { useAuthStore } from '../../store/authStore'
import PageWrapper from '../layout/PageWrapper'
import CreateProjectModal from './CreateProjectModal'
import ProjectDetailsModal from './ProjectDetailsModal'
import { useTour } from '../tour/TourProvider'
import TourSpotlight from '../tour/TourSpotlight'
import { projectsTourSteps } from '../../dashboards/student/tours/projectsTour'
import { projectService } from '../../services/project.service'
import {
  Search, ChevronDown, Image as ImageIcon,
  ThumbsUp, MessageSquare, Loader2, RefreshCw,
  FoldersIcon,
} from 'lucide-react'

const FILTERS      = ['All', 'Public', 'Private']
const SORT_OPTIONS = ['Recent', 'Name', 'Most Liked']

export default function ProjectsPage() {
  const profile  = useAuthStore((s) => s.profile)
  const navigate = useNavigate()
  const { activeTour, isVisible } = useTour()

  const [projects,        setProjects]        = useState([])
  const [loading,         setLoading]         = useState(true)
  const [error,           setError]           = useState(null)
  const [search,          setSearch]          = useState('')
  const [filter,          setFilter]          = useState('All')
  const [sortBy,          setSortBy]          = useState('Recent')
  const [showFilterMenu,  setShowFilterMenu]  = useState(false)
  const [showSortMenu,    setShowSortMenu]    = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)

  // ── Fetch ──────────────────────────────────────────────────
  const fetchProjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await projectService.getUserProjects({ filter, sortBy })
      setProjects(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [filter, sortBy])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  // ── Derived list (client-side search only) ─────────────────
  const displayed = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(search.toLowerCase())
  )

  // ── Handlers ───────────────────────────────────────────────
  // Called by CreateProjectModal after it has already saved to DB and navigates away (Blocks mode).
  // For future Code mode, it would just refresh the list.
  const handleProjectCreated = () => {
    setShowCreateModal(false)
    fetchProjects()
  }

  const handleDeleteProject = async (projectId) => {
    try {
      await projectService.deleteProject(projectId)
      setProjects((prev) => prev.filter((p) => p.id !== projectId))
      setSelectedProject(null)
    } catch (err) {
      console.error('Delete failed:', err.message)
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

  return (
    <PageWrapper title="Projects" subtitle="View all projects you have">
      <div className="flex flex-col gap-6">

        {/* ── Controls bar ─────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3">

          {/* Filter */}
          <div className="relative">
            <button
              onClick={() => { setShowFilterMenu(!showFilterMenu); setShowSortMenu(false) }}
              className="btn flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold btn-lead"
            >
              {filter}<ChevronDown className="w-4 h-4" />
            </button>
            {showFilterMenu && (
              <div className="absolute top-full left-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-10">
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    onClick={() => { setFilter(f); setShowFilterMenu(false) }}
                    className={`w-full px-4 py-2.5 text-sm text-left transition-colors
                      ${filter === f
                        ? 'bg-blockly-purple/10 text-blockly-purple font-semibold'
                        : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort */}
          <div className="relative">
            <button
              onClick={() => { setShowSortMenu(!showSortMenu); setShowFilterMenu(false) }}
              className="btn flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold btn-lead"
            >
              {sortBy}<ChevronDown className="w-4 h-4" />
            </button>
            {showSortMenu && (
              <div className="absolute top-full left-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-10">
                {SORT_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setSortBy(s); setShowSortMenu(false) }}
                    className={`w-full px-4 py-2.5 text-sm text-left transition-colors
                      ${sortBy === s
                        ? 'bg-blockly-purple/10 text-blockly-purple font-semibold'
                        : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search */}
          <div className="flex-1 relative min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blockly-purple focus:ring-2 focus:ring-blockly-purple/10 transition"
            />
          </div>

          {/* Refresh */}
          <button
            onClick={fetchProjects}
            className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-500"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Create */}
          <button
            onClick={() => setShowCreateModal(true)}
            data-tour="create-button"
            className="btn btn-primary px-4 py-2 text-sm font-semibold ml-auto"
          >
            + New Project
          </button>
        </div>

        {/* ── Project Grid ─────────────────────────────────── */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-blockly-purple animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col bg-gray-200 rounded-3xl items-center justify-center py-20 gap-4 text-center">
            <p className="text-red-500 font-semibold">Failed to load projects</p>
            <p className="text-sm text-gray-400">{error}</p>
            <button onClick={fetchProjects} className="btn btn-primary text-sm">Try Again</button>
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col bg-gray-200 rounded-3xl items-center justify-center py-20 gap-4">
            <div className='w-16 h-16 rounded-2xl bg-blockly-purple/10 flex items-center justify-center'>
              <FoldersIcon className='w-8 h-8 text-blockly-purple' />
            </div>
            <div className='flex flex-col items-center'>
              <p className="text-lg font-bold text-gray-800">
                {search ? 'No projects match your search' : 'No saved projects yet'}
              </p>
              <p className="text-sm text-gray-400">
                {search ? 'Try a different keyword' : 'Create one to get started!'}
              </p>
            </div>
            {!search && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 btn py-2 btn-lead text-sm font-semibold rounded-lg"
              >
                Create new
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {displayed.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => setSelectedProject(project)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ───────────────────────────────────────────── */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleProjectCreated}
        />
      )}

      {selectedProject && (
        <ProjectDetailsModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onDelete={() => handleDeleteProject(selectedProject.id)}
          onToggleVisibility={() => handleToggleVisibility(selectedProject)}
        />
      )}
      {activeTour === 'projects' && isVisible && <TourSpotlight steps={projectsTourSteps} />}
    </PageWrapper>
  )
}

// ─────────────────────────────────────────────────────────────
// Project Card
// ─────────────────────────────────────────────────────────────
function ProjectCard({ project, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:border-blockly-purple hover:shadow-md transition-all text-left group"
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
        {project.thumbnail_url ? (
          <img
            src={project.thumbnail_url}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <ImageIcon className="w-12 h-12 text-gray-300" />
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-gray-800 text-sm truncate flex-1">{project.title}</h3>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
            project.is_public
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-500'
          }`}>
            {project.is_public ? 'Public' : 'Private'}
          </span>
        </div>
        {project.description && (
          <p className="text-xs text-gray-400 line-clamp-2">{project.description}</p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
          <div className="flex items-center gap-1.5">
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>{project.likes_count ?? 0}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{project.comments_count ?? 0}</span>
          </div>
          {project.updated_at && (
            <span className="ml-auto text-[10px] text-gray-300">
              {new Date(project.updated_at).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}