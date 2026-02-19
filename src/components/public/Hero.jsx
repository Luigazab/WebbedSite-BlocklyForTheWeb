import React from 'react';

const Hero = () => {
  return (
    <section className="container mx-auto max-w-7xl px-6 py-16 md:py-40">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Hero Content */}
        <div className="lg:w-1/2 hero-content">
          <h1>
            Build <span className="text-blockly-blue">HTML & CSS</span> with colorful blocks
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            A visual programming editor that makes web development fun and accessible for learners of all ages. 
            Drag, drop, and create beautiful websites without writing code!
          </p>
          
          <div className="flex flex-wrap gap-2 md:gap-4">
            <button className="btn btn-primary">
              Try WebbedSite Now
            </button>
            <button className="btn btn-secondary">
              Learn more
            </button>
          </div>
        </div>

        {/* Blockly Preview */}
        <div className="lg:w-1/2 bg-white rounded-3xl p-8 shadow-2xl border-8 border-blockly-yellow">
          <div className="bg-linear-to-br from-blue-100 to-purple-100 rounded-xl p-8 h-64 flex items-center justify-center">
            <div className="flex items-center space-x-4">
              {/* HTML Block */}
              <div className="block bg-blockly-blue animate-float">
                HTML
              </div>
              
              {/* Connector */}
              <div className="w-6 h-6 bg-blockly-yellow rounded-full animate-pulse-glow"></div>
              
              {/* CSS Block */}
              <div className="block bg-blockly-green animate-float" style={{ animationDelay: '0.5s' }}>
                CSS
              </div>
              
              {/* Connector */}
              <div className="w-6 h-6 bg-blockly-yellow rounded-full animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
              
              {/* JS Block */}
              <div className="block bg-blockly-red animate-float" style={{ animationDelay: '1s' }}>
                JS
              </div>
            </div>
          </div>
          
          <div className="text-center mt-6">
            <p className="text-lg font-bold text-gray-800">
              Drag and drop blocks to build your webpage
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;