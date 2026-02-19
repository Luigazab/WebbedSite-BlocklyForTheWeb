import React from 'react';

const Stats = () => {
  const stats = [
    { number: '100+', label: 'Block Types', color: 'text-blockly-blue' },
    { number: '10+', label: 'Interactive Tutorials', color: 'text-blockly-green' },
    { number: '94%', label: 'Student Satisfaction', color: 'text-blockly-red' },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-center items-center gap-12">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="text-center transform transition-transform duration-300 hover:scale-110"
            >
              <div className={`text-7xl md:text-8xl font-extrabold ${stat.color} mb-4`}>
                {stat.number}
              </div>
              <div className="text-2xl font-bold text-gray-800">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
        \
      </div>
    </section>
  );
};

export default Stats;