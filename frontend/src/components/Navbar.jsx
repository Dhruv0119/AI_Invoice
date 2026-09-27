import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserButton, SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/clerk-react';
import { User, LayoutDashboard, Menu, X, Sun, Moon } from 'lucide-react';
import logo from '../assets/logo.png';

const Navbar = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Business Profile', path: '/profile', icon: User },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full glass shadow-sm transition-all duration-355 no-print">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight hover:opacity-90 active:scale-95 transition-all">
              <img src={logo} alt="AI Invoice logo" className="h-10 w-10 rounded-xl object-cover shadow-md" />
              <span className="bg-linear-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent font-black tracking-tight">
                AIinvoice
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <SignedIn>
            <div className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 ${
                      active
                        ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/15'
                        : 'text-text-secondary hover:bg-card-secondary dark:hover:bg-card-secondary hover:text-text-primary nav-link-hover'
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </SignedIn>

          {/* Action buttons (Theme Toggle, Auth Buttons) */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle Trigger */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl text-text-secondary hover:bg-card-secondary transition-all active:scale-90 cursor-pointer flex items-center justify-center border border-border-app"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? (
                <Sun className="h-4.5 w-4.5 text-amber-550 animate-pulse" />
              ) : (
                <Moon className="h-4.5 w-4.5 text-brand-primary" />
              )}
            </button>

            <SignedIn>
              <div className="flex items-center gap-3 pl-2 border-l border-border-app">
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-9 h-9 rounded-xl border border-border-app shadow-sm hover:shadow-md transition-shadow active:scale-95"
                    }
                  }}
                />
              </div>
            </SignedIn>

            <SignedOut>
              <div className="flex items-center gap-3">
                <SignInButton mode="modal">
                  <button className="px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-card-secondary rounded-xl transition-all active:scale-95 cursor-pointer">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-5 py-2.5 text-sm font-bold text-white bg-brand-primary hover:bg-brand-primary-hover rounded-xl shadow-md hover:shadow-brand-primary/10 active:scale-95 transition-all cursor-pointer">
                    Get Started
                  </button>
                </SignUpButton>
              </div>
            </SignedOut>
          </div>

          {/* Mobile Menu & Theme Toggle */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-text-secondary hover:bg-card-secondary transition-all active:scale-90"
            >
              {isDarkMode ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-brand-primary" />}
            </button>

            <SignedIn>
              <UserButton afterSignOutUrl="/" />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl text-text-secondary hover:bg-card-secondary transition-all active:scale-90"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-3.5 py-1.5 text-sm font-semibold text-brand-primary border border-brand-primary/20 hover:bg-brand-primary/5 rounded-xl transition-all active:scale-95">
                  Login
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <SignedIn>
          <div className="md:hidden border-t border-border-app bg-card-app/95 py-2 px-4 space-y-1 animate-fade-in shadow-inner">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-base font-semibold transition-all ${
                    active
                      ? 'bg-brand-primary/10 text-brand-primary'
                      : 'text-text-secondary hover:bg-card-secondary'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {link.name}
                </Link>
              );
            })}
          </div>
        </SignedIn>
      )}
    </nav>
  );
};

export default Navbar;
