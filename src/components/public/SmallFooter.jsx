const SmallFooter = () => {
  return (
    <footer className="bg-blockly-dark text-white py-8 rounded-t-3xl">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-gray-400">
          <div className="mb-4 md:mb-0">
            &copy; 2026 WebbedSite. All rights reserved.
          </div>
          <div className="text-center">
            Based on Google's Blockly framework. Made with ❤️ for educators and learners.
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            {/* <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a> */}
          </div>
        </div>
    </footer>
  )
}

export default SmallFooter;