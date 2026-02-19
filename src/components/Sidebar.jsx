import { Link, useLocation } from 'react-router';
import { 
  Home, 
  FolderOpen, 
  BookOpen, 
  Users, 
  MessageSquare, 
  HelpCircle, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: FolderOpen, label: 'Projects', path: '/projects' },
    { icon: BookOpen, label: 'Learn', path: '/learn' },
    { icon: Users, label: 'Classrooms', path: '/classrooms' },
    { icon: MessageSquare, label: 'Feedback', path: '/feedback' },
    { icon: HelpCircle, label: 'Support', path: '/support' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div 
      className={`${
        isCollapsed ? 'w-16' : 'w-64'
      } bg-gray-50 border-r border-gray-300 transition-all duration-300 flex flex-col h-screen fixed left-0 top-0 z-40`}
    >
      {/* Logo and Menu Toggle */}
      <div className="p-3 flex items-center justify-between border-b border-gray-200">
        {!isCollapsed && (
          <img src="./anotherlogo.png" alt=""  className='h-10'/>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Create Project Button */}
      <div className="p-3">
        <button className="w-full flex justify-center items-center btn btn-primary gap-2 py-2">
          <Plus className="w-5 h-5" />
          {!isCollapsed && <span className="font-bold">Create Project</span>}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                active
                  ? 'bg-blockly-blue/10 text-blockly-blue'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title={isCollapsed ? item.label : ''}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!isCollapsed && (
                <span className="font-bold">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={`p-4 border-t border-gray-200 text-xs text-gray-500 ${isCollapsed ? 'text-center' : ''}`}>
        {!isCollapsed && (
          <Link to="">
            <p className="mt-1">© 2026 WebbedSite</p>
          </Link>
        )}
        {isCollapsed && <p>©</p>}
      </div>
    </div>
  );
};

export default Sidebar;