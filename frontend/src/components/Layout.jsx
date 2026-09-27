import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SignedIn, UserButton } from '@clerk/clerk-react';
import { useInvoiceApi } from '../api';
import {
  LayoutDashboard,
  Receipt,
  PlusCircle,
  Sparkles,
  Users,
  Building,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Search,
  Menu
} from 'lucide-react';

const Layout = ({ children }) => {
  const location = useLocation();
  const api = useInvoiceApi();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
  });
  const [companyName, setCompanyName] = useState('AIinvoice');
  const [searchVal, setSearchVal] = useState('');

  // Fetch business profile for header coordinates
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await api.getProfile();
        if (res.success && res.data && res.data.businessName) {
          setCompanyName(res.data.businessName);
        }
      } catch {
        // Fallback to default
      }
    };
    fetchCompany();
  }, [location.pathname, api]);

  // Handle Dark Theme Syncing
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

  // Determine active route name
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path === '/profile') return 'Business Profile';
    if (path === '/invoice/new') return 'Create Invoice';
    if (path.startsWith('/invoice/edit/')) return 'Edit Invoice';
    if (path.startsWith('/invoice/')) return 'Invoice Details';
    return 'AIinvoice';
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Invoices', path: '/', icon: Receipt },
    { name: 'Create Invoice', path: '/invoice/new', icon: PlusCircle },
    { name: 'AI Generator', path: '/invoice/new?mode=ai', icon: Sparkles },
    { name: 'Customers', path: '/', icon: Users },
    { name: 'Business Profile', path: '/profile', icon: Building },
    { name: 'Analytics', path: '/', icon: BarChart3 },
    { name: 'Settings', path: '/profile', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-bg-app text-text-primary transition-colors duration-300 flex animate-fade-in">
      
      {/* SIDEBAR CONTAINER */}
      <aside
        className={`hidden md:flex flex-col bg-card-app border-r border-border-app transition-all duration-300 sticky top-0 h-screen no-print ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border-app shrink-0">
          {!isSidebarCollapsed && (
            <Link to="/" className="flex items-center gap-2 font-bold hover:opacity-90 transition-all">
              <span className="bg-linear-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent font-black tracking-tight text-lg">
                AIinvoice
              </span>
            </Link>
          )}
          {isSidebarCollapsed && (
            <div className="mx-auto p-1.5 rounded-xl bg-brand-primary/10">
              <Receipt className="h-5 w-5 text-brand-primary" />
            </div>
          )}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 rounded-lg border border-border-app hover:bg-card-secondary text-text-secondary active:scale-95 transition-transform"
          >
            {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Sidebar Items */}
        <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const active = location.pathname === item.path && (item.name !== 'AI Generator' || location.search.includes('mode=ai'));
            
            return (
              <Link
                key={idx}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 ${
                  active
                    ? 'bg-brand-primary text-white shadow-sm shadow-brand-primary/15'
                    : 'text-text-secondary hover:bg-card-secondary hover:text-text-primary'
                }`}
              >
                <Icon className={`h-5 w-5 shrink-0 ${active ? 'text-white' : 'text-text-secondary'}`} />
                {!isSidebarCollapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        {!isSidebarCollapsed && (
          <div className="p-4 border-t border-border-app shrink-0 text-center text-[10px] text-text-secondary font-medium">
            © 2026 AIInvoice. Intelligent invoicing made simple.
          </div>
        )}
      </aside>

      {/* RIGHT MAIN PANEL */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP NAVIGATION BAR */}
        <header className="h-16 bg-card-app/80 backdrop-blur-md border-b border-border-app sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 no-print">
          
          {/* Logo & Company info on Left */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl md:hidden hover:bg-card-secondary text-text-secondary"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <Link to="/" className="flex items-center gap-2 font-bold md:hidden">
              <span className="bg-linear-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent font-black tracking-tight">
                AIinvoice
              </span>
            </Link>
            
            <div className="hidden md:flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                <Building className="h-4.5 w-4.5 text-brand-primary" />
              </div>
              <span className="font-extrabold text-sm max-w-37.5 truncate text-text-primary">
                {companyName}
              </span>
            </div>
          </div>

          {/* Center Page Title */}
          <div className="hidden sm:block text-sm font-extrabold tracking-tight text-text-primary text-center">
            {getPageTitle()}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            
            {/* Simple Search bar */}
            <div className="relative hidden lg:block w-48 xl:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-secondary" />
              <input
                type="text"
                placeholder="Search..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-border-app rounded-xl bg-bg-app text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary text-text-primary placeholder-slate-400 font-semibold"
              />
            </div>

            {/* Light/Dark Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-text-secondary hover:bg-card-secondary transition-all"
            >
              {isDarkMode ? <Sun className="h-4.5 w-4.5 text-amber-500" /> : <Moon className="h-4.5 w-4.5 text-brand-primary" />}
            </button>

            {/* Clerk User Button */}
            <SignedIn>
              <div className="pl-1.5 border-l border-border-app flex items-center">
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>

          </div>
        </header>

        {/* MOBILE DRAWER */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div
              className="w-64 bg-card-app h-full border-r border-border-app flex flex-col p-4 animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <span className="font-extrabold bg-linear-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                  AIinvoice
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-lg border border-border-app text-text-secondary"
                >
                  ✕
                </button>
              </div>
              <nav className="flex-1 space-y-1">
                {navItems.map((item, idx) => {
                  const Icon = item.icon;
                  const active = location.pathname === item.path;
                  return (
                    <Link
                      key={idx}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        active
                          ? 'bg-brand-primary text-white shadow-sm shadow-brand-primary/15'
                          : 'text-text-secondary hover:bg-card-secondary'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* INNER CONTENT WRAPPER */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  );
};

export default Layout;
