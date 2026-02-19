import { 
  UserGroupIcon, 
  RocketLaunchIcon, 
  BuildingLibraryIcon 
} from '@heroicons/react/24/solid';

const WhyBlockly = () => {
  const reasons = [
    {
      icon: <UserGroupIcon className="h-12 w-12" />,
      title: 'Beginner Friendly',
      description: 'Designed for kids and beginners with a colorful, intuitive interface that makes learning to code fun and engaging.',
      color: 'bg-blue-50'
    },
    {
      icon: <RocketLaunchIcon className="h-12 w-12" />,
      title: 'Powerful & Flexible',
      description: 'Create responsive websites with modern HTML5 and CSS3 features. Export your projects to continue coding in any editor.',
      color: 'bg-green-50'
    },
    {
      icon: <BuildingLibraryIcon className="h-12 w-12" />,
      title: 'Classroom Ready',
      description: 'Teacher dashboards, classroom management tools, and curriculum-aligned lessons for schools and coding camps.',
      color: 'bg-red-50'
    }
  ];

  return (
    <section id="why" className="py-10 bg-linear-to-b from-blue-50 to-purple-50 rounded-3xl">
      <div className="container mx-auto px-6 my-20">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-4">
          Why BlocklyForWeb?
        </h2>
        <div className="w-24 h-2 bg-linear-to-r from-blockly-red to-blockly-yellow rounded-full mx-auto mb-16"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reasons.map((reason, index) => (
            <div 
              key={index} 
              className={`${reason.color} p-8 rounded-3xl shadow-lg transform transition-all duration-300 hover:scale-105`}
            >
              <div className="text-blockly-blue mb-6">
                {reason.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {reason.title}
              </h3>
              <p className="text-gray-600">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
        
        {/* Testimonial */}
        <div className="my-20 bg-white rounded-3xl p-8 shadow-xl">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/3 flex justify-center">
              <div className="w-32 h-32 bg-linear-to-br from-blockly-blue to-blockly-green rounded-full flex items-center justify-center">
                <span className="text-white text-4xl font-bold">JS</span>
              </div>
            </div>
            <div className="md:w-2/3 mt-8 md:mt-0">
              <blockquote className="text-2xl italic text-gray-700 mb-6">
                "BlocklyForWeb transformed how I teach web development. My students went from being intimidated by code to creating full websites in just two weeks!"
              </blockquote>
              <div className="text-lg font-semibold text-gray-900">
                Sarah Johnson
              </div>
              <div className="text-gray-600">
                Computer Science Teacher • Middle School
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyBlockly;