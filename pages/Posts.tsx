import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPosts } from '../services/api';
import { Post } from '../types';
import { Search, ArrowRight, Eye, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Posts: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const getSafeStr = (val: any, fallback: string = ''): string => {
    if (val === null || val === undefined) return fallback;
    if (typeof val === 'string') return val === '[object Object]' ? fallback : val;
    return String(val);
  };

  useEffect(() => {
    fetchPosts().then(data => {
        setPosts(data);
        setFilteredPosts(data);
        setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const results = posts.filter(post => {
        const titleStr = getSafeStr(post.title).toLowerCase();
        const categoryStr = getSafeStr(post.category).toLowerCase();
        const tags = Array.isArray(post.tags) ? post.tags : [];
        const search = searchTerm.toLowerCase();
        return titleStr.includes(search) ||
               categoryStr.includes(search) ||
               tags.some(tag => getSafeStr(tag).toLowerCase().includes(search));
    });
    setFilteredPosts(results);
  }, [searchTerm, posts]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-32 min-h-screen">
      <div className="mb-24 text-center max-w-4xl mx-auto">
        <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-6xl md:text-8xl font-black text-white mb-6 italic tracking-tighter uppercase leading-none"
        >
            KNOWLEDGE <br /><span className="text-brand-accent">REPOSITORY</span>
        </motion.h1>
        <p className="text-slate-500 text-lg md:text-2xl font-medium max-w-2xl mx-auto italic">
            A secure collection of production-grade blueprints and technical implementation guides.
        </p>
      </div>

      <div className="max-w-3xl mx-auto mb-24 relative group px-2">
        <div className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-brand-accent transition-colors">
            <Search className="w-6 h-6" />
        </div>
        <input 
            type="text" 
            placeholder="Search the matrix..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-20 pr-10 py-8 bg-brand-surface/40 backdrop-blur-2xl border border-slate-800 rounded-3xl text-white outline-none focus:border-brand-accent/50 transition-all text-xl font-medium shadow-3xl"
        />
      </div>

      {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6">
              <div className="w-16 h-16 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-600 font-black uppercase tracking-widest text-xs animate-pulse">Syncing Database...</p>
          </div>
      ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            <AnimatePresence mode="popLayout">
                {filteredPosts.map((post, idx) => {
                    const safeTitle = getSafeStr(post.title, 'Untitled');
                    const safeCategory = getSafeStr(post.category, 'General');
                    const tags = Array.isArray(post.tags) ? post.tags : [];
                    const views = Number(post.views) || 0;

                    return (
                        <motion.div 
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: idx * 0.05 }}
                            className="group bg-brand-surface/30 backdrop-blur-md rounded-[2.5rem] overflow-hidden border border-slate-800/60 hover:border-brand-accent/50 transition-all duration-500 flex flex-col h-full hover:shadow-[0_0_50px_-15px_rgba(34,211,238,0.25)] hover:-translate-y-2"
                        >
                            <Link to={`/posts/${post.id}`} className="block h-64 overflow-hidden relative">
                                <img src={post.imageUrl || 'https://images.unsplash.com/photo-1618477247222-acbdb0e159b3'} alt={safeTitle} className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000" />
                                <div className="absolute top-6 left-6">
                                    <span className="bg-brand-darker/80 backdrop-blur-md text-brand-accent text-[9px] font-black px-4 py-2 rounded-xl uppercase tracking-widest border border-brand-accent/20">
                                        {safeCategory}
                                    </span>
                                </div>
                            </Link>
                            <div className="p-10 flex flex-col flex-grow">
                                <h3 className="text-2xl font-black text-white mb-4 group-hover:text-brand-accent transition-colors italic tracking-tight leading-tight">
                                    <Link to={`/posts/${post.id}`}>{safeTitle}</Link>
                                </h3>
                                
                                <div className="flex flex-wrap gap-2 mb-8">
                                    {tags.slice(0, 3).map((tag, i) => (
                                        <span key={i} className="text-[8px] font-black uppercase tracking-widest bg-slate-900 text-slate-500 px-2.5 py-1 rounded-md border border-slate-800">
                                            #{getSafeStr(tag)}
                                        </span>
                                    ))}
                                </div>

                                <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-800/50">
                                    <div className="flex items-center gap-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                                        <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> {views.toLocaleString()}</span>
                                    </div>
                                    <Link to={`/posts/${post.id}`} className="flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest group-hover:text-brand-accent transition-colors">
                                        DECRYPT <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
          </div>
      )}

      {!loading && filteredPosts.length === 0 && (
          <div className="py-40 text-center border border-dashed border-slate-800 rounded-[3rem] bg-brand-surface/20">
              <h3 className="text-3xl font-black text-slate-700 italic uppercase tracking-tighter mb-4">No matching records found</h3>
              <button onClick={() => setSearchTerm('')} className="text-brand-accent font-black uppercase tracking-widest text-xs hover:underline">Reset Search Filters</button>
          </div>
      )}
    </div>
  );
};

export default Posts;