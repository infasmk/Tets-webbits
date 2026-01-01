import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap } from 'lucide-react';
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion';
import { fetchPosts } from '../services/api';
import { Post } from '../types';

const Home: React.FC = () => {
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

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
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const getSafeStr = (val: any, fallback: string = ''): string => {
    if (val === null || val === undefined) return fallback;
    if (typeof val === 'string') return val === '[object Object]' ? fallback : val;
    if (typeof val === 'object') {
      const check = val.message || val.text || val.title || val.name || val.value || val.rendered;
      if (check !== undefined && check !== null && typeof check !== 'object') {
         const s = String(check);
         return s === '[object Object]' ? fallback : s;
      }
      try {
        const json = JSON.stringify(val);
        return (json === '{}' || json === '[]') ? fallback : json;
      } catch { return fallback; }
    }
    const res = String(val);
    return res === '[object Object]' ? fallback : res;
  };

  return (
    <div className="overflow-x-hidden bg-brand-darker">
      <section 
        ref={containerRef}
        className="relative min-h-screen flex items-center justify-center pt-32 pb-12 px-4"
        style={{ perspective: '1200px' }}
      >
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
        </div>

        <motion.div 
          style={{ rotateX, rotateY }}
          className="text-center max-w-6xl relative z-10 transform-gpu w-full"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 mb-8 px-6 py-2 rounded-full border border-brand-accent/30 bg-brand-accent/10 backdrop-blur-xl text-brand-accent text-[10px] md:text-sm font-bold tracking-[0.2em] uppercase"
          >
             <Zap className="w-4 h-4 fill-brand-accent" /> Engineering the future of web
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-7xl md:text-9xl font-black text-white mb-8 leading-[0.9] tracking-tighter break-words"
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
            className="text-lg md:text-3xl text-slate-400 mb-14 max-w-3xl mx-auto leading-relaxed font-light px-4"
          >
            Advanced React blueprints, architectural deep-dives, and performance snippets for senior product engineers.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center px-4"
          >
            <Link 
              to="/posts" 
              className="group relative w-full sm:w-auto px-12 py-6 bg-brand-accent text-brand-darker font-black rounded-2xl hover:bg-brand-accentHover transition-all flex items-center justify-center gap-3 text-lg md:text-xl shadow-[0_20px_50px_rgba(34,211,238,0.3)] overflow-hidden active:scale-95"
            >
              <span className="relative z-10">ENTER LIBRARY</span>
              <ArrowRight className="relative z-10 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-20 md:mt-32 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 border-t border-slate-800/50 pt-12 max-w-4xl mx-auto px-4"
          >
            {[
              { label: 'Articles', val: '150+' },
              { label: 'Architects', val: '5k+' },
              { label: 'Uptime', val: '99.9%' },
              { label: 'Snippets', val: '2.4k' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl md:text-3xl font-black text-white mb-1 tracking-tighter">{getSafeStr(stat.val)}</p>
                <p className="text-slate-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest">{getSafeStr(stat.label)}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      <section className="py-20 md:py-40 bg-brand-dark">
        <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 md:mb-20 gap-8">
                <div className="max-w-2xl">
                    <h2 className="text-5xl md:text-7xl font-black text-white mb-6 italic tracking-tight uppercase leading-none break-words">FRESH DROPS</h2>
                    <p className="text-slate-500 text-lg md:text-xl font-medium">New engineering patterns added every 48 hours.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                {featuredPosts.map((post, idx) => {
                    const safeTitle = getSafeStr(post.title, 'Untitled Entry');
                    const safeCategory = getSafeStr(post.category, 'General');
                    const safeExcerpt = getSafeStr(post.excerpt, 'No summary available.');

                    return (
                        <motion.div key={post.id} className="group flex flex-col h-full bg-slate-900/20 rounded-[2.5rem] overflow-hidden border border-slate-800/80 hover:border-brand-accent/30 transition-all shadow-xl">
                            <div className="relative h-64 md:h-72 overflow-hidden">
                                <img src={post.imageUrl} alt={safeTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute bottom-6 left-6">
                                    <span className="bg-brand-accent text-brand-darker text-[9px] md:text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest shadow-2xl">
                                        {safeCategory}
                                    </span>
                                </div>
                            </div>
                            <div className="p-8 md:p-10 flex flex-col flex-grow">
                                <h3 className="text-xl md:text-2xl font-black text-white mb-5 italic tracking-tight break-words">{safeTitle}</h3>
                                <p className="text-slate-500 text-sm mb-8 line-clamp-3 leading-relaxed font-medium">{safeExcerpt}</p>
                                <Link to={`/posts/${post.id}`} className="mt-auto text-[10px] font-black text-white flex items-center gap-3 uppercase tracking-widest hover:text-brand-accent transition-colors">
                                    VIEW POST <div className="w-12 h-0.5 bg-brand-accent"></div>
                                </Link>
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