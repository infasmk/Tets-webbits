import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { fetchPosts, deletePost } from '../../services/api';
import { Post } from '../../types';
import { Edit2, Trash2, ExternalLink, AlertTriangle, Search, X, Filter, Hash, Eye, Calendar, Plus, MoreVertical, LayoutGrid, List, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PostList: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const getSafeStr = (val: any, fallback: string = 'N/A'): string => {
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
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await fetchPosts();
      setPosts(data);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = useMemo(() => {
    if (!searchTerm.trim()) return posts;
    const search = searchTerm.toLowerCase();
    return posts.filter(post => {
      const title = getSafeStr(post.title).toLowerCase();
      const category = getSafeStr(post.category).toLowerCase();
      const tags = (Array.isArray(post.tags) ? post.tags : []).map(t => getSafeStr(t).toLowerCase());
      
      return title.includes(search) || 
             category.includes(search) || 
             tags.some(tag => tag.includes(search));
    });
  }, [posts, searchTerm]);

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await deletePost(deletingId);
      setPosts(posts.filter(p => p.id !== deletingId));
      setIsModalOpen(false);
      setDeletingId(null);
    } catch (error) {
      alert("Failed to delete post");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-black text-[10px] tracking-[0.2em] uppercase animate-pulse">Scanning Repository...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-800 pb-10">
        <div>
          <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Content Repository</h1>
          <p className="text-slate-500 mt-2 font-medium">Manage Blueprints and Knowledge Records</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="hidden sm:flex bg-brand-surface p-1 rounded-xl border border-slate-800">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-brand-accent text-brand-darker' : 'text-slate-500 hover:text-white'}`}>
                    <LayoutGrid className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-brand-accent text-brand-darker' : 'text-slate-500 hover:text-white'}`}>
                    <List className="w-4 h-4" />
                </button>
            </div>
            <Link to="/admin/post/new" className="bg-brand-accent text-brand-darker px-8 py-4 rounded-2xl font-black hover:bg-brand-accentHover transition-all flex items-center gap-2 uppercase tracking-widest text-xs shadow-lg shadow-brand-accent/20">
              <Plus className="w-4 h-4" /> Create Entry
            </Link>
        </div>
      </div>

      <div className="relative w-full group">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-brand-accent transition-colors">
            <Search className="w-5 h-5" />
        </div>
        <input 
          type="text" 
          placeholder="Filter by title, category, or implementation tags..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-brand-surface border border-slate-800 rounded-2xl pl-14 pr-6 py-5 text-white focus:border-brand-accent/50 outline-none text-sm transition-all shadow-xl font-medium"
        />
      </div>

      <motion.div layout className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10" : "flex flex-col gap-6"}>
        <AnimatePresence mode="popLayout">
          {filteredPosts.map((post, idx) => {
            const safeTitle = getSafeStr(post.title, 'Untitled');
            const safeCategory = getSafeStr(post.category, 'General');
            const safeId = getSafeStr(post.id, 'ID');
            const tags = Array.isArray(post.tags) ? post.tags : [];
            const views = typeof post.views === 'number' ? post.views : 0;

            return (
              <motion.div 
                layout 
                key={safeId}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -5 }}
                className={`group bg-brand-surface border border-slate-800/60 rounded-[2.5rem] md:rounded-[3rem] overflow-hidden hover:border-brand-accent/40 flex flex-col shadow-2xl transition-all duration-300 ${viewMode === 'list' ? 'md:flex-row h-auto md:h-48' : 'h-full'}`}
              >
                <div className={`${viewMode === 'list' ? 'w-full md:w-64 h-48 md:h-full shrink-0' : 'h-60'} relative overflow-hidden`}>
                  <img src={post.imageUrl || 'https://images.unsplash.com/photo-1618477247222-acbdb0e159b3'} alt={safeTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-darker/60 to-transparent" />
                  <div className="absolute top-4 left-4 md:top-6 md:left-6">
                    <span className="bg-brand-accent text-brand-darker text-[9px] font-black px-4 py-2 rounded-xl uppercase tracking-widest shadow-2xl backdrop-blur-md">
                        {safeCategory}
                    </span>
                  </div>
                </div>

                <div className="p-8 md:p-10 flex flex-col flex-grow justify-between">
                  <div>
                    <h3 className="font-black text-white text-xl md:text-2xl mb-4 group-hover:text-brand-accent transition-colors italic tracking-tight leading-tight">
                        {safeTitle}
                    </h3>
                    
                    {/* Tags List */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="flex items-center gap-1 text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-500 bg-slate-900/50 px-2.5 py-1 rounded-lg border border-slate-800">
                                <Hash className="w-2.5 h-2.5 text-brand-accent/50" /> {getSafeStr(tag)}
                            </span>
                        ))}
                        {tags.length > 3 && (
                            <span className="text-[9px] font-black text-slate-600 self-center">+{tags.length - 3}</span>
                        )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-800/50">
                      <div className="flex items-center gap-4 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                        <div className="flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5" />
                            {views.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                          <Link to={`/admin/post/edit/${safeId}`} className="w-10 h-10 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-brand-accent hover:border-brand-accent transition-all">
                              <Edit2 className="w-4 h-4" />
                          </Link>
                          <button onClick={() => { setDeletingId(safeId); setIsModalOpen(true); }} className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all">
                              <Trash2 className="w-4 h-4" />
                          </button>
                      </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* No results state */}
      {!loading && filteredPosts.length === 0 && (
          <div className="py-20 text-center bg-brand-surface rounded-[3rem] border border-slate-800 border-dashed">
              <div className="w-16 h-16 bg-brand-darker rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="text-slate-700 w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-2">No Records Found</h3>
              <p className="text-slate-500 font-medium">Try adjusting your search filters or create a new blueprint.</p>
              <button onClick={() => setSearchTerm('')} className="mt-8 text-brand-accent font-black uppercase tracking-widest text-[10px] hover:underline">Clear Filter</button>
          </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-brand-darker/90 backdrop-blur-sm" />
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-brand-surface border border-slate-800 p-10 md:p-14 rounded-[3rem] md:rounded-[4rem] max-w-md w-full relative z-10 shadow-3xl text-center"
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-500/20">
                  <Trash2 className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-3xl font-black text-white mb-4 italic tracking-tighter uppercase leading-none">Execute Purge?</h3>
              <p className="text-slate-500 font-medium mb-10">This will permanently delete the blueprint from the central repository. This action cannot be undone.</p>
              
              <div className="flex flex-col gap-4">
                <button onClick={confirmDelete} className="w-full py-5 bg-red-500 text-white font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 active:scale-95">Purge Record</button>
                <button onClick={() => setIsModalOpen(false)} className="w-full py-5 bg-slate-800 text-white font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-slate-700 transition-all active:scale-95">Abort Mission</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PostList;