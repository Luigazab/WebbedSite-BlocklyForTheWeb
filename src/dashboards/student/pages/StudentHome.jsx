import { Globe, CodeXml, BookOpenText, Sheet, LandPlot, EarthLockIcon } from 'lucide-react';
import RecentProjectCard from '../components/RecentProjectCard';
import ProjectCard from '../components/ProjectCard';
import { Divider } from '../../../components/public/Divider';
import PageWrapper from '../../../components/layout/PageWrapper';
import { useNavigate } from 'react-router';

const StudentHome = () => {
  const navigate = useNavigate();
  const projectTypes = [
    { icon: CodeXml, title: 'Create', color: 'bg-blockly-blue/90', to:'editor' },
    { icon: BookOpenText, title: 'Learn', color: 'bg-blockly-red/90', to:'lessons' },
    { icon: LandPlot, title: 'Explore', color: 'bg-blockly-green/90', to:'tutorials' },
    { icon: EarthLockIcon, title: 'Join', color: 'bg-blockly-purple/90', to:'classrooms' },
  ];

  const recentProjects = [
    {
      title: 'Broken Wave',
      type: 'HTML',
      tags: ['Blocks'],
      editedTime: 'Edited 13 seconds ago',
      icon: Globe
    }
  ];

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Home</h1>

        {/* Hero Banner */}
        <div className="bg-blockly-dark/80 rounded-2xl text-white bg-[url('/home_bg.jpg')] bg-cover bg-center shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-around gap-20 p-4 md:p-8 md:px-18 mb-8 bg-purple-950/80 rounded-2xl">
            <div className="rounded-lg">
              <img src="/icon.png" alt="Logo of webbedsite" className='max-h-50'/>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">
                Welcome to <span className="bg-blockly-green px-2 rounded">WebbedSite</span>
              </h2>
              <p className="mb-6 text-white max-w-2xl">
                Kickstart your web development journey with fun, interactive building blocks! 
                Learn the essentials of HTML, CSS, and JavaScript in a playful, hands-on way that makes coding click.
              </p>
              <button className="btn btn-accent">Get Started</button>
            </div>
          </div>
        </div>

        {/* Create New Project */}
        <section className="mb-8">
          <Divider/>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 my-2">
            {projectTypes.map((project) => (
              <ProjectCard
                key={project.title}
                icon={project.icon}
                title={project.title}
                onClick={() => navigate(project.to)}
                color={project.color}
              />
            ))}
          </div>
        </section>

        {/* Recent Projects */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Projects</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentProjects.map((project, index) => (
              <RecentProjectCard
                key={index}
                {...project}
              />
            ))}
          </div>
        </section>
      </div>
    </PageWrapper>
  );
};

export default StudentHome;