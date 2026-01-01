import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Zap, User, Bell, Globe, Shield, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { fetchNotifications } from '../services/api';
import { Notification } from '../types';

const DISMISSED_NOTIFS_KEY = 'wb_dismissed_notifications';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeNotif, setActiveNotif] = useState<Notification | null>(null);
  
  // Initialize dismissed IDs from localStorage to persist across route changes and refreshes
  const [dismissedNotifIds, setDismissedNotifIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(DISMISSED_NOTIFS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

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
      setIsScrolled(window.scrollY > 50);
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
        try {
            // Fetch only active notifications from the server
            const notifs = await fetchNotifications(true);
            
            // Filter out any notification that has been dismissed by the user in this session or previously
            const displayNotif = notifs.find(n => !dismissedNotifIds.includes(n.id));
            
            setActiveNotif(displayNotif || null);
        } catch (error) {
            console.error("Critical: Failed to sync notification bridge", error);
        }
    };

    checkAuth();
    getNotifs();
  }, [location.pathname, dismissedNotifIds]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleDismissNotification = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (activeNotif) {
        const idToDismiss = activeNotif.id;
        const updatedDismissed = [...dismissedNotifIds, idToDismiss];
        
        // Save to state and localStorage immediately
        setDismissedNotifIds(updatedDismissed);
        try {
          localStorage.setItem(DISMISSED_NOTIFS_KEY, JSON.stringify(updatedDismissed));
        } catch (err) {
          console.warn("Storage write failed, dismissal will only last for current session");
        }
        
        // Clear UI immediately
        setActiveNotif(null);
    }
  };

  return (
    <div className="min-h-screen bg-brand-darker text-slate-100 font-sans selection:bg-brand-accent selection:text-brand-darker flex flex-col">
      
      {/* Pop-up Notification System */}
      <AnimatePresence mode="wait">
          {activeNotif && (
              <motion.div 
                key={activeNotif.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } }}
                className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[100] w-[calc(100%-3rem)] sm:w-[450px]"
              >
                  <div className={`relative overflow-hidden p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border shadow-[0_30px_90px_-20px_rgba(0,0,0,0.8)] backdrop-blur-3xl ${
                      activeNotif.type === 'warning' ? 'bg-amber-500/10 border-amber-500/40' :
                      activeNotif.type === 'success' ? 'bg-brand-accent/10 border-brand-accent/40' :
                      'bg-slate-900/90 border-slate-700/50'
                  }`}>
                      <button 
                        onClick={handleDismissNotification} 
                        className="absolute top-4 right-4 md:top-6 md:right-6 p-2 text-slate-500 hover:text-white transition-colors z-10"
                        title="Dismiss and hide forever"
                      >
                          <X className="w-5 h-5 md:w-6 md:h-6" />
                      </button>

                      <div className="flex gap-4 md:gap-6">
                          <div className={`w-12 h-12 md:w-14 md:h-14 rounded-[1.2rem] md:rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-lg ${
                            activeNotif.type === 'warning' ? 'bg-amber-500 text-brand-darker' :
                            activeNotif.type === 'success' ? 'bg-brand-accent text-brand-darker' :
                            'bg-slate-800 text-brand-accent'
                          }`}>
                              <Bell className="w-6 h-6 md:w-8 md:h-8" />
                          </div>
                          <div className="flex-1 pr-6 md:pr-8">
                              <h4 className="text-white font-black text-[9px] md:text-[10px] uppercase tracking-[0.3em] mb-2 md:mb-3">Priority Signal</h4>
                              <p className="text-slate-200 text-sm md:text-base font-medium leading-relaxed italic break-words">
                                  {getSafeStr(activeNotif.message)}
                              </p>
                              
                              {activeNotif.buttonText && activeNotif.buttonLink && (
                                  <div className="mt-6 md:mt-8">
                                      <a 
                                        href={ensureAbsoluteUrl(activeNotif.buttonLink)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`inline-flex items-center gap-3 px-8 py-3.5 md:px-10 md:py-4 rounded-xl md:rounded-[1.2rem] font-black text-[10px] md:text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-xl ${
                                            activeNotif.type === 'warning' ? 'bg-amber-500 text-brand-darker hover:bg-white' :
                                            activeNotif.type === 'success' ? 'bg-brand-accent text-brand-darker hover:bg-white' :
                                            'bg-white text-brand-darker hover:bg-slate-200'
                                        }`}
                                      >
                                          {getSafeStr(activeNotif.buttonText)}
                                          <ExternalLink className="w-4 h-4" />
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
        className={`fixed w-full z-50 transition-all duration-500 top-0 ${
          isScrolled
            ? 'bg-brand-darker/80 backdrop-blur-2xl border-b border-slate-800/60 py-4'
            : 'bg-transparent border-b border-transparent py-8'
        }`}
      >
        <div className="max-w-7xl mx-auto px-8 lg:px-12">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-4 group">
              <div className="relative">
                <div className="absolute inset-0 bg-brand-accent blur-2xl opacity-0 group-hover:opacity-40 transition-opacity rounded-full"></div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-brand-accent rounded-xl md:rounded-2xl flex items-center justify-center text-brand-darker shadow-2xl transition-all group-hover:rotate-12 group-hover:scale-110">
                    <Zap className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" />
                </div>
              </div>
              <span className="text-2xl md:text-3xl font-black tracking-tighter text-white italic">
                WEB<span className="text-brand-accent">BITS</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-14">
              {['START', 'KNOWLEDGE'].map((label) => (
                  <Link 
                    key={label}
                    to={label === 'START' ? '/' : '/posts'} 
                    className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:text-brand-accent ${
                        (label === 'START' && location.pathname === '/') || (label === 'KNOWLEDGE' && location.pathname === '/posts')
                        ? 'text-brand-accent'
                        : 'text-slate-500'
                    }`}
                  >
                    {label}
                  </Link>
              ))}
              <Link 
                to={isLoggedIn ? "/admin" : "/admin/login"} 
                className="flex items-center gap-2 text-slate-500 hover:text-white transition-all text-[11px] font-black uppercase tracking-[0.2em]"
              >
                <div className="w-8 h-8 rounded-full border border-slate-800 flex items-center justify-center group-hover:border-white transition-colors">
                    <User className="w-4 h-4" />
                </div>
                {isLoggedIn ? 'CONSOLE' : 'ACCESS'}
              </Link>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-slate-300 hover:text-brand-accent transition-colors"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              className="fixed inset-0 z-[100] md:hidden bg-brand-darker/98 backdrop-blur-3xl flex flex-col items-center justify-center gap-10 p-12"
            >
                <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-10 right-10 text-slate-400">
                    <X className="w-10 h-10" />
                </button>
                <Link to="/" className="text-5xl font-black italic hover:text-brand-accent transition-colors">START</Link>
                <Link to="/posts" className="text-5xl font-black italic hover:text-brand-accent transition-colors">KNOWLEDGE</Link>
                <Link to={isLoggedIn ? "/admin" : "/admin/login"} className="text-5xl font-black italic hover:text-brand-accent transition-colors">CONSOLE</Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="flex-grow relative z-0">
         {children}
      </main>

      <footer className="bg-brand-darker border-t border-slate-800/50 py-24 md:py-32 relative z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-4 gap-16 md:gap-20">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-4 mb-8 md:mb-10">
               <Zap className="w-8 h-8 text-brand-accent" fill="currentColor" />
               <span className="text-3xl font-black italic text-white tracking-tighter">WEB BITS</span>
            </Link>
            <p className="text-slate-500 max-w-md mb-8 md:mb-10 font-medium leading-relaxed italic text-base md:text-lg">
                The premier engineering matrix for modern web architects and product builders.
            </p>
            <div className="flex gap-5 md:gap-6">
                {[Globe, Shield].map((Icon, i) => (
                    <div key={i} className="w-12 h-12 md:w-14 md:h-14 bg-brand-surface rounded-xl md:rounded-[1.2rem] border border-slate-800 flex items-center justify-center hover:bg-brand-accent/20 cursor-pointer transition-all hover:-translate-y-1">
                        <Icon className="w-6 h-6 md:w-7 md:h-7 text-slate-400" />
                    </div>
                ))}
            </div>
          </div>
          <div>
              <h4 className="text-white font-black uppercase text-[10px] md:text-[11px] tracking-[0.3em] mb-8 md:mb-10">ARCHIVE</h4>
              <ul className="space-y-4 md:space-y-6 text-slate-500 text-sm font-bold">
                  {['All Blueprints', 'Atomic Hooks', 'Matrix Auth'].map((link) => (
                      <li key={link}><Link to="/posts" className="hover:text-brand-accent transition-colors italic tracking-tight">{link}</Link></li>
                  ))}
              </ul>
          </div>
          <div className="md:text-right">
            <h4 className="text-white font-black uppercase text-[10px] md:text-[11px] tracking-[0.3em] mb-8 md:mb-10">PROTOCOL</h4>
            <p className="text-slate-500 text-sm font-bold italic">&copy; {new Date().getFullYear()} CORE SYSTEMS</p>
            <p className="mt-4 text-slate-700 text-[10px] md:text-xs font-black tracking-widest uppercase">ENGINEERED BY <span className="text-brand-accent">TEAM AWT</span></p>
            <Link to={isLoggedIn ? "/admin" : "/admin/login"} className="mt-10 md:mt-12 inline-block text-[10px] md:text-[11px] text-slate-600 hover:text-brand-accent font-black uppercase tracking-[0.2em] border border-slate-800 px-6 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl transition-all hover:border-brand-accent">
              CONSOLE ROOT
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;