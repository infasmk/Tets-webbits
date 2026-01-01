import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Zap, User, Bell, Globe, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { fetchNotifications } from '../services/api';
import { Notification } from '../types';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeNotif, setActiveNotif] = useState<Notification | null>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      if (isSupabaseConfigured() && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        setIsLoggedIn(!!session);
      } else {
        setIsLoggedIn(!!localStorage.getItem('mock_admin_session'));
      }
    };
    const getNotifs = async () => {
        const notifs = await fetchNotifications();
        if (notifs.length > 0) setActiveNotif(notifs[0]);
    };
    checkAuth();
    getNotifs();
  }, [location.pathname]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-brand-darker text-slate-100 font-sans selection:bg-brand-accent selection:text-brand-darker flex flex-col">
      {/* Dynamic Notification Banner */}
      <AnimatePresence>
          {activeNotif && location.pathname === '/' && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className={`w-full py-3 px-4 text-center text-sm font-bold flex items-center justify-center gap-3 relative z-[60] border-b border-white/10 ${
                    activeNotif.type === 'warning' ? 'bg-amber-500 text-brand-darker' :
                    activeNotif.type === 'success' ? 'bg-brand-accent text-brand-darker' :
                    'bg-slate-800 text-white'
                }`}
              >
                  <Bell className="w-4 h-4 animate-bounce" />
                  <span className="uppercase tracking-widest">{activeNotif.message}</span>
                  <button onClick={() => setActiveNotif(null)} className="absolute right-4 hover:scale-125 transition-transform">
                      <X className="w-4 h-4" />
                  </button>
              </motion.div>
          )}
      </AnimatePresence>

      {/* Navbar */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 border-b ${
          isScrolled
            ? 'bg-brand-dark/90 backdrop-blur-md border-slate-800 py-3'
            : 'bg-transparent border-transparent py-5'
        } ${activeNotif && location.pathname === '/' ? 'top-[40px]' : 'top-0'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-brand-accent blur-xl opacity-20 group-hover:opacity-60 transition-opacity rounded-full"></div>
                <div className="w-10 h-10 bg-brand-accent rounded-xl flex items-center justify-center text-brand-darker shadow-lg shadow-brand-accent/20 transform group-hover:rotate-12 transition-transform">
                    <Zap className="w-6 h-6" fill="currentColor" />
                </div>
              </div>
              <span className="text-2xl font-black tracking-tighter text-white italic">
                WEB <span className="text-brand-accent">BITS</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-10">
              <Link to="/" className="text-slate-400 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest">
                START
              </Link>
              <Link to="/posts" className="text-slate-400 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest">
                KNOWLEDGE
              </Link>
              <Link to={isLoggedIn ? "/admin" : "/admin/login"} className="flex items-center gap-2 text-slate-400 hover:text-brand-accent transition-colors text-[10px] font-black uppercase tracking-widest">
                <User className="w-3 h-3" />
                {isLoggedIn ? 'DASHBOARD' : 'ADMIN'}
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-slate-300 hover:text-brand-accent transition-colors"
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              className="fixed inset-0 z-50 md:hidden bg-brand-darker/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8 p-8"
            >
                <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-6 right-6 text-slate-400">
                    <X className="w-8 h-8" />
                </button>
                <Link to="/" className="text-4xl font-black italic hover:text-brand-accent">START</Link>
                <Link to="/posts" className="text-4xl font-black italic hover:text-brand-accent">KNOWLEDGE</Link>
                <Link to={isLoggedIn ? "/admin" : "/admin/login"} className="text-4xl font-black italic hover:text-brand-accent">DASHBOARD</Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className={`flex-grow relative z-0 ${activeNotif && location.pathname === '/' ? 'pt-10' : ''}`}>
         {children}
      </main>

      {/* Footer */}
      <footer className="bg-brand-dark border-t border-slate-800 py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6">
               <Zap className="w-6 h-6 text-brand-accent" fill="currentColor" />
               <span className="text-2xl font-black italic text-slate-200 uppercase tracking-tighter">Web Bits</span>
            </Link>
            <p className="text-slate-500 max-w-sm mb-6 font-medium leading-relaxed">The premier engineering library for React developers, architects, and product builders.</p>
            <div className="flex gap-4">
                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-brand-accent/20 cursor-pointer transition-colors"><Globe className="w-5 h-5 text-slate-400" /></div>
                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-brand-accent/20 cursor-pointer transition-colors"><Shield className="w-5 h-5 text-slate-400" /></div>
            </div>
          </div>
          <div>
              <h4 className="text-white font-black uppercase text-[10px] tracking-widest mb-6">RESOURCES</h4>
              <ul className="space-y-4 text-slate-500 text-sm font-bold">
                  <li><Link to="/posts" className="hover:text-brand-accent transition-colors uppercase">All Posts</Link></li>
                  <li><Link to="/posts" className="hover:text-brand-accent transition-colors uppercase">Atomic Hooks</Link></li>
                  <li><Link to="/posts" className="hover:text-brand-accent transition-colors uppercase">Auth Guide</Link></li>
              </ul>
          </div>
          <div className="text-right">
            <h4 className="text-white font-black uppercase text-[10px] tracking-widest mb-6">CREDITS</h4>
            <p className="text-slate-500 text-sm font-bold">&copy; {new Date().getFullYear()} WEB BITS CORE</p>
            <p className="mt-2 text-slate-600 text-xs">DESIGNED BY <span className="text-brand-accent uppercase">TEAM AWT</span></p>
            <Link to={isLoggedIn ? "/admin" : "/admin/login"} className="mt-8 inline-block text-[10px] text-slate-700 hover:text-slate-400 font-black uppercase tracking-widest border border-slate-800 px-4 py-2 rounded-lg">
              SYSTEM CONSOLE
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;