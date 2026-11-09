import ThemeSelect from '../common/ThemeSelect'
import { PuzzlePieceIcon } from '@heroicons/react/24/solid';
import { Link, NavLink, useNavigate } from 'react-router';

const Header = () => {
  // const navigate = useNavigate();
  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Lesson', href: '/lesson' },
    { label: 'Documentary', href: '/documentary' },
    { label: 'Try It', href: '/try-editor' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-card shadow-lg">
      <div className="max-w-400 w-full font-bold mx-auto px-3 md:px-12 py-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Logo */}
          <a href="/" className="flex items-center space-x-3">
            <img src="/anotherlogo.png" alt="WebbedSite" className='w-38 p-0 translate-y-1' />
          </a>

          {/* Navigation */}
          <nav className="hidden md:flex text-foreground bg-muted rounded-full items-center shadow-[inset_4px_2px_4px_rgba(0,0,0,0.1)]">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.href}
                className="topActive text-lg hover:text-foreground hover:-translate-y-1 hover:border-b-3 hover:border-b-blockly-dark/50 flex items-center justify-center hover:shadow-lg hover:bg-card rounded-full px-4 py-2 transition-all duration-300 ease-in-out"
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Get Started Button */}
          <div className='flex flex-wrap items-center justify-end gap-2'>
          <ThemeSelect compact />
          <Link to="/login">
            <button className="btn btn-secondary">
                Login
            </button>
          </Link>
          <Link to="/register">
            <button className="btn btn-lead">
                Get Started
            </button>
          </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;