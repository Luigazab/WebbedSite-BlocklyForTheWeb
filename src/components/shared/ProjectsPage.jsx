import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { toast } from 'sonner'
import CreateProjectModal from './CreateProjectModal'
import ProjectDetailsModal from './ProjectDetailsModal'
import { useTour } from '../tour/TourProvider'
import TourSpotlight from '../tour/TourSpotlight'
import { projectsTourSteps } from '../../dashboards/student/tours/projectsTour'
import { projectService } from '../../services/project.service'
import {
  Search, Image as ImageIcon, ThumbsUp, MessageSquare,
  RefreshCw, FoldersIcon, Plus,
} from 'lucide-react'
import { useLikes } from '../../hooks/useLikes'
import { PageHeader } from '#components/common/PageHeader'
import { Button } from '#components/ui/button'

const FILTERS      = ['All', 'Personal', 'Tutorial', 'Laboratory', 'Public', 'Private']
const SORT_OPTIONS = ['Recent', 'Name', 'Most Liked']

// Shared by the real grid and the loading skeleton so they never drift apart
const GRID = 'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'

export default function ProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const linkedProjectId = searchParams.get('project')
  const { activeTour, isVisible, startTour } = useTour()

  const [projects,        setProjects]        = useState([])
  const [loading,         setLoading]         = useState(true)
  const [error,           setError]           = useState(null)
  const [search,          setSearch]          = useState('')
  const [filter,          setFilter]          = useState('All')
  const [sortBy,          setSortBy]          = useState('Recent')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)

  // Deep link: /projects?project=<id>
  useEffect(() => {
    if (!linkedProjectId) return
    let active = true
    projectService.getProjectById(linkedProjectId)
      .then((project) => { if (active) setSelectedProject(project) })
      .catch(() => { if (active) toast.error('This project was removed or is no longer accessible.') })
    return () => { active = false }
  }, [linkedProjectId])

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setProjects(await projectService.getUserProjects({ filter, sortBy }))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [filter, sortBy])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  useEffect(() => {
    if (localStorage.getItem('tour_projects_completed')) return
    const timer = setTimeout(() => startTour('projects'), 500)
    return () => clearTimeout(timer)
  }, [startTour])

  const displayed = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return projects
    return projects.filter((p) =>
      (p.title || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q)
    )
  }, [projects, search])

  const handleProjectCreated = () => {
    setShowCreateModal(false)
    fetchProjects()
  }

  const handleDeleteProject = async (projectId) => {
    try {
      await projectService.deleteProject(projectId)
      setProjects((prev) => prev.filter((p) => p.id !== projectId))
      setSelectedProject(null)
      toast.success('Project deleted')
    } catch (err) {
      toast.error(`Couldn’t delete the project: ${err.message}`)
    }
  }

  const handleToggleVisibility = async (project) => {
    try {
      const updated = await projectService.toggleVisibility(project.id, !project.is_public)
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      setSelectedProject(updated)
      toast.success(updated.is_public ? 'Project is now public' : 'Project is now private')
    } catch (err) {
      toast.error(`Couldn’t change visibility: ${err.message}`)
    }
  }

  const handleLikeToggled = (projectId, newCount) => {
    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, likes_count: newCount } : p)))
  }

  const closeDetails = () => {
    setSelectedProject(null)
    setSearchParams((params) => { params.delete('project'); return params }, { replace: true })
  }

  const isFiltering = Boolean(search.trim())

  return (
    <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
      <PageHeader title="Projects" description="View all projects you have" action={{label: "New Project", icon: <Plus className='size-4'/>, onClick: () => setShowCreateModal(true)}} />

      <div className="mt-6 flex flex-col gap-6">
        {/* ── Toolbar ───────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative min-w-56 flex-1" data-tour="search-input">
              <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects…"
                aria-label="Search projects"
                className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-4 text-sm transition focus:border-blockly-purple focus:outline-none focus:ring-2 focus:ring-blockly-purple/10"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort projects"
              className="h-10 rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground focus:border-blockly-purple focus:outline-none focus:ring-2 focus:ring-blockly-purple/10"
            >
              {SORT_OPTIONS.map((s) => <option key={s} value={s}>{s === 'Recent' ? 'Sort: Recent' : s}</option>)}
            </select>

            {/* Refresh */}
            <button
              type="button"
              onClick={fetchProjects}
              disabled={loading}
              aria-label="Refresh projects"
              title="Refresh"
              className="flex size-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:bg-muted disabled:opacity-60"
            >
              <RefreshCw aria-hidden="true" className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Filters + result count */}
          <div className="flex items-center justify-between gap-4">
            <div
              role="group"
              aria-label="Filter projects"
              data-tour="filter-dropdown"
              className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
            >
              {FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={filter === f}
                  onClick={() => setFilter(f)}
                  className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
                    filter === f
                      ? 'border-secondary bg-secondary/60 text-secondary-foreground'
                      : 'border-border bg-card text-foreground hover:bg-muted'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            {!loading && !error && (
              <p aria-live="polite" className="hidden shrink-0 text-sm text-muted-foreground sm:flow-root">
                {displayed.length} {displayed.length === 1 ? 'project' : 'projects'}
              </p>
            )}
          </div>
        </div>

        {/* ── Content ───────────────────────────────────────── */}
        {loading ? (
          <div className={GRID} aria-busy="true" aria-label="Loading projects">
            {Array.from({ length: 8 }).map((_, i) => <ProjectSkeleton key={i} />)}
          </div>
        ) : error ? (
          <StateMessage
            title="Failed to load projects"
            titleClassName="text-red-600"
            description={error}
            action={<Button type="button" onClick={fetchProjects} variant='primary'>Try again</Button>}
          />
        ) : displayed.length === 0 ? (
          <StateMessage
            icon={<FoldersIcon size={40} aria-hidden="true" />}
            title={isFiltering ? 'No projects match your search' : filter !== 'All' ? `No ${filter.toLowerCase()} projects yet` : 'No saved projects yet'}
            description={isFiltering ? 'Try a different keyword.' : filter !== 'All' ? 'Try another filter, or create a new project.' : 'Create one to get started!'}
            action={!isFiltering && (
              <Button type="button" onClick={() => setShowCreateModal(true)} variant='primary'>
                Create new
              </Button>
            )}
          />
        ) : (
          <div className={GRID}>
            {displayed.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onOpen={() => setSelectedProject(project)}
                onLikeToggled={handleLikeToggled}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────── */}
      {showCreateModal && (
        <CreateProjectModal onClose={() => setShowCreateModal(false)} onCreated={handleProjectCreated} />
      )}

      {selectedProject && (
        <ProjectDetailsModal
          project={selectedProject}
          onClose={closeDetails}
          onDelete={() => handleDeleteProject(selectedProject.id)}
          onToggleVisibility={() => handleToggleVisibility(selectedProject)}
          onLikeToggled={handleLikeToggled}
        />
      )}
      {activeTour === 'projects' && isVisible && <TourSpotlight steps={projectsTourSteps} />}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Shared pieces
// ─────────────────────────────────────────────────────────────
function StateMessage({ icon, title, titleClassName = 'text-slate-700', description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border bg-muted px-6 py-14 text-center">
      {icon && <div className="rounded-xl bg-primary p-4 text-primary-foreground">{icon}</div>}
      <div className="flex flex-col items-center gap-1">
        <p className={`text-lg font-bold ${titleClassName}`}>{title}</p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
}

function ProjectSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="aspect-video animate-pulse bg-muted" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Project Card
//   The title button is stretched over the whole card (after:inset-0),
//   so the card opens on click while the like button stays a separate,
//   keyboard-reachable control instead of being nested inside a button.
// ─────────────────────────────────────────────────────────────
function ProjectCard({ project, onOpen, onLikeToggled }) {
  const [liking, setLiking] = useState(false)
  const { toggleLike } = useLikes([project.id])
  const likesCount = project.likes_count || 0

  const handleLike = async () => {
    if (liking) return
    setLiking(true)
    try {
      const nowLiked = await toggleLike(project.id)
      onLikeToggled(project.id, Math.max(0, nowLiked ? likesCount + 1 : likesCount - 1))
    } catch (err) {
      toast.error('Couldn’t update your like. Please try again.')
      console.error('Error toggling like:', err)
    } finally {
      setLiking(false)
    }
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blockly-purple hover:shadow-md">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-linear-to-b from-green-50 to-amber-50">
        {project.thumbnail_url ? (
          <img
            src={project.thumbnail_url}
            alt=""
            loading="lazy"
            className="size-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <ImageIcon aria-hidden="true" className="size-12 text-muted-foreground" />
          </div>
        )}
        <span
          className={`absolute left-2.5 top-2.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold shadow-sm ${
            project.is_public ? 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300' : 'bg-card/90 text-foreground'
          }`}
        >
          {project.is_public ? 'Public' : 'Private'}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="min-w-0">
          <button
            type="button"
            onClick={onOpen}
            className="w-full truncate text-left text-sm font-bold text-foreground after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-blockly-purple"
          >
            {project.title}
          </button>
        </h3>

        <p className={`line-clamp-2 min-h-8 text-xs leading-4 ${project.description ? 'text-muted-foreground' : 'italic text-muted-foreground'}`}>
          {project.description || 'No description'}
        </p>

        <div className="mt-auto flex items-center gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
          <button
            type="button"
            onClick={handleLike}
            disabled={liking}
            aria-label={`Like ${project.title}. ${likesCount} likes`}
            className="relative z-10 -m-1 flex items-center gap-1.5 rounded-md p-1 transition-colors hover:bg-blockly-purple/10 hover:text-blockly-purple focus-visible:outline-2 focus-visible:outline-blockly-purple disabled:opacity-60"
          >
            <ThumbsUp aria-hidden="true" className="size-3.5" />
            <span className="tabular-nums">{likesCount}</span>
          </button>

          <span className="flex items-center gap-1.5" aria-label={`${project.comments_count ?? 0} comments`}>
            <MessageSquare aria-hidden="true" className="size-3.5" />
            <span className="tabular-nums">{project.comments_count ?? 0}</span>
          </span>

          {project.updated_at && (
            <time dateTime={project.updated_at} className="ml-auto text-[11px] text-muted-foreground">
              {new Date(project.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </time>
          )}
        </div>
      </div>
    </article>
  )
}