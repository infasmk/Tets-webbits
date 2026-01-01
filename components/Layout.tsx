import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Zap, User, Bell, Globe, Shield, ExternalLink } from 'lucide-react';
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

  const getSafeStr = (val: any, fallback: string = ''): string => {
    if (val === null || val === undefined) return fallback;
    if (typeof val === 'object') {
      const check = val.message || val.text || val.title || val.name || val.value || val.rendered;
      if (check !== undefined && check !== null) {
        if (typeof check === 'string') return check === '[object Object]' ? fallback : check;
        if (typeof check === 'number') return String(check);
        try { return JSON.stringify(check); } catch { return fallback; }
      }
      try {
        const s = JSON.stringify(val);
        return (s === '{}' || s === '[]') ? fallback : s;
      } catch { return fallback; }
    }
    const res = String(val);
    return res === '[object Object]' ? fallback : res;
  };

  const ensureAbsoluteUrl = (url: string) => {
    if (!url) return '';
    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('mailto:') || trimmed.startsWith('tel:') || trimmed.startsWith('#')) {
      return trimmed;
    }
    return `https://${trimmed}`;
  };

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
        if (notifs.length > 0) {
            // Show latest active notification
            setActiveNotif(notifs[0]);
        }
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
      
      {/* Pop-up Notification System */}
      <AnimatePresence>
          {activeNotif && (
              <motion.div 
                initial={{ opacity: 0, y: 100, scale: 0.9, x: 20 }}
                animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed bottom-6 right-6 z-[100] w-[calc(100%-3rem)] sm:w-[400px]"
              >
                  <div className={`relative overflow-hidden p-6 rounded-[2rem] border shadow-2xl backdrop-blur-2xl ${
                      activeNotif.type === 'warning' ? 'bg-amber-500/10 border-amber-500/30' :
                      activeNotif.type === 'success' ? 'bg-brand-accent/10 border-brand-accent/30' :
                      'bg-slate-800/80 border-slate-700/50'
                  }`}>
                      <button 
                        onClick={() => setActiveNotif(null)} 
                        className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition-colors"
                      >
                          <X className="w-5 h-5" />
                      </button>

                      <div className="flex gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                            activeNotif.type === 'warning' ? 'bg-amber-500 text-brand-darker' :
                            activeNotif.type === 'success' ? 'bg-brand-accent text-brand-darker' :
                            'bg-slate-700 text-brand-accent'
                          }`}>
                              <Bell className="w-6 h-6 animate-pulse" />
                          </div>
                          <div className="flex-1 pr-6">
                              <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-2">System Message</h4>
                              <p className="text-slate-300 text-sm font-medium leading-relaxed break-words">
                                  {getSafeStr(activeNotif.message)}
                              </p>
                              
                              {activeNotif.buttonText && activeNotif.buttonLink && (
                                  <div className="mt-5">
                                      <a 
                                        href={ensureAbsoluteUrl(activeNotif.buttonLink)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg ${
                                            activeNotif.type === 'warning' ? 'bg-amber-500 text-brand-darker hover:bg-amber-400' :
                                            activeNotif.type === 'success' ? 'bg-brand-accent text-brand-darker hover:bg-brand-accentHover' :
                                            'bg-white text-brand-darker hover:bg-slate-200'
                                        }`}
                                      >
                                          {getSafeStr(activeNotif.buttonText)}
                                          <ExternalLink className="w-3.5 h-3.5" />
                                      </a>
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>
              </motion.div>
          )}
      </AnimatePresence>

      {/* Navbar */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 border-b top-0 ${
          isScrolled
            ? 'bg-brand-dark/90 backdrop-blur-md border-slate-800 py-3'
            : 'bg-transparent border-transparent py-5'
        }`}
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

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-slate-300 hover:text-brand-accent transition-colors"
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

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

      <main className="flex-grow relative z-0">
         {children}
      </main>

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