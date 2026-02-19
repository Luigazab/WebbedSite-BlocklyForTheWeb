import { Menu, ChevronDown } from 'lucide-react';

const Navbar = ({ onMenuClick }) => {
  return (
    <nav className="bg-white border-b border-gray-200 fixed top-0 right-0 left-0 z-30">
      <div className="px-4 py-2 flex items-center justify-between">
        <button 
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors md:hidden"
        >
          <Menu className="w-5 h-5 text-gray-600" />
          
        </button>
        <div className="flex-1 pl-5 md:pl-20">
          <img src="./anotherlogo.png" alt=""  className='h-10'/>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            <ChevronDown className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;