import { useEffect, useState } from 'react'
import { Globe, CodeXml, BookOpenText, LandPlot, EarthLockIcon, Loader2 } from 'lucide-react'
import RecentProjectCard from '../components/RecentProjectCard'
import ProjectCard from '../components/ProjectCard'
import { Divider } from '../../../components/public/Divider'
import { useNavigate } from 'react-router'
import { useTour } from '../../../components/tour/TourProvider'
import TourSpotlight from '../../../components/tour/TourSpotlight'
import { homeTourSteps } from '../tours/homeTour'
import { projectService } from '../../../services/project.service'
import Carousel from '../../../components/layout/Carousel'

const StudentHome = () => {
  const navigate = useNavigate()
  const { startTour, activeTour, isVisible } = useTour()
  
  const [recentProjects, setRecentProjects] = useState([])
  const [loadingProjects, setLoadingProjects] = useState(true)

  const projectTypes = [
    { icon: CodeXml, title: 'Create', color: 'bg-blockly-blue/90', to: 'editor', tourId: 'create-button' },
    { icon: BookOpenText, title: 'Learn', color: 'bg-blockly-red/90', to: 'lessons', tourId: 'learn-button' },
    { icon: LandPlot, title: 'Explore', color: 'bg-blockly-green/90', to: 'tutorials', tourId: 'explore-button' },
    { icon: EarthLockIcon, title: 'Join', color: 'bg-blockly-purple/90', to: 'classrooms', tourId: 'join-button' },
  ]

  useEffect(() => {
    const fetchRecentProjects = async () => {
      try {
        setLoadingProjects(true)
        const projects = await projectService.getUserProjects({ sortBy: 'Recent' })
        setRecentProjects(projects.slice(0, 4))
      } catch (error) {
        console.error('Error fetching recent projects:', error)
      } finally {
        setLoadingProjects(false)
      }
    }

    fetchRecentProjects()
  }, [])

  // Check if user has seen the tour
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('tour_home_completed')
    if (!hasSeenTour) {
      setTimeout(() => startTour('home'), 500)
    }
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
        Home
      </h1>

      {/* Hero Banner */}
      <div data-tour="hero-banner" className="bg-blockly-dark/80 rounded-2xl text-white bg-[url('/home_bg.jpg')] bg-cover bg-center shadow-lg mb-8">
        <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-6 md:gap-8 p-6 md:p-8 bg-purple-950/80 rounded-2xl">
          <div className="rounded-lg shrink-0">
            <img 
              src="/icon.png" 
              alt="Logo of webbedsite" 
              className="max-h-24 sm:max-h-32 md:max-h-40" 
            />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Welcome to <span className="bg-blockly-green px-2 rounded inline-block">WebbedSite</span>
            </h2>
            <p className="mb-6 text-white max-w-2xl text-sm sm:text-base">
              Kickstart your web development journey with fun, interactive building blocks! 
              Learn the essentials of HTML, CSS, and JavaScript in a playful, hands-on way that makes coding click.
            </p>
            <button className="btn btn-accent w-full sm:w-auto px-8">
              Get Started
            </button>
          </div>
        </div>
      </div>

      {/* Create New Project */}
      <section className="mb-8">
        <Divider />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 my-4">
          {projectTypes.map((project) => (
            <div key={project.title} data-tour={project.tourId}>
              <ProjectCard
                icon={project.icon}
                title={project.title}
                onClick={() => navigate(project.to)}
                color={project.color}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Recent Projects */}
      <div data-tour="recent-projects" className="mb-8 mx-auto max-w-xs md:max-w- lg:max-w-5xl">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Recent Projects
        </h2>
        
        {loadingProjects ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blockly-blue" />
          </div>
        ) : recentProjects.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No projects yet. Create your first project to get started!</p>
            <button 
              onClick={() => navigate('editor')}
              className="btn btn-primary mt-4"
            >
              Create Project
            </button>
          </div>
        ) : (
          <Carousel>
            {recentProjects.map((project) => (
              <RecentProjectCard
                key={project.id}
                id={project.id}
                title={project.title}
                description={project.description}
                updated_at={project.updated_at}
                onClick={() => navigate(`/student/editor/${project.id}`)}
              />
            ))}
            
            {/* See More Card */}
            <div 
              onClick={() => navigate('/student/projects')}
              className="bg-blockly-blue border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer w-[280px] sm:w-[300px] flex-shrink-0 flex items-center justify-center group"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-white">View All Projects</h3>
                <p className="text-white/80 text-sm mt-1">
                  {recentProjects.length} projects
                </p>
              </div>
            </div>
          </Carousel>
        )}
      </div>

      {/* Tour Overlay */}
      {activeTour === 'home' && isVisible && <TourSpotlight steps={homeTourSteps} />}
    </div>
  )
}

export default StudentHome