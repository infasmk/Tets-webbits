import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPosts } from '../services/api';
import { Post } from '../types';
import { Search, MessageCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Posts: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const getSafeStr = (val: any, fallback: string = ''): string => {
    if (val === null || val === undefined) return fallback;
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
      const check = val.title || val.name || val.text || val.value || val.label;
      if (check && typeof check !== 'object') return String(check);
      try { return JSON.stringify(val) === '{}' ? fallback : JSON.stringify(val); } catch { return fallback; }
    }
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="mb-24 text-center">
        <h1 className="text-6xl md:text-8xl font-black text-white mb-6 italic tracking-tighter uppercase">Intelligence</h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-xl font-medium">Production-vetted engineering patterns for high-tier products.</p>
      </div>

      <div className="max-w-2xl mx-auto mb-24 relative group">
        <div className="absolute inset-y-0 left-0 pl-7 flex items-center pointer-events-none transition-transform group-focus-within:-translate-x-1">
            <Search className="h-6 w-6 text-slate-500" />
        </div>
        <input 
            type="text" 
            placeholder="Search blueprints, tags, or categories..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-8 py-7 bg-brand-surface border border-slate-700/50 rounded-[2.5rem] text-white focus:outline-none focus:ring-4 focus:ring-brand-accent/10 focus:border-brand-accent transition-all shadow-2xl text-lg font-medium"
        />
      </div>

      {loading ? (
          <div className="flex justify-center py-40">
              <div className="w-16 h-16 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
      ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredPosts.map((post, idx) => {
                const safeTitle = getSafeStr(post.title, 'Untitled Entry');
                const safeCategory = getSafeStr(post.category, 'General');
                const waLink = `https://wa.me/9745019658?text=${encodeURIComponent(`I'm interested in customising: ${safeTitle}`)}`;

                return (
                    <motion.div 
                        key={post.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: idx * 0.08 }}
                        className="group bg-brand-surface rounded-[3rem] overflow-hidden border border-slate-800/80 hover:border-brand-accent/50 transition-all hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] flex flex-col h-full"
                    >
                        <Link to={`/posts/${post.id}`} className="block h-64 overflow-hidden relative">
                            <img src={post.imageUrl || 'https://images.unsplash.com/photo-1618477247222-acbdb0e159b3'} alt={safeTitle} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-[1.5s]" />
                            <div className="absolute top-6 left-6 z-20">
                                <span className="bg-brand-accent text-brand-darker text-[9px] font-black px-4 py-2 rounded-xl uppercase tracking-widest shadow-2xl">
                                    {safeCategory}
                                </span>
                            </div>
                        </Link>
                        <div className="p-10 flex flex-col flex-grow">
                            <h3 className="text-2xl font-black text-white mb-5 group-hover:text-brand-accent transition-colors leading-tight italic tracking-tight">
                                <Link to={`/posts/${post.id}`}>{safeTitle}</Link>
                            </h3>
                            <p className="text-slate-500 text-sm mb-10 line-clamp-3 flex-grow font-medium leading-relaxed italic">
                                {getSafeStr(post.excerpt)}
                            </p>
                            
                            <div className="mt-auto space-y-6">
                                <div className="pt-6 border-t border-slate-800/50 flex justify-between items-center text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                    <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Active'}</span>
                                    <span className="text-slate-400">{Number(post.views || 0).toLocaleString()} Hits</span>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <Link 
                                        to={`/posts/${post.id}`}
                                        className="flex items-center justify-center gap-2 py-4 bg-brand-darker text-white border border-slate-800 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-brand-accent transition-all group/btn"
                                    >
                                        Details <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                                    </Link>
                                    <a 
                                        href={waLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 py-4 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#25D366] hover:text-white transition-all shadow-xl group/wa"
                                    >
                                        <MessageCircle className="w-3.5 h-3.5 group-hover/wa:scale-110 transition-transform" fill="currentColor" /> Customize
                                    </a>
                                </div>
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