const CTA = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="bg-linear-to-r from-blockly-blue via-purple-500 to-blockly-green rounded-3xl p-12 text-center shadow-2xl">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Start Building with Blocks Today!
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join thousands of students, teachers, and creators who are learning web development the fun way. 
            No installation required - works right in your browser!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button className="btn bg-white text-blockly-blue text-xl px-12 py-5 hover:bg-gray-100">
              Sign Up for BlocklyForWeb
            </button>
            <button className="btn bg-transparent border-2 border-white text-white text-xl px-12 py-5 hover:bg-white/10">
              View Demo Projects
            </button>
          </div>
          
          <div className="mt-12 flex justify-center space-x-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">100%</div>
              <div className="text-white/80">Free for Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">No Credit Card</div>
              <div className="text-white/80">Required</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">Instant</div>
              <div className="text-white/80">Access</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;