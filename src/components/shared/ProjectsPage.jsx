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
  Plus,
} from 'lucide-react'
import { useLikes } from '../../hooks/useLikes'

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

  const displayed = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(search.toLowerCase())
  )

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
  const handleLikeToggled = (projectId, newCount) => {
    setProjects(prev =>
      prev.map(p => p.id === projectId ? { ...p, likes_count: newCount } : p)
    )
  }

  const handleCommentsCountChanged = (projectId, delta) => {
    setProjects(prev =>
      prev.map(p => p.id === projectId
        ? { ...p, comments_count: (p.comments_count || 0) + delta }
        : p
      )
    )
  }
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('tour_projects_completed')
    if (!hasSeenTour) {
      setTimeout(() => startTour('projects'), 500)
    }
  }, [])

  return (
    <PageWrapper title="Projects" subtitle="View all projects you have">
      <div className="flex flex-col gap-6">

        {/* ── Controls bar ─────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3">

          {/* Filter */}
          <div className="relative" data-tour="filter-dropdown">
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
          <div className="flex-1 relative min-w-48" data-tour="search-input">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects…"
              className="w-full pl-9 pr-4 py-4 bg-white text-sm border border-slate-400 rounded-lg focus:outline-none focus:border-blockly-purple focus:ring-2 focus:ring-blockly-purple/10 transition"
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
            className="btn btn-primary text-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>

        {/* ── Project Grid ─────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-white rounded-2xl border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col bg-slate-200 rounded-3xl items-center justify-center py-12 gap-4 text-center">
            <p className="text-red-500 font-semibold">Failed to load projects</p>
            <p className="text-sm text-slate-400">{error}</p>
            <button onClick={fetchProjects} className="btn btn-primary text-sm">Try Again</button>
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col bg-slate-200 rounded-3xl items-center justify-center py-12 gap-4">
            <div className="text-5xl mb-4 text-blockly-light bg-blockly-purple p-4 rounded-xl"><FoldersIcon size={48}/></div>
            <div className='flex flex-col items-center'>
              <p className="text-lg font-bold text-slate-700">
                {search ? 'No projects match your search' : 'No saved projects yet'}
              </p>
              <p className="text-sm text-slate-700">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 bg-blockly-dark/10 p-2 rounded-2xl">
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
          onLikeToggled={handleLikeToggled}
          onCommentsCountChanged={handleCommentsCountChanged}
        />
      )}
      {activeTour === 'projects' && isVisible && <TourSpotlight steps={projectsTourSteps} />}
    </PageWrapper>
  )
}

// ─────────────────────────────────────────────────────────────
// Project Card
// ─────────────────────────────────────────────────────────────
// At the top of ProjectsPage.jsx, add this new component
function ProjectCard({ project, onClick }) {
  const [showPreview, setShowPreview] = useState(false)
  const [likesCount, setLikesCount] = useState(project.likes_count || 0)
  const { isLiked, toggleLike } = useLikes([project.id])

  const handleLike = async (e) => {
    e.stopPropagation() 
    
    try {
      const nowLiked = await toggleLike(project.id)
      setLikesCount(prev => nowLiked ? prev + 1 : prev - 1)
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }


  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setShowPreview(true)}
      onMouseLeave={() => setShowPreview(false)}
      className="bg-white rounded-2xl  hover:btn shadow p-2 border border-white overflow-hidden hover:border-blockly-purple hover:border hover:shadow-5xl transition-all! text-left group"
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
          <ImageIcon className="w-12 h-12 text-slate-500" />
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
          <p className="text-xs text-slate-400 line-clamp-2">{project.description || 'No description'}</p>
        )}

        <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
          <div className="flex items-center gap-1.5">
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>{project.likes_count ?? 0}</span>
          </div>
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