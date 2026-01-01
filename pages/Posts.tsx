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

  useEffect(() => {
    fetchPosts().then(data => {
        setPosts(data);
        setFilteredPosts(data);
        setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const getSafeStr = (val: any, fallback: string = ''): string => {
    if (val === null || val === undefined) return fallback;
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
      const nested = val.name || val.title || val.label || val.text || val.value;
      if (nested !== undefined && nested !== null && typeof nested !== 'object') return String(nested);
      return fallback;
    }
    return String(val);
  };

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="mb-20 text-center">
        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 italic tracking-tighter uppercase">Knowledge Base</h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-lg font-medium">Access our proprietary knowledge base of production-vetted web patterns.</p>
      </div>

      <div className="max-w-2xl mx-auto mb-24 relative">
        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-500" />
        </div>
        <input 
            type="text"
            placeholder="Search blueprints, tags, or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-6 py-6 bg-brand-surface border border-slate-700/50 rounded-[2rem] text-white focus:outline-none focus:ring-4 focus:ring-brand-accent/10 focus:border-brand-accent transition-all shadow-2xl text-lg font-medium"
        />
      </div>

      {loading ? (
          <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
      ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredPosts.map((post, idx) => {
                const safeTitle = getSafeStr(post.title, 'Untitled');
                const safeCategory = getSafeStr(post.category, 'General');
                const waLink = `https://wa.me/9745019658?text=${encodeURIComponent(`I'm interested in customising: ${safeTitle}`)}`;

                return (
                    <motion.div 
                        key={post.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: idx * 0.05 }}
                        className="group bg-brand-surface rounded-[2.5rem] overflow-hidden border border-slate-800/80 hover:border-brand-accent/40 transition-all hover:shadow-2xl flex flex-col h-full"
                    >
                        <Link to={`/posts/${post.id}`} className="block h-64 overflow-hidden relative">
                            <img src={post.imageUrl || 'https://images.unsplash.com/photo-1618477247222-acbdb0e159b3'} alt={safeTitle} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000" />
                            <div className="absolute top-6 left-6 z-20">
                                <span className="bg-brand-accent text-brand-darker text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest shadow-xl">
                                    {safeCategory}
                                </span>
                            </div>
                        </Link>
                        <div className="p-8 flex flex-col flex-grow">
                            <h3 className="text-2xl font-black text-white mb-4 group-hover:text-brand-accent transition-colors leading-tight italic tracking-tight">
                                <Link to={`/posts/${post.id}`}>
                                    {safeTitle}
                                </Link>
                            </h3>
                            <p className="text-slate-500 text-sm mb-8 line-clamp-3 flex-grow font-medium leading-relaxed">
                                {getSafeStr(post.excerpt)}
                            </p>
                            
                            <div className="mt-auto space-y-4">
                                <div className="pt-6 border-t border-slate-800/50 flex justify-between items-center text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                    <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Recent Entry'}</span>
                                    <span className="text-slate-400">{Number(post.views || 0).toLocaleString()} Views</span>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <Link 
                                        to={`/posts/${post.id}`}
                                        className="flex items-center justify-center gap-2 py-3.5 bg-brand-darker text-white border border-slate-800 rounded-xl font-black text-[9px] uppercase tracking-widest hover:border-brand-accent transition-all"
                                    >
                                        Details <ArrowRight className="w-3 h-3" />
                                    </Link>
                                    <a 
                                        href={waLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 py-3.5 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-[#25D366] hover:text-white transition-all"
                                    >
                                        <MessageCircle className="w-3 h-3" fill="currentColor" /> Customize
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