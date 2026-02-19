import { useState } from 'react';
import { Outlet } from 'react-router';
import Sidebar from '../../Sidebar';
import Navbar from '../../Navbar';

const Dashboard = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg/50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Main Content */}
      <div 
        className={`transition-all duration-300 ${
          isCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        <Navbar onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        
        <main className="pt-24 p-6 min-h-screen bg-slate-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;