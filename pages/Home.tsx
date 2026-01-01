import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Code, Cpu, Shield, Globe, Eye, Calendar, Hash } from 'lucide-react';
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion';
import { fetchPosts } from '../services/api';
import { Post } from '../types';

const Particle: React.FC<{ delay: number, x: string, y: string, size: number, index: number }> = ({ delay, x, y, size, index }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0, 0.4, 0], 
      scale: [0, 1, 0.5],
      y: ["0%", "-20%"],
      x: ["0%", index % 2 === 0 ? "5%" : "-5%"]
    }}
    transition={{ 
      duration: 10 + Math.random() * 10, 
      repeat: Infinity, 
      delay,
      ease: "easeInOut" 
    }}
    className="absolute rounded-full bg-brand-accent/40 blur-[1px]"
    style={{ left: x, top: y, width: size, height: size }}
  />
);

const Home: React.FC = () => {
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-400, 400], [10, -10]), { stiffness: 50, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-400, 400], [-10, 10]), { stiffness: 50, damping: 20 });
  const transX = useSpring(useTransform(mouseX, [-400, 400], [-15, 15]), { stiffness: 50, damping: 20 });
  const transY = useSpring(useTransform(mouseY, [-400, 400], [-15, 15]), { stiffness: 50, damping: 20 });

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
    return String(val);
  };

  return (
    <div className="overflow-x-hidden bg-brand-darker text-slate-100">
      {/* HERO SECTION */}
      <section 
        ref={containerRef}
        className="relative min-h-screen flex items-center justify-center pt-28 pb-40 px-4 overflow-hidden"
        style={{ perspective: '2000px' }}
      >
        <div className="absolute inset-0 pointer-events-none">
            {/* Grid Floor Effect */}
            <motion.div 
              style={{ rotateX, rotateY, scale: 1.1, x: transX, y: transY }}
              className="absolute inset-0 opacity-[0.15] bg-[linear-gradient(to_right,#22d3ee_1px,transparent_1px),linear-gradient(to_bottom,#22d3ee_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_60%,transparent_100%)]"
            />
            
            {/* Ambient Lighting */}
            <motion.div 
              animate={{ x: [0, 50, 0], opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 10, repeat: Infinity }}
              className="absolute top-1/4 -left-1/4 w-[80vw] h-[80vw] bg-brand-accent rounded-full blur-[180px]"
            />
            <motion.div 
              animate={{ x: [0, -50, 0], opacity: [0.05, 0.15, 0.05] }}
              transition={{ duration: 12, repeat: Infinity }}
              className="absolute bottom-1/4 -right-1/4 w-[60vw] h-[60vw] bg-purple-600 rounded-full blur-[150px]"
            />

            {[...Array(30)].map((_, i) => (
              <Particle 
                key={i} 
                index={i}
                delay={i * 0.3} 
                x={`${Math.random() * 100}%`} 
                y={`${Math.random() * 100}%`} 
                size={Math.random() * 4 + 2} 
              />
            ))}
        </div>

        <motion.div 
          style={{ rotateX, rotateY, x: transX, y: transY }}
          className="text-center max-w-6xl relative z-10 transform-gpu w-full"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 mb-10 px-6 py-2 rounded-full border border-brand-accent/30 bg-brand-accent/10 backdrop-blur-xl text-brand-accent text-[10px] md:text-xs font-black tracking-[0.3em] uppercase shadow-[0_0_30px_rgba(34,211,238,0.2)]"
          >
             <Zap className="w-3 h-3 md:w-4 md:h-4 fill-brand-accent" />
             Core Engineering Matrix
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl sm:text-8xl md:text-9xl lg:text-[11rem] font-black text-white mb-8 leading-[0.85] tracking-tighter italic select-none"
          >
            THE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent via-white to-brand-accent animate-pulse-slow">
              BLUEPRINT
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-base md:text-2xl lg:text-3xl text-slate-400 mb-14 max-w-4xl mx-auto leading-relaxed font-light px-6 italic"
          >
            Next-gen architectural patterns and production-ready code blocks for modern web engineers.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex justify-center"
          >
            <Link 
              to="/posts" 
              className="group relative px-12 py-6 md:px-20 md:py-8 bg-brand-accent text-brand-darker font-black rounded-2xl hover:bg-white transition-all duration-500 flex items-center justify-center gap-4 text-xl md:text-2xl shadow-[0_0_50px_rgba(34,211,238,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] active:scale-95 overflow-hidden"
            >
              <span className="relative z-10">INITIALIZE ACCESS</span>
              <ArrowRight className="relative z-10 w-6 h-6 md:w-8 md:h-8 group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Technical Transition Line */}
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-accent/50 to-transparent">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-4 bg-brand-accent/20 blur-xl"></div>
        </div>
      </section>

      {/* CONTENT DROPS SECTION */}
      <section className="py-32 bg-brand-dark relative">
        <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-24 gap-8">
                <div className="max-w-3xl">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="inline-block bg-brand-accent/10 border border-brand-accent/20 text-brand-accent px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest mb-6"
                    >
                        Syncing Records
                    </motion.div>
                    <h2 className="text-6xl md:text-9xl font-black text-white mb-6 italic tracking-tighter uppercase leading-[0.85]">SYSTEM <br /><span className="text-slate-800">UPDATES</span></h2>
                    <p className="text-slate-400 text-xl md:text-2xl border-l-2 border-brand-accent/30 pl-8 max-w-2xl leading-relaxed italic">
                      Fresh drops from the engineering core.
                    </p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                {featuredPosts.map((post, idx) => {
                    const safeTitle = getSafeStr(post.title, 'Untitled');
                    const safeCategory = getSafeStr(post.category, 'General');
                    const tags = Array.isArray(post.tags) ? post.tags : [];
                    const views = Number(post.views) || 0;

                    return (
                        <motion.div 
                            key={post.id}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.15 }}
                            className="group flex flex-col h-full bg-brand-surface/40 backdrop-blur-md rounded-[2.5rem] overflow-hidden border border-slate-800/60 hover:border-brand-accent/40 transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5),0_0_20px_rgba(34,211,238,0.1)] hover:-translate-y-2 relative"
                        >
                            {/* Visual Layer: Subtle Hover Glow */}
                            <div className="absolute -inset-px bg-gradient-to-br from-brand-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-[2.5rem]"></div>
                            
                            <div className="relative h-64 overflow-hidden">
                                <img src={post.imageUrl} alt={safeTitle} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" />
                                <div className="absolute inset-0 bg-gradient-to-t from-brand-darker/90 via-transparent to-transparent" />
                                <div className="absolute bottom-6 left-6">
                                    <span className="bg-brand-accent/80 backdrop-blur-md text-brand-darker text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-[0.2em] shadow-2xl border border-white/20">
                                        {safeCategory}
                                    </span>
                                </div>
                            </div>
                            <div className="p-8 flex flex-col flex-grow relative z-10">
                                <h3 className="text-2xl font-black text-white mb-4 italic tracking-tight group-hover:text-brand-accent transition-colors leading-tight">
                                    {safeTitle}
                                </h3>
                                
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {tags.slice(0, 3).map((tag, i) => (
                                        <span key={i} className="text-[10px] font-black uppercase tracking-widest bg-brand-darker/60 text-slate-400 px-3 py-1.5 rounded-lg border border-slate-800/80 flex items-center gap-2 hover:border-brand-accent/40 transition-all">
                                            <Hash className="w-3 h-3 text-brand-accent/40" />
                                            {getSafeStr(tag)}
                                        </span>
                                    ))}
                                </div>

                                <p className="text-slate-500 text-sm mb-8 line-clamp-2 italic font-medium leading-relaxed">
                                    {getSafeStr(post.excerpt)}
                                </p>
                                <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-800/50">
                                    <div className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        <span className="flex items-center gap-1.5 bg-brand-darker/50 px-3 py-1.5 rounded-lg border border-slate-800/50">
                                            <Eye className="w-3.5 h-3.5 text-brand-accent" /> 
                                            {views.toLocaleString()}
                                        </span>
                                        <span className="flex items-center gap-1.5 text-slate-600">
                                            <Calendar className="w-3.5 h-3.5" /> 
                                            {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                    <Link to={`/posts/${post.id}`} className="w-10 h-10 bg-slate-800/50 rounded-xl flex items-center justify-center text-brand-accent hover:bg-brand-accent hover:text-brand-darker transition-all duration-300">
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="mt-24 text-center">
                <Link to="/posts" className="inline-flex items-center gap-4 px-12 py-5 border border-slate-800 rounded-2xl text-slate-500 font-black uppercase tracking-widest text-xs hover:border-brand-accent hover:text-white transition-all active:scale-95 group">
                    DECRYPT FULL REPOSITORY <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
      </section>
    </div>
  );
};

export default Home;