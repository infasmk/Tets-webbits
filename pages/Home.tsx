
import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code, Terminal, Cpu, Zap, Star, Globe, Shield } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { fetchPosts } from '../services/api';
import { Post } from '../types';

const Home: React.FC = () => {
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse tracking for 3D effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for high-performance 3D rotation
  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [10, -10]), { stiffness: 100, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-10, 10]), { stiffness: 100, damping: 30 });

  useEffect(() => {
    fetchPosts().then(posts => {
        setFeaturedPosts(posts.slice(0, 3));
    });

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      mouseX.set(clientX - innerWidth / 2);
      mouseY.set(clientY - innerHeight / 2);
    };

    window.addEventListener('mousemove', handleMouseMove);
    // Fixed: Corrected typo from removeMouseMoveListener to removeEventListener
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const getSafeString = (val: any, fallback: string = ''): string => {
    if (val === null || val === undefined) return fallback;
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
      const check = val.title || val.name || val.text || val.value || val.label;
      if (check && typeof check !== 'object') return String(check);
      try {
          const s = JSON.stringify(val);
          return s === '{}' ? fallback : s;
      } catch { return fallback; }
    }
    return String(val);
  };

  return (
    <div className="overflow-x-hidden bg-brand-darker">
      {/* 3D PERSPECTIVE HERO */}
      <section 
        ref={containerRef}
        className="relative min-h-screen flex items-center justify-center pt-20 pb-12 px-4"
        style={{ perspective: '1200px' }}
      >
        {/* Spatial Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              style={{ rotateX, rotateY, scale: 1.1 }}
              className="absolute inset-0 opacity-[0.15] bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem]"
            />
            <motion.div 
              animate={{ x: [0, 50, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-brand-accent/20 rounded-full blur-[160px]"
            />
            <motion.div 
              animate={{ x: [0, -30, 0], y: [0, 60, 0] }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute top-[30%] -right-[5%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[160px]"
            />
        </div>

        <motion.div 
          style={{ rotateX, rotateY }}
          className="text-center max-w-6xl relative z-10 transform-gpu"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 mb-8 px-6 py-2 rounded-full border border-brand-accent/30 bg-brand-accent/10 backdrop-blur-xl text-brand-accent text-sm font-bold tracking-[0.2em] uppercase"
          >
             <Zap className="w-4 h-4 fill-brand-accent" /> Engineering the future of web
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-7xl md:text-9xl font-black text-white mb-8 leading-[0.85] tracking-tighter"
          >
            THE CODE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent via-white to-purple-400 drop-shadow-[0_0_30px_rgba(34,211,238,0.4)]">
              DIMENSION.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-3xl text-slate-400 mb-14 max-w-3xl mx-auto leading-relaxed font-light"
          >
            Advanced React blueprints, architectural deep-dives, and performance snippets for senior product engineers.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <Link 
              to="/posts" 
              className="group relative px-12 py-6 bg-brand-accent text-brand-darker font-black rounded-2xl hover:bg-brand-accentHover transition-all flex items-center gap-3 text-xl shadow-[0_20px_50px_rgba(34,211,238,0.3)] overflow-hidden"
            >
              <span className="relative z-10">ENTER LIBRARY</span>
              <ArrowRight className="relative z-10 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              <motion.div className="absolute inset-0 bg-white/20" initial={{ x: "-100%" }} whileHover={{ x: "100%" }} transition={{ duration: 0.5 }} />
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-slate-800/50 pt-12 max-w-4xl mx-auto"
          >
            {[
              { label: 'Articles', val: '150+' },
              { label: 'Architects', val: '5k+' },
              { label: 'Uptime', val: '99.9%' },
              { label: 'Snippets', val: '2.4k' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl font-black text-white mb-1 tracking-tighter">{stat.val}</p>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Feature Section */}
      <section className="py-40 relative z-10 bg-brand-darker">
        <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-24">
                <h2 className="text-4xl md:text-6xl font-black text-white mb-6 italic tracking-tighter">CORE MODULES</h2>
                <div className="w-24 h-1 bg-brand-accent mx-auto rounded-full" />
            </div>
            <div className="grid lg:grid-cols-3 gap-12">
                {[
                  { icon: Code, title: 'Atomic Snippets', desc: 'Pre-vetted React components and hooks for immediate implementation.', color: 'text-brand-accent' },
                  { icon: Terminal, title: 'Expert Logic', desc: 'Deep-dives into state machines, auth flows, and edge computing.', color: 'text-purple-400' },
                  { icon: Shield, title: 'Secure Patterns', desc: 'Hardened security standards for enterprise-grade applications.', color: 'text-emerald-400' }
                ].map((feat, i) => (
                  <motion.div key={i} whileHover={{ scale: 1.02, y: -5 }} className="group p-12 bg-slate-900/30 rounded-[3rem] border border-slate-800/60 hover:border-brand-accent/40 transition-all duration-500">
                    <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mb-10 group-hover:bg-brand-accent transition-colors">
                        <feat.icon className={`w-10 h-10 ${feat.color} group-hover:text-brand-darker transition-colors`} />
                    </div>
                    <h3 className="text-3xl font-black text-white mb-6 uppercase tracking-tighter italic">{feat.title}</h3>
                    <p className="text-slate-400 text-lg leading-relaxed">{feat.desc}</p>
                  </motion.div>
                ))}
            </div>
        </div>
      </section>

      {/* Latest Content */}
      <section className="py-40 bg-brand-dark">
        <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                <div className="max-w-2xl">
                    <h2 className="text-5xl md:text-7xl font-black text-white mb-6 italic tracking-tight">FRESH DROPS</h2>
                    <p className="text-slate-500 text-xl font-medium">New engineering patterns added every 48 hours.</p>
                </div>
                <Link to="/posts" className="group flex items-center gap-4 bg-brand-accent/5 hover:bg-brand-accent/10 px-10 py-5 rounded-2xl border border-brand-accent/20 transition-all font-bold text-brand-accent">
                    BROWSE ALL <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
                {featuredPosts.map((post, idx) => {
                    const safeTitle = getSafeString(post.title, 'Untitled Entry');
                    const safeCategory = getSafeString(post.category, 'General');
                    const safeExcerpt = getSafeString(post.excerpt, 'No summary available.');

                    return (
                        <motion.div key={post.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.2 }} className="group flex flex-col h-full bg-slate-900/20 rounded-[2.5rem] overflow-hidden border border-slate-800/80 hover:border-brand-accent/30 transition-all shadow-xl">
                            <div className="relative h-72 overflow-hidden">
                                <img src={post.imageUrl} alt={safeTitle} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000" />
                                <div className="absolute inset-0 bg-gradient-to-t from-brand-darker via-transparent to-transparent"></div>
                                <div className="absolute bottom-6 left-6">
                                    <span className="bg-brand-accent text-brand-darker text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest shadow-xl">
                                        {safeCategory}
                                    </span>
                                </div>
                            </div>
                            <div className="p-10 flex flex-col flex-grow">
                                <h3 className="text-2xl font-black text-white mb-6 group-hover:text-brand-accent transition-colors leading-tight italic tracking-tight">
                                    {safeTitle}
                                </h3>
                                <p className="text-slate-500 text-sm mb-10 line-clamp-3 leading-relaxed font-medium">
                                    {safeExcerpt}
                                </p>
                                <div className="mt-auto flex items-center justify-between">
                                    <Link to={`/posts/${post.id}`} className="text-xs font-black text-white flex items-center gap-3 group/link uppercase tracking-widest">
                                        VIEW POST <div className="w-12 h-0.5 bg-brand-accent group-hover/link:w-20 transition-all"></div>
                                    </Link>
                                    <span className="text-slate-800 text-3xl font-black italic">0{idx + 1}</span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
