
const Footer = () => {
  const footerLinks = {
    Product: ['Features', 'Use Cases', 'Updates'],
    Resources: ['Documentation', 'Tutorials', 'Teacher Resources', 'Blog'],
    Community: ['Gallery', 'Forum', 'Events', 'Contributors'],
    Company: ['About', 'Contact', 'Careers', 'Privacy'],
  };

  return (
    <footer className="bg-blockly-dark text-white pt-16 pb-8 rounded-t-3xl">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row justify-between gap-12">
          {/* Brand Section */}
          <div className="lg:w-1/3">
            <div className="flex items-center space-x-3 mb-6">
              <img src="/anotherlogo.png" alt="" className='w-50' />
            </div>
            <p className="text-gray-300 mb-8">
              The visual programming editor for HTML and CSS. Making web development 
              accessible and fun for everyone, from kids to adults.
            </p>
            
            <div className="flex">
              <button className="btn btn-primary text-sm px-6 py-3">
                Try Now
              </button>
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:w-2/3 grid grid-cols-2 md:grid-cols-4 gap-8">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="text-xl font-bold text-blockly-yellow mb-6">
                  {category}
                </h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link}>
                      <a 
                        href="#" 
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-8"></div>

        {/* Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center text-gray-400">
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
      </div>
    </footer>
  );
};

export default Footer;