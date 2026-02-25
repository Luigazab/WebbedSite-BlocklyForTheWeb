import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import PageWrapper from '../layout/PageWrapper'
import CreateProjectModal from './CreateProjectModal'
import ProjectDetailsModal from './ProjectDetailsModal'
import {
  Search, ChevronDown, Image as ImageIcon,
  ThumbsUp, MessageSquare
} from 'lucide-react'
import { Divider } from '../../../../WebbedSite Blockly try/WebbedSite/src/components/Divider'

const FILTERS = ['All', 'Public', 'Private']
const SORT_OPTIONS = ['Recent', 'Name', 'Most Liked']

// Mock data - replace with actual fetch later
const MOCK_PROJECTS = [
  {
    id: '1',
    title: 'My Website',
    description: 'A cool website project',
    thumbnail: null,
    likes: 12,
    comments: 3,
    isPublic: true,
    createdAt: new Date(),
  },
  {
    id: '2',
    title: 'Game Project',
    description: 'Interactive game using Blockly',
    thumbnail: null,
    likes: 8,
    comments: 1,
    isPublic: false,
    createdAt: new Date(),
  },
]

export default function ProjectsPage() {
  const profile = useAuthStore((s) => s.profile)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [sortBy, setSortBy] = useState('Recent')
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)

  const projects = MOCK_PROJECTS // TODO: Replace with actual filtered/sorted data

  const handleCreateProject = (projectData) => {
    console.log('Creating project:', projectData)
    // TODO: Call create service
    setShowCreateModal(false)
  }

  return (
    <PageWrapper
      title="Projects"
      subtitle="View all projects you have"
    >
      <div className="flex flex-col gap-6">
        {/* Controls bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Filter dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowFilterMenu(!showFilterMenu)
                setShowSortMenu(false)
              }}
              className="btn flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold btn-lead"
            >
              {filter}
              <ChevronDown className="w-4 h-4" />
            </button>
            {showFilterMenu && (
              <div className="absolute top-full left-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-10">
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      setFilter(f)
                      setShowFilterMenu(false)
                    }}
                    className={`w-full px-4 py-2.5 text-sm text-left
                      ${filter === f
                        ? 'bg-blockly-purple/10 text-blockly-purple font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSortMenu(!showSortMenu)
                setShowFilterMenu(false)
              }}
              className="btn flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold btn-lead"
            >
              Sort by
              <ChevronDown className="w-4 h-4" />
            </button>
            {showSortMenu && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-10">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setSortBy(option)
                      setShowSortMenu(false)
                    }}
                    className={`w-full px-4 py-2.5 text-sm text-left transition-colors
                      ${sortBy === option
                        ? 'bg-blockly-purple/10 text-blockly-purple font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search */}
          <div className="flex-1 relative min-w-75">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="w-full pl-11 pr-4 py-4 bg-gray-200 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blockly-purple/20 transition"
            />
          </div>

          {/* Create new button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            Create new
          </button>
        </div>
        <Divider/>

        {/* Projects grid or empty state */}
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 bg-linear-to-br from-purple-50 to-blue-50 rounded-3xl">
            <p className="text-lg font-bold text-gray-800 mb-2">No saved projects</p>
            <p className="text-sm text-gray-500 mb-6">Create now to start</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn bg-gray-900 text-white btn-primary"
            >
              Create new
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => setSelectedProject(project)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onConfirm={handleCreateProject}
        />
      )}

      {selectedProject && (
        <ProjectDetailsModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </PageWrapper>
  )
}

// ──────────────────────────────────────────────────────────
// Project Card Component
// ──────────────────────────────────────────────────────────
function ProjectCard({ project, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:border-blockly-purple hover:shadow-md transition-all text-left"
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-gray-100 flex items-center justify-center">
        {project.thumbnail ? (
          <img
            src={project.thumbnail}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <ImageIcon className="w-12 h-12 text-gray-300" />
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2">
        <div>
          <h3 className="font-bold text-gray-800 text-sm truncate">{project.title}</h3>
          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{project.description}</p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>{project.likes}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{project.comments}</span>
          </div>
        </div>
      </div>
    </button>
  )
}