import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPosts } from '../services/api';
import { Post } from '../types';
import { Search, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Posts: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

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
    <div className="max-w-7xl mx-auto px-6 sm:px-8 py-24 md:py-32">
      <div className="mb-16 md:mb-24 text-center">
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-white mb-6 italic tracking-tighter uppercase leading-none break-words">Intelligence</h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-lg md:text-xl font-medium">Production-vetted engineering patterns for high-tier products.</p>
      </div>

      <div className="max-w-2xl mx-auto mb-16 md:mb-24 relative group px-2">
        <div className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-accent transition-colors">
            <Search className="w-6 h-6" />
        </div>
        <input 
            type="text" 
            placeholder="Search blueprints..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-8 py-6 md:py-7 bg-brand-surface border border-slate-700/50 rounded-2xl md:rounded-[2.5rem] text-white outline-none focus:border-brand-accent transition-all text-base md:text-lg font-medium shadow-2xl"
        />
      </div>

      {loading ? (
          <div className="flex justify-center py-40">
              <div className="w-16 h-16 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
      ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {filteredPosts.map((post, idx) => {
                const safeTitle = getSafeStr(post.title, 'Untitled Entry');
                const safeCategory = getSafeStr(post.category, 'General');
                const safeExcerpt = getSafeStr(post.excerpt);
                const waLink = `https://wa.me/9745019658?text=${encodeURIComponent(`I'm interested in customising: ${safeTitle}`)}`;

                return (
                    <motion.div 
                        key={post.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group bg-brand-surface rounded-[2.5rem] md:rounded-[3rem] overflow-hidden border border-slate-800/80 hover:border-brand-accent/50 transition-all flex flex-col h-full shadow-lg"
                    >
                        <Link to={`/posts/${post.id}`} className="block h-56 md:h-64 overflow-hidden relative">
                            <img src={post.imageUrl || 'https://images.unsplash.com/photo-1618477247222-acbdb0e159b3'} alt={safeTitle} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute top-5 left-5 md:top-6 md:left-6 z-20">
                                <span className="bg-brand-accent text-brand-darker text-[8px] md:text-[9px] font-black px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl uppercase tracking-widest shadow-2xl">
                                    {safeCategory}
                                </span>
                            </div>
                        </Link>
                        <div className="p-8 md:p-10 flex flex-col flex-grow">
                            <h3 className="text-xl md:text-2xl font-black text-white mb-4 md:mb-5 group-hover:text-brand-accent transition-colors italic tracking-tight break-words">
                                <Link to={`/posts/${post.id}`}>{safeTitle}</Link>
                            </h3>
                            <p className="text-slate-500 text-sm mb-8 md:mb-10 line-clamp-3 flex-grow font-medium leading-relaxed italic">
                                {safeExcerpt}
                            </p>
                            
                            <div className="mt-auto grid grid-cols-2 gap-3 md:gap-4">
                                <Link 
                                    to={`/posts/${post.id}`}
                                    className="flex items-center justify-center gap-2 py-4 bg-brand-darker text-white border border-slate-800 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:border-brand-accent transition-all active:scale-95"
                                >
                                    Details <ArrowRight className="w-3 h-3" />
                                </Link>
                                <a 
                                    href={waLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 py-4 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-[#25D366] hover:text-white transition-all shadow-xl active:scale-95"
                                >
                                    Customize
                                </a>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
          </div>
      )}
    </div>
  );
};

export default Posts;