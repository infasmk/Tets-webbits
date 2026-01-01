import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { LayoutDashboard, FileText, Settings, LogOut, Loader2, Image as ImageIcon, Menu, X, Zap, Bell } from 'lucide-react';
import { fetchNotifications } from '../services/api';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkUser();
    loadNotifications();
  }, []);

  const checkUser = async () => {
    if (!isSupabaseConfigured() || !supabase) {
       const hasMockSession = localStorage.getItem('mock_admin_session');
       if (!hasMockSession) {
          navigate('/admin/login');
       }
       setLoading(false);
       return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/admin/login');
    }
    setLoading(false);
  };

  const loadNotifications = async () => {
      const data = await fetchNotifications();
      setHasUnread(data.length > 0);
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured() && supabase) {
        await supabase.auth.signOut();
    } else {
        localStorage.removeItem('mock_admin_session');
    }
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-darker flex items-center justify-center text-brand-accent">
        <Loader2 className="animate-spin w-10 h-10" />
      </div>
    );
  }

  const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
    const isActive = location.pathname === to;
    return (
        <Link
          to={to}
          onClick={() => setIsSidebarOpen(false)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            isActive
              ? 'bg-brand-accent text-brand-darker font-bold shadow-lg shadow-brand-accent/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Icon className="w-5 h-5" />
          <span>{label}</span>
        </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-brand-darker text-slate-100 font-sans">
      {/* Sidebar - Desktop */}
      <aside className={`w-64 border-r border-slate-800 bg-brand-dark fixed h-full transition-transform duration-300 z-[60] md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:flex flex-col p-6`}>
        <div className="flex items-center justify-between mb-10 px-2">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-accent rounded-lg flex items-center justify-center text-brand-darker font-bold">
                    A
                </div>
                <span className="font-bold text-xl">Admin Panel</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400">
                <X className="w-6 h-6" />
            </button>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem to="/admin" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/admin/posts" icon={FileText} label="All Posts" />
          <NavItem to="/admin/post/new" icon={FileText} label="New Post" />
          <NavItem to="/admin/media" icon={ImageIcon} label="Media" />
        </nav>

        <div className="pt-6 border-t border-slate-800">
           <button 
             onClick={handleLogout}
             className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all w-full"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
           </button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[50] md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - Mobile & Desktop Convenience */}
        <header className="h-16 border-b border-slate-800 bg-brand-dark/50 backdrop-blur-md sticky top-0 z-40 px-4 md:px-8 md:ml-64 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-slate-400 hover:text-white">
                    <Menu className="w-6 h-6" />
                </button>
                <Link to="/" className="flex items-center gap-1 md:hidden">
                    <Zap className="w-5 h-5 text-brand-accent" fill="currentColor" />
                    <span className="font-bold text-sm">WEB BITS</span>
                </Link>
                <div className="hidden md:block text-slate-400 text-sm">
                    {location.pathname === '/admin' ? 'Dashboard Summary' : 'Editing Mode'}
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative">
                    <Bell className="w-5 h-5 text-slate-400" />
                    {hasUnread && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand-accent rounded-full border border-brand-dark animate-pulse"></span>
                    )}
                </div>
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
                >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Logout</span>
                </button>
            </div>
        </header>

        <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
